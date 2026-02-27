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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'

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
  // Justiça Federal
  { value: '01', label: 'TRF1 - 1ª Região' },
  { value: '02', label: 'TRF2 - 2ª Região' },
  { value: '03', label: 'TRF3 - 3ª Região' },
  { value: '04', label: 'TRF4 - 4ª Região' },
  { value: '05', label: 'TRF5 - 5ª Região' },
  { value: '06', label: 'TRF6 - 6ª Região' },
  // Principais TJs
  { value: '26', label: 'TJSP - São Paulo' },
  { value: '19', label: 'TJRJ - Rio de Janeiro' },
  { value: '05', label: 'TJBA - Bahia' },
  { value: '13', label: 'TJMG - Minas Gerais' },
  { value: '07', label: 'TJDFT - Distrito Federal' },
  { value: '16', label: 'TJPR - Paraná' },
  { value: '21', label: 'TJRS - Rio Grande do Sul' },
  // Justiça do Trabalho (Exemplos)
  { value: '02', label: 'TRT2 - São Paulo' },
  { value: '01', label: 'TRT1 - Rio de Janeiro' },
  { value: '03', label: 'TRT3 - Minas Gerais' },
  { value: '05', label: 'TRT5 - Bahia' },
]

export function ProcessesSearchByNumber({ clients = [] }: { clients?: { id: string, name: string }[] }) {
  const [processNumberInput, setProcessNumberInput] = useState('')
  const [tribunal, setTribunal] = useState<string>('26')

  const [results, setResults] = useState<ProcessMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateInfo, setRateInfo] = useState<{ label: string; value: string }[] | null>(null)

  const [importingProcess, setImportingProcess] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<string>('default')
  const [isImporting, setIsImporting] = useState<Record<string, boolean>>({})
  const [importStatus, setImportStatus] = useState<Record<string, { status: string, message?: string }>>({})

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

        if (body && 'retryAfterSeconds' in body && body.retryAfterSeconds != null) {
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
              <div className="space-y-4 pr-4">
                {results.map((p) => (
                  <div key={`${p.court}:${p.processNumber}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border hover:bg-slate-50 transition-colors shadow-sm bg-white">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">{formatCNJFromDigits(p.processNumber)}</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">{p.court}</Badge>
                      </div>
                      <div className="text-xs text-slate-500">
                        Última atualização: {formatLastUpdate(p.lastUpdate)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        href={`/dashboard/processes/${p.court}-${formatCNJFromDigits(p.processNumber)}`}
                        className="flex-1 sm:flex-none text-center px-4 py-2 text-sm font-medium border rounded-md hover:bg-slate-100 transition-colors"
                      >
                        Visualizar
                      </Link>

                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          setImportingProcess(p.processNumber)
                        }}
                        className={`flex-1 sm:flex-none transition-colors ${importStatus[p.processNumber]?.status === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                            importStatus[p.processNumber]?.status === 'duplicate' ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200' : ''
                          }`}
                        variant={importStatus[p.processNumber]?.status === 'duplicate' ? 'outline' : 'default'}
                        disabled={isImporting[p.processNumber]}
                      >
                        {isImporting[p.processNumber] ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Importando...
                          </>
                        ) : importStatus[p.processNumber]?.status === 'success' ? (
                          'Importado ✅'
                        ) : importStatus[p.processNumber]?.status === 'duplicate' ? (
                          'Já existe'
                        ) : (
                          'Importar'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!importingProcess} onOpenChange={(open) => !open && setImportingProcess(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Processo</DialogTitle>
            <DialogDescription>
              Selecione o cliente para associar a este processo. Caso não tenha, criaremos um cliente padrão.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    🏢 Criar "Cliente Padrão (Sem Vínculo)"
                  </SelectItem>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportingProcess(null)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!importingProcess) return;

                const processNum = importingProcess;

                setImportingProcess(null);
                setIsImporting(prev => ({ ...prev, [processNum]: true }));
                setImportStatus(prev => ({ ...prev, [processNum]: { status: 'loading' } }));

                try {
                  const res = await fetch('/api/datajud/batch-import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      processNumbers: [processNum],
                      clientId: selectedClient === 'default' ? null : selectedClient
                    })
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    throw new Error(data.error || 'Erro ao importar processo');
                  }

                  const resultStatus = data.results?.[0]?.status;
                  const resultMsg = data.results?.[0]?.message;

                  if (resultStatus === 'success' || resultStatus === 'not_found') {
                    setImportStatus(prev => ({ ...prev, [processNum]: { status: 'success' } }));
                  } else if (resultStatus === 'duplicate') {
                    setImportStatus(prev => ({ ...prev, [processNum]: { status: 'duplicate' } }));
                  } else {
                    throw new Error(resultMsg || 'Erro na importação');
                  }
                } catch (err: any) {
                  console.error(err);
                  setImportStatus(prev => ({ ...prev, [processNum]: { status: 'error' } }));
                  setTimeout(() => {
                    setImportStatus(prev => {
                      const copy = { ...prev };
                      delete copy[processNum];
                      return copy;
                    });
                  }, 3000);
                } finally {
                  setIsImporting(prev => ({ ...prev, [processNum]: false }));
                }
              }}
            >
              Confirmar Importação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




