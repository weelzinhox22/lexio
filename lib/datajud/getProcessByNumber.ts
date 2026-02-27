/**
 * DataJud (CNJ) - Busca pública por NÚMERO DO PROCESSO (CNJ)
 *
 * Docs (exemplo oficial):
 * - POST https://api-publica.datajud.cnj.jus.br/api_publica_{tribunal}/_search
 * - Body:
 *   { "query": { "match": { "numeroProcesso": "00008323520184013202" } } }
 *
 * Regras:
 * - Integração REAL via HTTP, backend-only (não expor API key).
 * - Sem mocks/fallback.
 * - Cache server-side (TTL >= 6h) + dedupe de requests concorrentes.
 */

export type DataJudProcessMetadata = {
  processNumber: string
  court: string
  lastUpdate: string | null
}

export class DataJudInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DataJudInputError'
  }
}

type DataJudEsHit = {
  _source?: Record<string, unknown>
}

type DataJudEsResponse = {
  hits?: {
    hits?: DataJudEsHit[]
  }
}

export class DataJudRateLimitError extends Error {
  readonly retryAfterSeconds?: number
  constructor(message: string, retryAfterSeconds?: number) {
    super(message)
    this.name = 'DataJudRateLimitError'
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export class DataJudUpstreamError extends Error {
  readonly status?: number
  readonly endpoint?: string
  readonly responseBody?: string
  constructor(message: string, status?: number, endpoint?: string, responseBody?: string) {
    super(message)
    this.name = 'DataJudUpstreamError'
    this.status = status
    this.endpoint = endpoint
    this.responseBody = responseBody
  }
}

const DATAJUD_BASE_URL = 'https://api-publica.datajud.cnj.jus.br'
// Cache curto (MVP custo/performance): 60s por (tribunal + numeroProcesso)
const CACHE_TTL_MS = 60 * 1000

function getApiKey(): string {
  const key = (process.env.DATAJUD_API_KEY || '').trim()
  if (!key) throw new DataJudInputError('DATAJUD_API_KEY não configurada no backend.')
  return key
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseRetryAfterSeconds(retryAfterHeader: string | null): number | undefined {
  if (!retryAfterHeader) return undefined
  const seconds = Number(retryAfterHeader)
  if (Number.isFinite(seconds) && seconds > 0) return Math.floor(seconds)
  return undefined
}

function asString(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v : null
}

function pickFirstString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const s = asString(obj[k])
    if (s) return s
  }
  return null
}

function normalizeProcessNumber(processNumber: string): string {
  const cleaned = processNumber.replace(/\D/g, '')
  if (cleaned.length !== 20) {
    throw new DataJudInputError(
      'processNumber inválido: informe 20 dígitos no padrão CNJ (sem formatação ou com formatação).'
    )
  }
  return cleaned
}

import { parseCNJNumber, getDataJudApiUrl } from '@/lib/datajud-api'

/**
 * Normaliza o tribunal para o índice público:
 */
export function normalizeTribunal(tribunal: string, branchCode?: string): { indexName: string; court: string } {
  const url = getDataJudApiUrl(tribunal, branchCode)
  if (!url) throw new DataJudInputError(`Tribunal não suportado: ${tribunal}`)

  const indexName = url.split('/').filter(p => p.startsWith('api_publica')).pop() || ''
  const courtStr = indexName.replace('api_publica_', '').toUpperCase()
  return { indexName, court: courtStr }
}

function buildMatchQuery(processNumber20: string, rawNumber: string) {
  return {
    query: {
      bool: {
        should: [
          { match: { numeroProcesso: processNumber20 } },
          { match: { numeroProcesso: rawNumber } },
          { match: { numeroCNJ: processNumber20 } },
        ],
        minimum_should_match: 1
      }
    },
    size: 20,
    sort: [{ dataHoraUltimaAtualizacao: { order: 'desc' } }],
  }
}

function simplifyHit(hit: DataJudEsHit, fallbackCourt: string): DataJudProcessMetadata | null {
  const src = hit._source
  if (!src || typeof src !== 'object') return null

  const processNumber = pickFirstString(src, ['numeroProcesso', 'numero_processo'])
  if (!processNumber) return null

  const court = pickFirstString(src, ['tribunal']) || fallbackCourt
  const lastUpdate = pickFirstString(src, ['dataHoraUltimaAtualizacao', 'dataHoraUltimaAtualizacao', '@timestamp'])

  return { processNumber, court, lastUpdate }
}

type CacheEntry = { expiresAt: number; value: DataJudProcessMetadata[] }
const cache = new Map<string, CacheEntry>()
const inflight = new Map<string, Promise<DataJudProcessMetadata[]>>()

function cacheKey(indexName: string, processNumber20: string) {
  return `${indexName}:${processNumber20}`
}

function getCached(key: string, now: number): DataJudProcessMetadata[] | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (entry.expiresAt <= now) {
    cache.delete(key)
    return null
  }
  return entry.value
}

