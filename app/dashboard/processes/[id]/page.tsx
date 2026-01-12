import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getProcessDetailsByNumber } from '@/lib/datajud/process-by-number'
import { ConfirmAwarenessButton } from '@/components/deadlines/confirm-awareness-button'

export const dynamic = 'force-dynamic'

function formatCNJFromDigits(digits20: string): string {
  const d = digits20.replace(/\D/g, '')
  if (d.length !== 20) return digits20
  // NNNNNNN-DD.AAAA.J.TR.OOOO (7-2-4-1-2-4)
  return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13, 14)}.${d.slice(14, 16)}.${d.slice(16, 20)}`
}

function isDataJudProcessId(id: string): boolean {
  // Esperado: {TRIBUNAL}-{NUMERO_CNJ_FORMATADO}
  // Ex: TJBA-0001234-56.2023.8.05.0001
  const dashIdx = id.indexOf('-')
  if (dashIdx <= 0) return false
  const tribunal = id.slice(0, dashIdx).toUpperCase()
  return /^(TJ[A-Z]{2}|TJDFT|TRF[1-6])$/.test(tribunal)
}

function guessTribunalPublicUrl(court: string, systemName?: string | null): string | null {
  const sys = (systemName || '').toLowerCase()
  if (sys && sys !== 'pje') return null
  const slug = court.toLowerCase()
  if (!/^(tj[a-z]{2}|tjdft|trf[1-6])$/.test(slug)) return null
  return `https://pje1g.${slug}.jus.br/pje/ConsultaPublica/listView.seam`
}

export default async function ProcessDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { id } = await params

  // Caso 1: Detalhe de processo DataJud (TRIBUNAL-<CNJ>)
  if (isDataJudProcessId(id)) {
    const dashIdx = id.indexOf('-')
    const tribunal = id.slice(0, dashIdx)
    const processNumberFormatted = id.slice(dashIdx + 1)
    const processNumber20 = processNumberFormatted.replace(/\D/g, '')

    const details = await getProcessDetailsByNumber({
      tribunal,
      processNumber: processNumber20,
    })

    if (!details) {
      return (
        <div className="p-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processo não encontrado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Não encontramos este processo no DataJud para o tribunal informado.
              </p>
            </CardContent>
          </Card>
          <Link href="/dashboard/processes/search" className="text-sm underline">
            Voltar para pesquisa
          </Link>
        </div>
      )
    }

    const formatted = formatCNJFromDigits(details.processNumber)
    const externalUrl = guessTribunalPublicUrl(details.court, null)

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">{formatted}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{details.court}</Badge>
              {details.lastMovementDate && (
                <span className="text-xs text-muted-foreground">
                  Última movimentação: {new Date(details.lastMovementDate).toLocaleString('pt-BR')}
                </span>
              )}
            </div>
          </div>

          {externalUrl && (
            <Button asChild variant="outline">
              <a href={externalUrl} target="_blank" rel="noreferrer noopener">
                Abrir no site do tribunal
              </a>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Classe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{details.classe || '—'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assunto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{details.assunto || '—'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Órgão julgador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{details.orgaoJulgador || '—'}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Partes</CardTitle>
            </CardHeader>
            <CardContent>
              {details.parties.length === 0 ? (
                <p className="text-sm text-muted-foreground">Não disponível no DataJud para este processo.</p>
              ) : (
                <div className="space-y-2">
                  {details.parties.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3">
                      <span className="text-sm">{p.name}</span>
                      <Badge variant="secondary">{p.pole || '—'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              {details.movements.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma movimentação disponível.</p>
              ) : (
                <ScrollArea className="h-[420px]">
                  <div className="space-y-3 pr-4">
                    {details.movements
                      .slice()
                      .sort((a, b) => {
                        const ta = a.date ? new Date(a.date).getTime() : 0
                        const tb = b.date ? new Date(b.date).getTime() : 0
                        return tb - ta
                      })
                      .slice(0, 150)
                      .map((m, idx) => (
                        <div key={idx} className="rounded border p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-medium">{m.name || 'Movimentação'}</span>
                            <Badge variant="secondary">{m.code ?? '—'}</Badge>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {m.date ? new Date(m.date).toLocaleString('pt-BR') : '—'}
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-xs text-muted-foreground">
          Fonte: DataJud (CNJ). Este painel exibe apenas metadados e movimentações públicas.
        </div>
      </div>
    )
  }

  // Caso 2: detalhe de processo cadastrado no SaaS (id do Supabase)
  const { data: process, error } = await supabase
    .from('processes')
    .select('id, title, process_number, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !process) {
    redirect('/dashboard/processes')
  }

  const { data: deadlines } = await supabase
    .from('deadlines')
    .select('id, title, deadline_date, status, priority, acknowledged_at')
    .eq('user_id', user.id)
    .eq('process_id', process.id)
    .order('deadline_date', { ascending: true })

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, title, message, severity, notification_type, channel, notification_status, created_at, entity_id, meta')
    .eq('user_id', user.id)
    .eq('process_id', process.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">{process.title || 'Processo'}</h1>
          {process.process_number && (
            <p className="text-sm text-muted-foreground">{process.process_number}</p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/processes/${process.id}/edit`}>Editar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="secondary">{process.status || '—'}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prazos & Alertas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-xs text-muted-foreground">
            Alerta auxiliar — confira o prazo no teor da publicação/andamento. Não substitui conferência profissional.
          </div>

          {(deadlines || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum prazo vinculado a este processo.</p>
          ) : (
            <div className="space-y-2">
              {(deadlines || []).map((d: any) => (
                <div key={d.id} className="rounded border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{d.title}</div>
                    <ConfirmAwarenessButton deadlineId={d.id} disabled={Boolean(d.acknowledged_at)} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Data: {new Date(d.deadline_date).toLocaleString('pt-BR')} • Status: {d.status}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(notifications || []).length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-semibold">Histórico de alertas</div>
              <ScrollArea className="h-[320px]">
                <div className="space-y-2 pr-4">
                  {(notifications || []).map((n: any) => (
                    <div key={n.id} className="rounded border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium">{n.title}</div>
                        <Badge variant="secondary">{n.severity || 'info'}</Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{n.message}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleString('pt-BR')} • {n.channel} • {n.notification_status}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


