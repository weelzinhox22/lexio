import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getProcessDetailsByNumber } from '@/lib/datajud/process-by-number'
import { ConfirmAwarenessButton } from '@/components/deadlines/confirm-awareness-button'
import { WhatsAppShare } from '@/components/processes/whatsapp-share'
import { Building2, Calendar, Clock, ExternalLink, FileText, Gavel, Landmark, X, LayoutList } from 'lucide-react'
import { PortalTimelineManager } from '@/components/processes/portal-timeline-manager'

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

function getStatusBadgeStyles(status?: string | null) {
  const normalized = (status || '').toLowerCase()

  if (!normalized) {
    return 'border-slate-200 bg-slate-100 text-slate-700'
  }

  if (normalized.includes('ativo') || normalized.includes('active') || normalized.includes('andamento')) {
    return 'border-emerald-200 bg-emerald-100 text-emerald-700'
  }

  if (normalized.includes('suspenso') || normalized.includes('suspended')) {
    return 'border-amber-200 bg-amber-100 text-amber-700'
  }

  if (normalized.includes('arquivado') || normalized.includes('archived')) {
    return 'border-slate-200 bg-slate-100 text-slate-600'
  }

  if (normalized.includes('encerr') || normalized.includes('finaliz') || normalized.includes('closed')) {
    return 'border-rose-200 bg-rose-100 text-rose-700'
  }

  return 'border-slate-200 bg-slate-100 text-slate-700'
}

