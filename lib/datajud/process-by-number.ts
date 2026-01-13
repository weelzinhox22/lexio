/**
 * DataJud (CNJ) - Detalhes do processo por número (CNJ) e tribunal.
 *
 * Regras:
 * - Integração REAL via HTTP (sem mocks/fallback).
 * - Endpoint específico por tribunal:
 *   https://api-publica.datajud.cnj.jus.br/api_publica_{tribunal}/_search
 * - Backend-only: Authorization: APIKey process.env.DATAJUD_API_KEY
 * - Cache server-side (TTL 5–15 min) + dedupe de requests concorrentes.
 */

export type ProcessParty = {
  name: string
  pole: string | null
}

export type ProcessMovement = {
  date: string | null
  name: string | null
  code: number | null
}

export type DataJudProcessDetails = {
  processNumber: string
  court: string
  classe: string | null
  assunto: string | null
  orgaoJulgador: string | null
  distributionDate: string | null
  lastMovementDate: string | null
  movements: ProcessMovement[]
  parties: ProcessParty[]
}

type DataJudEsHit = { _source?: Record<string, unknown> }
type DataJudEsResponse = { hits?: { hits?: DataJudEsHit[] } }

export class DataJudInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DataJudInputError'
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
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutos (entre 5 e 15)

function getApiKey(): string {
  const key = (process.env.DATAJUD_API_KEY || '').trim()
  if (!key) throw new DataJudInputError('DATAJUD_API_KEY não configurada no backend.')
  return key
}

