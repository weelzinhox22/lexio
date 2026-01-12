'use client'

import { useCallback, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

type ProcessMetadata = {
  processNumber: string
  court: string
  lastUpdate: string | null
}

type ApiRateLimitBody =
  | {
      error: string
      limit: number
      remaining: number
      resetAt: string
    }
  | {
      error: string
      retryAfterSeconds?: number
    }

function formatLastUpdate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('pt-BR')
}

function normalizeProcessNumberInput(value: string): string {
  return value.replace(/\D/g, '')
}

function formatCNJFromDigits(digits20: string): string {
  const d = digits20.replace(/\D/g, '')
  if (d.length !== 20) return digits20
  return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13, 14)}.${d.slice(14, 16)}.${d.slice(16, 20)}`
}

const TRIBUNALS: { value: string; label: string }[] = [
  { value: 'TRF1', label: 'TRF1' },
  { value: 'TRF2', label: 'TRF2' },
  { value: 'TRF3', label: 'TRF3' },
  { value: 'TRF4', label: 'TRF4' },
  { value: 'TRF5', label: 'TRF5' },
  { value: 'TRF6', label: 'TRF6' },
  { value: 'TJDFT', label: 'TJDFT' },
  // TJs (estaduais) — MVP simples
  { value: 'TJAC', label: 'TJAC' },
  { value: 'TJAL', label: 'TJAL' },
  { value: 'TJAP', label: 'TJAP' },
  { value: 'TJAM', label: 'TJAM' },
  { value: 'TJBA', label: 'TJBA' },
  { value: 'TJCE', label: 'TJCE' },
  { value: 'TJES', label: 'TJES' },
  { value: 'TJGO', label: 'TJGO' },
  { value: 'TJMA', label: 'TJMA' },
  { value: 'TJMT', label: 'TJMT' },
  { value: 'TJMS', label: 'TJMS' },
  { value: 'TJMG', label: 'TJMG' },
  { value: 'TJPA', label: 'TJPA' },
  { value: 'TJPB', label: 'TJPB' },
  { value: 'TJPR', label: 'TJPR' },
  { value: 'TJPE', label: 'TJPE' },
  { value: 'TJPI', label: 'TJPI' },
  { value: 'TJRJ', label: 'TJRJ' },
  { value: 'TJRN', label: 'TJRN' },
  { value: 'TJRS', label: 'TJRS' },
  { value: 'TJRO', label: 'TJRO' },
  { value: 'TJRR', label: 'TJRR' },
  { value: 'TJSC', label: 'TJSC' },
  { value: 'TJSE', label: 'TJSE' },
  { value: 'TJSP', label: 'TJSP' },
  { value: 'TJTO', label: 'TJTO' },
]

export function ProcessesSearchByNumber() {
  const [processNumberInput, setProcessNumberInput] = useState('')
  const [tribunal, setTribunal] = useState<string>('TRF1')

  const [results, setResults] = useState<ProcessMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateInfo, setRateInfo] = useState<{ label: string; value: string }[] | null>(null)

  const processNumber20 = useMemo(
    () => normalizeProcessNumberInput(processNumberInput).trim(),
    [processNumberInput]
  )

  const canSearch = processNumber20.length === 20 && tribunal.length > 0 && !isLoading

  const handleSearch = useCallback(async () => {
    setError(null)
    setRateInfo(null)
    setResults([])

    if (processNumber20.length !== 20) {
      setError('Número do processo inválido. Informe 20 dígitos no padrão CNJ.')
      return
    }
    if (!tribunal) {
      setError('Selecione o tribunal.')
      return
    }

    setIsLoading(true)
    try {
      const qs = new URLSearchParams({ processNumber: processNumber20, tribunal })
      const res = await fetch(`/api/processes?${qs.toString()}`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      })

      if (res.status === 401) {
        setError('Você precisa estar logado para pesquisar.')
        return
      }

      if (res.status === 403) {
        setError('Sua sessão expirou. Faça login novamente e tente de novo.')
        return
      }

      if (res.status === 429) {
        let body: ApiRateLimitBody | null = null
        try {
          body = (await res.json()) as ApiRateLimitBody
        } catch {
          // ignore parse errors
        }

        setError(body?.error || 'Limite de requisições excedido. Tente novamente mais tarde.')

        const info: { label: string; value: string }[] = []
        const limit = res.headers.get('x-ratelimit-limit')
        const remaining = res.headers.get('x-ratelimit-remaining')
        const reset = res.headers.get('x-ratelimit-reset')
        if (limit) info.push({ label: 'Limite', value: limit })
        if (remaining) info.push({ label: 'Restante', value: remaining })
        if (reset) {
          const resetMs = Number(reset) * 1000
          if (Number.isFinite(resetMs)) {
            info.push({ label: 'Reset', value: new Date(resetMs).toLocaleString('pt-BR') })
          }
        }
        if ('retryAfterSeconds' in (body || {}) && body?.retryAfterSeconds != null) {
          info.push({ label: 'Tentar em', value: `${body.retryAfterSeconds}s` })
        }
        setRateInfo(info.length > 0 ? info : null)
        return
      }

      if (res.status === 503) {
        const body = await res.json().catch(() => null)
        setError(body?.error || 'O DataJud está indisponível no momento. Tente novamente mais tarde.')
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.error || `Erro ao buscar processo (HTTP ${res.status}).`)
        return
      }

      const data = (await res.json()) as ProcessMetadata[]
      setResults(Array.isArray(data) ? data : [])
    } finally {
      setIsLoading(false)
    }
  }, [processNumber20, tribunal])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pesquisar processo por número</CardTitle>
          <CardDescription>
            Busca pública no DataJud (CNJ). A requisição só é feita quando você clicar em “Buscar”.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Número do processo (CNJ)</label>
              <Input
                value={processNumberInput}
                onChange={(e) => setProcessNumberInput(e.target.value)}
                placeholder="Ex: 00008323520184013202"
                inputMode="numeric"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Dica: pode colar com formatação, eu limpo automaticamente (precisa totalizar 20 dígitos).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tribunal</label>
              <Select value={tribunal} onValueChange={setTribunal}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TRIBUNALS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} disabled={!canSearch} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </>
            )}
          </Button>

          {error && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <AlertDescription className="text-amber-900">
                <div className="space-y-2">
                  <div>{error}</div>
                  {rateInfo && (
                    <div className="flex flex-wrap gap-2">
                      {rateInfo.map((it) => (
                        <Badge key={it.label} variant="secondary">
                          {it.label}: {it.value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resultados</CardTitle>
          <CardDescription>{isLoading ? 'Buscando…' : `${results.length} resultado(s)`}</CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum resultado ainda.</p>
          ) : (
            <ScrollArea className="h-[420px]">
              <div className="space-y-2 pr-4">
                {results.map((p) => (
                  <Link
                    key={`${p.court}:${p.processNumber}`}
                    href={`/dashboard/processes/${p.court}-${formatCNJFromDigits(p.processNumber)}`}
                    className="block rounded border p-3 hover:bg-accent transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">{formatCNJFromDigits(p.processNumber)}</div>
                      <Badge variant="secondary">{p.court}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Última atualização: {formatLastUpdate(p.lastUpdate)}
                    </div>
                    <div className="mt-2 text-xs underline text-muted-foreground">Ver detalhes</div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