function isRecentMovement(dateValue?: string | null) {
  if (!dateValue) return false
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false
  const now = Date.now()
  const diff = now - date.getTime()
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000
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
    const sortedMovements = details.movements.slice().sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0
      const tb = b.date ? new Date(b.date).getTime() : 0
      return tb - ta
    })
    const recentMovementsCount = sortedMovements.filter((movement) => isRecentMovement(movement.date)).length

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">{formatted}</h1>
            <div className="flex flex-wrap items-center gap-2">
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                <Landmark className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Tribunal</div>
                <div className="text-sm font-medium text-slate-900">{details.court}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                <Gavel className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Classe</div>
                <div className="text-sm font-medium text-slate-900">{details.classe || '—'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Assunto</div>
                <div className="text-sm font-medium text-slate-900">{details.assunto || '—'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Órgão julgador</div>
                <div className="text-sm font-medium text-slate-900">{details.orgaoJulgador || '—'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Distribuição</div>
                <div className="text-sm font-medium text-slate-900">
                  {details.distributionDate ? new Date(details.distributionDate).toLocaleDateString('pt-BR') : '—'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Última atualização</div>
                <div className="text-sm font-medium text-slate-900">
                  {details.lastMovementDate ? new Date(details.lastMovementDate).toLocaleDateString('pt-BR') : '—'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="rounded-xl shadow-sm">
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

          <Card className="rounded-xl shadow-sm">
            <CardHeader className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">Movimentações</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-[11px]">
                  Total: {sortedMovements.length}
                </Badge>
                <Badge className="bg-emerald-500 text-[11px] text-white">
                  Últimos 7 dias: {recentMovementsCount}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedMovements.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma movimentação disponível.</p>
              ) : (
                <>
                  <div className="relative border-l border-slate-200 pl-6 pr-4">
                    {sortedMovements.slice(0, 5).map((m, idx) => (
                      <div key={idx} className="relative pb-6 last:pb-0">
                        <span className="absolute -left-[9px] top-2 h-2.5 w-2.5 rounded-full bg-slate-400 ring-4 ring-white" />
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-[11px]">
                            {m.date ? new Date(m.date).toLocaleDateString('pt-BR') : '—'}
                          </Badge>
                          {m.code !== null && (
                            <Badge variant="outline" className="text-[11px] text-muted-foreground">
                              {m.code}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                          <span>{m.name || 'Movimentação'}</span>
                          {isRecentMovement(m.date) && (
                            <Badge className="bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white animate-pulse">
                              Novo
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2 sm:w-auto">
                        <ExternalLink className="h-4 w-4" />
                        Ver histórico completo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-4xl p-0 sm:w-full">
                      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
                        <DialogHeader className="space-y-1">
                          <DialogTitle className="text-base">Histórico completo</DialogTitle>
                          <div className="text-sm text-muted-foreground">{formatted}</div>
                        </DialogHeader>
                        <DialogClose asChild>
                          <Button variant="ghost" size="icon">
                            <X className="h-4 w-4" />
                          </Button>
                        </DialogClose>
                      </div>
                      <div className="px-4 py-4 sm:px-6 sm:py-5">
                        <ScrollArea className="h-[70vh] pr-2 sm:h-[65vh] sm:pr-4">
                          <div className="relative border-l-2 border-slate-200 pl-6 pr-2">
                            {sortedMovements.map((m, idx) => {
                              const dayLabel = m.date ? new Date(m.date).toLocaleDateString('pt-BR') : 'Sem data'
                              const previous = sortedMovements[idx - 1]
                              const previousDayLabel = previous?.date
                                ? new Date(previous.date).toLocaleDateString('pt-BR')
                                : 'Sem data'
                              const showDayHeader = idx === 0 || dayLabel !== previousDayLabel

                              return (
                                <div key={idx} className="relative pb-7 last:pb-0">
                                  {showDayHeader && (
                                    <div className="mb-3 ml-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                      {dayLabel}
                                    </div>
                                  )}
                                  <span className="absolute -left-[12px] top-2.5 h-3 w-3 rounded-full border-2 border-slate-300 bg-white shadow-sm" />
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="border-slate-200 bg-slate-100 text-[11px] text-slate-600">
                                      {m.date ? new Date(m.date).toLocaleDateString('pt-BR') : '—'}
                                    </Badge>
                                    {m.code !== null && (
                                      <Badge variant="outline" className="text-[11px] text-muted-foreground">
                                        {m.code}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                                    <span>{m.name || 'Movimentação'}</span>
                                    {isRecentMovement(m.date) && (
                                      <Badge className="bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white animate-pulse">
                                        Novo
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
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
    .select(`
      *,
      clients (
        id,
        name,
        email,
        phone,
        cpf_cnpj,
        client_type
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !process) {
    redirect('/dashboard/processes')
  }

  // Buscar prazos vinculados
  const { data: deadlines } = await supabase
    .from('deadlines')
    .select('id, title, deadline_date, status, priority, acknowledged_at, type, description')
    .eq('user_id', user.id)
    .eq('process_id', process.id)
    .order('deadline_date', { ascending: true })

  // Buscar movimentações/atualizações do processo
  const { data: processUpdates } = await supabase
    .from('process_updates')
    .select('id, title, description, update_type, update_date, created_at')
    .eq('user_id', user.id)
    .eq('process_id', process.id)
    .order('update_date', { ascending: false })
    .limit(50)

  // Buscar documentos vinculados
  const { data: documents } = await supabase
    .from('documents')
    .select('id, title, file_name, file_type, file_size, category, created_at')
    .eq('user_id', user.id)
    .eq('process_id', process.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Buscar notificações/alertas
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, title, message, notification_type, channel, notification_status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  // Fetch profile name for WhatsApp message
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const processAny = process as any
  const client = processAny.clients
  const now = new Date()

  // Calcular contagens
  const pendingDeadlines = (deadlines || []).filter((d: any) => d.status === 'pending').length
  const overdueDeadlines = (deadlines || []).filter((d: any) => {
    return d.status !== 'completed' && new Date(d.deadline_date) < now
  }).length
  const recentUpdatesCount = (processUpdates || []).filter((u: any) => {
    const d = new Date(u.update_date || u.created_at)
    return (now.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000
  }).length

  // Status display
  const statusLabels: Record<string, string> = {
    active: 'Ativo', in_progress: 'Em Andamento', won: 'Ganho', lost: 'Perdido',
    archived: 'Arquivado',
  }
  const priorityLabels: Record<string, string> = {
    low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente',
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
              {process.title || 'Processo'}
            </h1>
            <Badge className={getStatusBadgeStyles(process.status)}>
              {statusLabels[process.status] || process.status}
            </Badge>
            {processAny.polo && (
              <Badge variant="outline" className={
                processAny.polo === 'ativo'
                  ? 'border-green-200 text-green-700 bg-green-50'
                  : 'border-orange-200 text-orange-700 bg-orange-50'
              }>
                Polo {processAny.polo === 'ativo' ? 'Ativo' : 'Passivo'}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {process.process_number && (
              <span className="font-mono text-slate-700">{process.process_number}</span>
            )}
            {process.updated_at && (
              <>
                <span>·</span>
                <span>Atualizado em {new Date(process.updated_at).toLocaleDateString('pt-BR')}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/processes/${process.id}/edit`}>
              <FileText className="h-4 w-4 mr-1.5" />
              Editar
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/processes">
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      {/* Info Cards Grid — estilo DataJud */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardContent className="flex items-start gap-3 p-4 sm:p-5">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 shrink-0">
              <Landmark className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tribunal</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5 truncate">{process.court || '—'}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardContent className="flex items-start gap-3 p-4 sm:p-5">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Vara</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5 truncate">{process.vara || '—'}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardContent className="flex items-start gap-3 p-4 sm:p-5">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600 shrink-0">
              <Gavel className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tipo / Matéria</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
                {process.process_type || process.matter || '—'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardContent className="flex items-start gap-3 p-4 sm:p-5">
            <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600 shrink-0">
              <Gavel className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Juiz</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5 truncate">{process.judge || '—'}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardContent className="flex items-start gap-3 p-4 sm:p-5">
            <div className="rounded-lg bg-green-50 p-2.5 text-green-600 shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Distribuição</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">
                {process.start_date ? new Date(process.start_date).toLocaleDateString('pt-BR') : '—'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardContent className="flex items-start gap-3 p-4 sm:p-5">
            <div className="rounded-lg bg-red-50 p-2.5 text-red-600 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Previsão Término</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">
                {process.estimated_end_date ? new Date(process.estimated_end_date).toLocaleDateString('pt-BR') : '—'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardContent className="flex items-start gap-3 p-4 sm:p-5">
            <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600 shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Prioridade</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">
                {priorityLabels[process.priority] || process.priority}
              </div>
            </div>
          </CardContent>
        </Card>

        {process.probability != null && (
          <Card className="rounded-xl shadow-sm border-slate-200">
            <CardContent className="flex items-start gap-3 p-4 sm:p-5">
              <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 shrink-0">
                <ExternalLink className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Probabilidade</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{process.probability}%</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Financeiro + Cliente - 2 colunas */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Card Financeiro */}
        {(processAny.valor_causa || processAny.honorario_calculado || process.value) && (
          <Card className="rounded-xl shadow-sm border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-green-900 flex items-center gap-2">
                <div className="rounded-lg bg-green-100 p-1.5">
                  <ExternalLink className="h-4 w-4 text-green-700" />
                </div>
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(processAny.valor_causa || process.value) && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                  <span className="text-sm text-slate-600">Valor da Causa</span>
                  <span className="text-lg font-bold text-green-700">
                    R$ {(processAny.valor_causa || process.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {processAny.percentual_honorario && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                  <span className="text-sm text-slate-600">Percentual Honorários</span>
                  <span className="text-base font-semibold text-blue-700">{processAny.percentual_honorario}%</span>
                </div>
              )}
              {processAny.honorario_calculado && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                  <span className="text-sm text-slate-600">Honorário Calculado</span>
                  <span className="text-lg font-bold text-blue-700">
                    R$ {processAny.honorario_calculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Card do Cliente */}
        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <div className="rounded-lg bg-slate-100 p-1.5">
                <Building2 className="h-4 w-4 text-slate-600" />
              </div>
              Partes / Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{client.name}</p>
                    {client.cpf_cnpj && (
                      <p className="text-xs text-slate-500 mt-0.5">{client.cpf_cnpj}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {processAny.polo && (
                      <Badge variant="outline" className={
                        processAny.polo === 'ativo'
                          ? 'border-green-200 text-green-700 bg-green-50'
                          : 'border-orange-200 text-orange-700 bg-orange-50'
                      }>
                        {processAny.polo === 'ativo' ? 'Polo Ativo' : 'Polo Passivo'}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {client.client_type === 'company' ? 'Empresa' : 'Pessoa Física'}
                    </Badge>
                  </div>
                </div>
                {(client.email || client.phone) && (
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {client.email && <span>✉️ {client.email}</span>}
                    {client.phone && <span>📞 {client.phone}</span>}
                  </div>
                )}
                <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                  <Link href={`/dashboard/clients/${client.id}`}>Ver perfil do cliente</Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nenhum cliente vinculado a este processo.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Descrição */}
      {process.description && (
        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">Descrição / Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{process.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {process.tags && process.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {process.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-slate-100">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Movimentações + Prazos - 2 colunas */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Movimentações / Atualizações */}
        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-3">
            <CardTitle className="text-base text-slate-900">Movimentações</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-[11px]">
                Total: {processUpdates?.length || 0}
              </Badge>
              {recentUpdatesCount > 0 && (
                <Badge className="bg-emerald-500 text-[11px] text-white">
                  Últimos 7 dias: {recentUpdatesCount}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(processUpdates || []).length === 0 ? (
              <div className="text-center py-6">
                <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Nenhuma movimentação registrada.</p>
                <p className="text-xs text-slate-400 mt-1">Movimentações aparecerão aqui conforme forem cadastradas.</p>
              </div>
            ) : (
              <>
                <div className="relative border-l-2 border-slate-200 pl-6 pr-2">
                  {(processUpdates || []).slice(0, 5).map((m: any, idx: number) => {
                    const isRecent = isRecentMovement(m.update_date || m.created_at)
                    return (
                      <div key={m.id} className="relative pb-6 last:pb-0">
                        <span className={`absolute -left-[9px] top-2 h-3 w-3 rounded-full ${isRecent ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-slate-400 ring-4 ring-white'
                          }`} />
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-[11px]">
                            {(m.update_date || m.created_at)
                              ? new Date(m.update_date || m.created_at).toLocaleDateString('pt-BR')
                              : '—'}
                          </Badge>
                          {m.update_type && (
                            <Badge variant="outline" className="text-[11px] text-slate-500">
                              {m.update_type}
                            </Badge>
                          )}
                          {isRecent && (
                            <Badge className="bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white animate-pulse">
                              Novo
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900">{m.title || 'Movimentação'}</p>
                        {m.description && (
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{m.description}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
                {(processUpdates || []).length > 5 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2 sm:w-auto" size="sm">
                        <ExternalLink className="h-4 w-4" />
                        Ver todas as {processUpdates?.length} movimentações
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-4xl p-0 sm:w-full">
                      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
                        <DialogHeader className="space-y-1">
                          <DialogTitle className="text-base">Histórico completo</DialogTitle>
                          <div className="text-sm text-muted-foreground">{process.title}</div>
                        </DialogHeader>
                        <DialogClose asChild>
                          <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
                        </DialogClose>
                      </div>
                      <div className="px-4 py-4 sm:px-6 sm:py-5">
                        <ScrollArea className="h-[70vh] pr-2 sm:h-[65vh] sm:pr-4">
                          <div className="relative border-l-2 border-slate-200 pl-6 pr-2">
                            {(processUpdates || []).map((m: any) => (
                              <div key={m.id} className="relative pb-7 last:pb-0">
                                <span className="absolute -left-[12px] top-2.5 h-3 w-3 rounded-full border-2 border-slate-300 bg-white shadow-sm" />
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge className="border-slate-200 bg-slate-100 text-[11px] text-slate-600">
                                    {(m.update_date || m.created_at) ? new Date(m.update_date || m.created_at).toLocaleDateString('pt-BR') : '—'}
                                  </Badge>
                                  {m.update_type && (
                                    <Badge variant="outline" className="text-[11px] text-slate-500">{m.update_type}</Badge>
                                  )}
                                </div>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{m.title || 'Movimentação'}</p>
                                {m.description && <p className="mt-1 text-xs text-slate-500">{m.description}</p>}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Prazos & Alertas */}
        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-3">
            <CardTitle className="text-base text-slate-900">Prazos & Alertas</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {pendingDeadlines > 0 && (
                <Badge className="bg-blue-500 text-[11px] text-white">
                  {pendingDeadlines} pendente{pendingDeadlines > 1 ? 's' : ''}
                </Badge>
              )}
              {overdueDeadlines > 0 && (
                <Badge className="bg-red-500 text-[11px] text-white animate-pulse">
                  {overdueDeadlines} vencido{overdueDeadlines > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Alerta auxiliar — confira o prazo no teor da publicação/andamento.
            </div>

            {(deadlines || []).length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Nenhum prazo vinculado.</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/dashboard/deadlines/new">Criar prazo</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {(deadlines || []).map((d: any) => {
                  const dd = new Date(d.deadline_date)
                  const daysUntil = Math.ceil((dd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                  const isOverdue = d.status !== 'completed' && daysUntil < 0
                  const isToday = daysUntil === 0
                  const isUrgent = daysUntil > 0 && daysUntil <= 3

                  return (
                    <div
                      key={d.id}
                      className={`rounded-lg border p-3 transition-colors ${isOverdue ? 'border-red-200 bg-red-50/50' :
                        isToday ? 'border-orange-200 bg-orange-50/50' :
                          isUrgent ? 'border-amber-200 bg-amber-50/30' :
                            d.status === 'completed' ? 'border-green-200 bg-green-50/30' :
                              'border-slate-200'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{d.title}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-xs text-slate-500">
                              {dd.toLocaleDateString('pt-BR')} às {dd.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOverdue && <Badge variant="destructive" className="text-[10px] px-1 py-0">Vencido</Badge>}
                            {isToday && <Badge className="bg-orange-500 text-white text-[10px] px-1 py-0">Hoje</Badge>}
                            {isUrgent && <Badge className="bg-amber-500 text-white text-[10px] px-1 py-0">{daysUntil}d</Badge>}
                            {d.status === 'completed' && <Badge className="bg-green-500 text-white text-[10px] px-1 py-0">✓</Badge>}
                          </div>
                        </div>
                        <ConfirmAwarenessButton deadlineId={d.id} disabled={Boolean(d.acknowledged_at)} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documentos */}
      {(documents || []).length > 0 && (
        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              Documentos Vinculados
              <Badge variant="secondary" className="text-[11px]">{documents?.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {(documents || []).map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="shrink-0 rounded-lg bg-blue-50 p-2 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.title || doc.file_name}</p>
                    <p className="text-xs text-slate-500">
                      {doc.category && <span>{doc.category} · </span>}
                      {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      {doc.file_size && <span> · {(doc.file_size / 1024).toFixed(0)} KB</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controle do Portal do Cliente */}
      <div className="pt-4 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
          <LayoutList className="h-6 w-6 text-indigo-600" />
          Visibilidade no Portal do Cliente
        </h2>
        <PortalTimelineManager processId={process.id} />
      </div>

      {/* WhatsApp Share */}
      <WhatsAppShare
        process={{
          title: process.title,
          processNumber: process.process_number,
          court: process.court,
          vara: process.vara,
          matter: process.matter,
          status: process.status,
          lastMovement: (processUpdates && processUpdates.length > 0) ? {
            title: processUpdates[0].title || processUpdates[0].update_type || 'Movimentação',
            date: processUpdates[0].update_date || processUpdates[0].created_at,
          } : null,
        }}
        client={client ? { name: client.name, phone: client.phone } : null}
        profileName={userProfile?.full_name || null}
      />

      {/* Histórico de Alertas */}
      {(notifications || []).length > 0 && (
        <Card className="rounded-xl shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">Histórico de Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2 pr-4">
                {(notifications || []).slice(0, 15).map((n: any) => (
                  <div key={n.id} className="rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">{n.title}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {n.channel}
                      </Badge>
                    </div>
                    {n.message && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{n.message}</p>}
                    <p className="mt-1 text-[11px] text-slate-400">
                      {new Date(n.created_at).toLocaleString('pt-BR')} · {n.notification_status}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-slate-400">
        Processo cadastrado em {new Date(process.created_at).toLocaleDateString('pt-BR')}
      </div>
    </div>
  )
}