function sleep(ms: number) {
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

function asNumber(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
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

/**
 * Normaliza tribunal/índice no padrão público `api_publica_*`.
 * Aceita: TJBA, TRF1, TJDFT, api_publica_tjba, tjba, etc.
 */
export function normalizeTribunalToIndex(tribunal: string): { indexName: string; court: string } {
  const raw = tribunal.trim()
  if (!raw) throw new DataJudInputError('Parâmetro tribunal é obrigatório (ex: TJBA, TRF1, TJDFT).')

  const withoutPrefix = raw.replace(/^api_publica_/i, '')
  const upper = withoutPrefix.toUpperCase()

  const trfMatch = upper.match(/^TRF([1-6])$/)
  if (trfMatch) {
    const n = trfMatch[1]
    return { indexName: `api_publica_trf${n}`, court: `TRF${n}` }
  }

  if (upper === 'TJDFT') {
    return { indexName: 'api_publica_tjdft', court: 'TJDFT' }
  }

  const tjUf = upper.match(/^TJ([A-Z]{2})$/)
  if (tjUf) {
    const uf = tjUf[1]
    return { indexName: `api_publica_tj${uf.toLowerCase()}`, court: `TJ${uf}` }
  }

  const lower = withoutPrefix.toLowerCase()
  if (/^(tjdft|trf[1-6]|tj[a-z]{2})$/.test(lower)) {
    return { indexName: `api_publica_${lower}`, court: lower.toUpperCase() }
  }

  throw new DataJudInputError('Tribunal inválido. Exemplos: TJBA, TRF1, TJDFT.')
}

function buildMatchQuery(processNumber20: string) {
  return {
    query: {
      match: {
        numeroProcesso: processNumber20,
      },
    },
    size: 1,
  }
}

function extractAssunto(source: Record<string, unknown>): string | null {
  const assuntos = source['assuntos']
  if (!assuntos) return null

  // Formatos observados:
  // - assuntos: [{ codigo, nome }]
  // - assuntos: [[{ codigo, nome }], [{...}]]
  const names: string[] = []

  const pushNome = (x: any) => {
    const n = asString(x?.nome)
    if (n) names.push(n)
  }

  if (Array.isArray(assuntos)) {
    for (const item of assuntos) {
      if (Array.isArray(item)) {
        for (const inner of item) pushNome(inner)
      } else {
        pushNome(item)
      }
    }
  }

  if (names.length === 0) return null
  return names.slice(0, 3).join(' / ')
}

function extractMovements(source: Record<string, unknown>): ProcessMovement[] {
  const raw = source['movimentos']
  if (!Array.isArray(raw)) return []

  return raw.slice(0, 500).map((m: any) => ({
    date: asString(m?.dataHora) || null,
    name: asString(m?.nome) || null,
    code: asNumber(m?.codigo),
  }))
}

function pickDistributionDate(source: Record<string, unknown>, movements: ProcessMovement[]): string | null {
  const dist = movements.find((m) => m.code === 26 || (m.name || '').toLowerCase() === 'distribuição')
  if (dist?.date) return dist.date

  // fallback para dataAjuizamento se vier em ISO
  const aju = asString(source['dataAjuizamento'])
  if (aju && aju.includes('T')) return aju
  return null
}

function pickLastMovementDate(movements: ProcessMovement[]): string | null {
  let best: string | null = null
  for (const m of movements) {
    if (!m.date) continue
    if (!best) {
      best = m.date
      continue
    }
    if (new Date(m.date).getTime() > new Date(best).getTime()) {
      best = m.date
    }
  }
  return best
}

function extractParties(source: Record<string, unknown>): ProcessParty[] {
  const raw = source['partes']
  if (!Array.isArray(raw)) return []

  const parties: ProcessParty[] = []
  for (const p of raw.slice(0, 50) as any[]) {
    const name = asString(p?.nome) || asString(p?.name)
    if (!name) continue
    const pole = asString(p?.polo) || asString(p?.tipoPolo) || asString(p?.tipo) || null
    parties.push({ name, pole })
  }
  return parties
}

function simplifyHit(hit: DataJudEsHit, fallbackCourt: string): DataJudProcessDetails | null {
  const src = hit._source
  if (!src || typeof src !== 'object') return null

  const processNumber = asString((src as any).numeroProcesso)
  if (!processNumber) return null

  const court = asString((src as any).tribunal) || fallbackCourt
  const classe = asString((src as any)?.classe?.nome) || null
  const assunto = extractAssunto(src as Record<string, unknown>)
  const orgaoJulgador = asString((src as any)?.orgaoJulgador?.nome) || null

  const movements = extractMovements(src as Record<string, unknown>)
  const distributionDate = pickDistributionDate(src as Record<string, unknown>, movements)
  const lastMovementDate = pickLastMovementDate(movements) || asString((src as any).dataHoraUltimaAtualizacao) || null

  const parties = extractParties(src as Record<string, unknown>)

  return {
    processNumber,
    court,
    classe,
    assunto,
    orgaoJulgador,
    distributionDate,
    lastMovementDate,
    movements,
    parties,
  }
}

type CacheEntry = { expiresAt: number; value: DataJudProcessDetails }
const cache = new Map<string, CacheEntry>()
const inflight = new Map<string, Promise<DataJudProcessDetails | null>>()

function cacheKey(indexName: string, processNumber20: string) {
  return `${indexName}:${processNumber20}`
}

function getCached(key: string, now: number): DataJudProcessDetails | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (entry.expiresAt <= now) {
    cache.delete(key)
    return null
  }
  return entry.value
}

function setCached(key: string, value: DataJudProcessDetails, now: number) {
  cache.set(key, { value, expiresAt: now + CACHE_TTL_MS })
}

async function fetchFromDataJud(indexName: string, court: string, processNumber20: string) {
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
        body: JSON.stringify(buildMatchQuery(processNumber20)),
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
          res.status,
          endpoint,
          text.slice(0, 2000)
        )
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new DataJudUpstreamError(`Content-Type inesperado do DataJud: ${contentType}`, res.status, endpoint)
      }

      const json = (await res.json()) as DataJudEsResponse
      const hit = json.hits?.hits?.[0]
      return hit ? simplifyHit(hit, court) : null
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new DataJudUpstreamError(`Timeout ao chamar DataJud (${timeoutMs}ms).`, undefined, endpoint)
      }
      throw err
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return null
}

export async function getProcessDetailsByNumber(params: {
  tribunal: string
  processNumber: string
}): Promise<DataJudProcessDetails | null> {
  const processNumber20 = normalizeProcessNumber(params.processNumber)
  const { indexName, court } = normalizeTribunalToIndex(params.tribunal)

  const now = Date.now()
  const key = cacheKey(indexName, processNumber20)

  const cached = getCached(key, now)
  if (cached) return cached

  const existing = inflight.get(key)
  if (existing) return await existing

  const p = (async () => {
    const fresh = await fetchFromDataJud(indexName, court, processNumber20)
    if (fresh) setCached(key, fresh, Date.now())
    return fresh
  })()

  inflight.set(key, p)
  try {
    return await p
  } finally {
    inflight.delete(key)
  }
}