function setCached(key: string, value: DataJudProcessMetadata[], now: number) {
  cache.set(key, { value, expiresAt: now + CACHE_TTL_MS })
}

async function fetchFromDataJud(
  indexName: string,
  court: string,
  processNumber20: string,
  rawNumber: string
): Promise<DataJudProcessMetadata[]> {
  const endpoint = `${DATAJUD_BASE_URL}/${indexName}/_search`
  const maxAttempts = 2

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController()
    const timeoutMs = 8000
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `APIKey ${getApiKey()}`,
        },
        body: JSON.stringify(buildMatchQuery(processNumber20, rawNumber)),
        signal: controller.signal,
        cache: 'no-store',
      })

      if (res.status === 429) {
        const retryAfterSeconds = parseRetryAfterSeconds(res.headers.get('retry-after'))
        if (attempt < maxAttempts) {
          await sleep(Math.min((retryAfterSeconds ?? 1) * 1000, 2000))
          continue
        }
        throw new DataJudRateLimitError('Rate limit do DataJud excedido.', retryAfterSeconds)
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const looksLikeHtml = text.includes('<!DOCTYPE') || text.includes('<html')
        throw new DataJudUpstreamError(
          looksLikeHtml
            ? `DataJud retornou HTML de erro (status ${res.status})`
            : `DataJud retornou status ${res.status}`,
          res.status
          , endpoint
          , text.slice(0, 2000)
        )
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new DataJudUpstreamError(`Content-Type inesperado do DataJud: ${contentType}`, res.status, endpoint)
      }

      const json = (await res.json()) as DataJudEsResponse
      const hits = json.hits?.hits || []
      return hits.map((h) => simplifyHit(h, court)).filter((x): x is DataJudProcessMetadata => Boolean(x))
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new DataJudUpstreamError(`Timeout ao chamar DataJud (${timeoutMs}ms).`, undefined, endpoint)
      }
      throw err
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return []
}

export async function getProcessByNumber(params: {
  tribunal: string
  processNumber: string
}): Promise<DataJudProcessMetadata[]> {
  const processNumber20 = normalizeProcessNumber(params.processNumber)

  // Tentar detectar tribunal do número CNJ para ser mais resiliente
  const parsed = parseCNJNumber(params.processNumber)
  const tribunalCode = parsed?.tribunalCode || params.tribunal
  const branchCode = parsed?.branchCode

  const { indexName, court } = normalizeTribunal(tribunalCode, branchCode)

  const now = Date.now()
  const key = cacheKey(indexName, processNumber20)

  const cached = getCached(key, now)
  if (cached) return cached

  const existing = inflight.get(key)
  if (existing) return await existing

  const p = (async () => {
    const fresh = await fetchFromDataJud(indexName, court, processNumber20, params.processNumber)
    // Cacheia inclusive resultado vazio
    setCached(key, fresh, Date.now())
    return fresh
  })()

  inflight.set(key, p)
  try {
    return await p
  } finally {
    inflight.delete(key)
  }
}




