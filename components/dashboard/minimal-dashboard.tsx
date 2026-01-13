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
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50" id="tour-create-deadline">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Comece criando seu primeiro prazo
              </h2>
              <p className="text-sm text-slate-600">
                Você receberá alertas automáticos por e-mail quando o prazo estiver se aproximando.
              </p>
            </div>
            <Link href="/dashboard/deadlines/new">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
                <Plus className="mr-2 h-5 w-5" />
                Criar novo prazo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Status do Sistema - Simplificado */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200" id="tour-alerts-info">
        <div className={`rounded-full p-1.5 ${
          systemStatus.status === 'healthy' ? 'bg-green-100' :
          systemStatus.status === 'warning' ? 'bg-yellow-100' :
          'bg-red-100'
        }`}>
          {systemStatus.status === 'healthy' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : systemStatus.status === 'warning' ? (
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-slate-900">
            {systemStatus.status === 'healthy' ? 'Sistema operacional' :
             systemStatus.status === 'warning' ? 'Atenção necessária' :
             'Sistema com problemas'}
          </span>
          {systemStatus.alertsToday > 0 && (
            <span className="text-xs text-slate-600 ml-2">
              • {systemStatus.alertsToday} alerta{systemStatus.alertsToday > 1 ? 's' : ''} enviado{systemStatus.alertsToday > 1 ? 's' : ''} hoje
            </span>
          )}
        </div>
        <Link href="/dashboard/deadlines/alerts" className="text-xs text-blue-600 hover:underline">
          Ver detalhes
        </Link>
      </div>

      {/* Próximos Prazos - Máx 5 */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Próximos prazos</h3>
            {upcomingDeadlines.length > 5 && (
              <Link href="/dashboard/deadlines">
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver todos ({upcomingDeadlines.length})
                </Button>
              </Link>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {topDeadlines.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-2">Nenhum prazo cadastrado</p>
                <Link href="/dashboard/deadlines/new">
                  <Button variant="outline" size="sm">
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
                  <Link key={deadline.id} href={`/dashboard/deadlines/${deadline.id}`}>
                    <div className={`p-4 hover:bg-slate-50 transition-colors ${getStatusColor(daysUntil)}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{deadline.title}</p>
                          {deadline.processes && (
                            <p className="text-xs text-slate-600 mt-1 truncate">
                              {deadline.processes.process_number}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span className="text-xs text-slate-600">
                              {deadlineDate.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                              })} • {formatDaysUntil(deadline.deadline_date)}
                            </span>
                          </div>
                        </div>
                        {daysUntil <= 3 && (
                          <Badge className={
                            daysUntil < 0 ? 'bg-red-600 text-white' :
                            daysUntil === 0 ? 'bg-red-600 text-white' :
                            'bg-orange-600 text-white'
                          }>
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
        <Card className="border-slate-200" id="tour-notifications">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Último alerta enviado:</span>
              </div>
              <div className="text-sm font-medium text-slate-900">
                {formatDateTime(lastAlert.sent_at)}
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Canal: {lastAlert.channel === 'email' ? 'E-mail' : 'In-app'}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

