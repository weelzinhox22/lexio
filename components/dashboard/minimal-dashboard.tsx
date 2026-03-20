"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, Mail, CheckCircle2, AlertCircle, XCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { SystemHealthDashboard } from "@/components/deadlines/system-health-dashboard"

type MinimalDashboardProps = {
  userId: string
  upcomingDeadlines: Array<{
    id: string
    title: string
    deadline_date: string
    priority: string
    processes?: {
      title: string
      process_number: string
    } | null
  }>
  lastAlert: {
    sent_at: string | null
    channel: string
  } | null
  systemStatus: {
    status: 'healthy' | 'warning' | 'critical'
    alertsToday: number
  }
}

export function MinimalDashboard({
  userId,
  upcomingDeadlines,
  lastAlert,
  systemStatus
}: MinimalDashboardProps) {
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDaysUntil = (deadlineDate: string) => {
    const now = new Date()
    const deadline = new Date(deadlineDate)
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) return `Vencido há ${Math.abs(daysUntil)} dias`
    if (daysUntil === 0) return 'Hoje'
    if (daysUntil === 1) return 'Amanhã'
    return `Em ${daysUntil} dias`
  }

  const getStatusColor = (daysUntil: number) => {
    if (daysUntil < 0) return 'bg-red-50 border-red-200'
    if (daysUntil === 0) return 'bg-red-50 border-red-200'
    if (daysUntil <= 3) return 'bg-orange-50 border-orange-200'
    return 'bg-slate-50 border-slate-200'
  }

  const topDeadlines = upcomingDeadlines.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* CTA Principal - Criar Prazo */}
      {upcomingDeadlines.length === 0 && (
        <Card className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm shadow-sm" id="tour-create-deadline">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-1.5 tracking-tight">
                  Comece criando seu primeiro prazo
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Você receberá alertas automáticos por e-mail quando o prazo estiver se aproximando.
                </p>
              </div>
              <Link href="/dashboard/deadlines/new">
                <Button size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <Plus className="mr-2 h-5 w-5" />
                  Criar novo prazo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status do Sistema - Simplificado */}
      <div className="flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300" id="tour-alerts-info">
        <div className={`shrink-0 rounded-xl p-2.5 ${systemStatus.status === 'healthy' ? 'bg-green-50 border border-green-100' :
          systemStatus.status === 'warning' ? 'bg-yellow-50 border border-yellow-100' :
            'bg-red-50 border border-red-100'
          }`}>
          {systemStatus.status === 'healthy' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : systemStatus.status === 'warning' ? (
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-slate-900 block">
            {systemStatus.status === 'healthy' ? 'Sistema operacional' :
              systemStatus.status === 'warning' ? 'Atenção necessária' :
                'Sistema com problemas'}
          </span>
          {systemStatus.alertsToday > 0 && (
            <span className="text-xs text-slate-500 mt-0.5 block">
              • {systemStatus.alertsToday} alerta{systemStatus.alertsToday > 1 ? 's' : ''} enviado{systemStatus.alertsToday > 1 ? 's' : ''} hoje
            </span>
          )}
        </div>
        <Link href="/dashboard/deadlines/alerts" className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors">
          Detalhes
        </Link>
      </div>

      {/* Próximos Prazos - Máx 5 */}
      <Card className="rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 sm:p-5 border-b border-slate-100/60 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-base">Próximos prazos</h3>
            {upcomingDeadlines.length > 5 && (
              <Link href="/dashboard/deadlines">
                <Button variant="ghost" size="sm" className="text-xs font-semibold rounded-full text-slate-600 hover:text-slate-900">
                  Ver todos
                </Button>
              </Link>
            )}
          </div>
          <div className="divide-y divide-slate-100/80">
            {topDeadlines.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Clock className="h-8 w-8 text-slate-400" />
                </div>
                <p className="font-medium text-slate-900 mb-1">Nenhum prazo cadastrado</p>
                <p className="text-sm text-slate-500 mb-5 max-w-[200px]">Mantenha seus processos em dia cadastrando prazos.</p>
                <Link href="/dashboard/deadlines/new">
                  <Button variant="outline" size="sm" className="rounded-full shadow-sm hover:bg-slate-50 hover:text-slate-900">
                    Criar primeiro prazo
                  </Button>
                </Link>
              </div>
            ) : (
              topDeadlines.map((deadline) => {
                const deadlineDate = new Date(deadline.deadline_date)
                const now = new Date()
                const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                return (
                  <Link key={deadline.id} href={`/dashboard/deadlines/${deadline.id}`} className="block group/item">
                    <div className={`p-4 sm:p-5 hover:bg-slate-50 border-l-[3px] transition-all duration-200 ${daysUntil < 0 ? 'border-red-500 bg-red-50/20' : daysUntil === 0 ? 'border-red-400 bg-red-50/10' : daysUntil <= 3 ? 'border-orange-400 bg-orange-50/10' : 'border-slate-200'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-slate-900 group-hover/item:text-slate-700 transition-colors truncate">{deadline.title}</p>
                          {deadline.processes && (
                            <p className="text-xs font-medium text-slate-500 mt-1 truncate">
                              {deadline.processes.process_number}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-2.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-600">
                              {deadlineDate.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                              })} <span className="text-slate-300 mx-1">•</span> {formatDaysUntil(deadline.deadline_date)}
                            </span>
                          </div>
                        </div>
                        {daysUntil <= 3 && (
                          <Badge className={`px-2 py-0.5 shadow-sm rounded-full ${daysUntil < 0 ? 'bg-red-600 hover:bg-red-700 text-white border-transparent' :
                            daysUntil === 0 ? 'bg-red-600 hover:bg-red-700 text-white border-transparent' :
                              'bg-orange-500 hover:bg-orange-600 text-white border-transparent'
                            }`}>
                            {daysUntil < 0 ? 'Vencido' : daysUntil === 0 ? 'Hoje' : 'Urgente'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Último Alerta Enviado */}
      {lastAlert && lastAlert.sent_at && (
        <Card className="rounded-2xl border-slate-200/60 bg-white shadow-sm" id="tour-notifications">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">Último alerta enviado</span>
                  <span className="text-xs text-slate-500 mt-0.5 block">Via {lastAlert.channel === 'email' ? 'E-mail' : 'In-app'}</span>
                </div>
              </div>
              <div className="text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                {formatDateTime(lastAlert.sent_at)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

