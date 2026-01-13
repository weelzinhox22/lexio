"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle2, XCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

type AlertNotification = {
  id: string
  title: string
  created_at: string
  sent_at: string | null
  notification_status: string
  channel: string
  deadline_id: string | null
  days_remaining: number | null
}

export function AlertFeedback({ userId }: { userId: string }) {
  const [alerts, setAlerts] = useState<AlertNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [lastAlert, setLastAlert] = useState<AlertNotification | null>(null)

  useEffect(() => {
    const loadAlerts = async () => {
      const supabase = createClient()
      
      // Buscar últimos 10 alertas enviados
      const { data } = await supabase
        .from('notifications')
        .select('id, title, created_at, sent_at, notification_status, channel, deadline_id, days_remaining')
        .eq('user_id', userId)
        .eq('channel', 'email')
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) {
        setAlerts(data as AlertNotification[])
        setLastAlert(data[0] || null)
      }
      
      setLoading(false)
    }

    if (userId) {
      loadAlerts()
      // Atualizar a cada 30 segundos
      const interval = setInterval(loadAlerts, 30000)
      return () => clearInterval(interval)
    }
  }, [userId])

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-700">Enviado</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Falhou</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="text-sm text-slate-600">Carregando...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-900 flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Feedback de Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Linha de Status */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Último alerta enviado:</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-900 font-semibold">
              {lastAlert && lastAlert.sent_at
                ? formatDateTime(lastAlert.sent_at)
                : lastAlert && lastAlert.notification_status === 'pending'
                ? 'Pendente'
                : 'Nenhum alerta enviado ainda'}
            </div>
            <Link
              href="/dashboard/deadlines/alerts"
              className="text-xs text-blue-600 hover:underline"
            >
              Ver histórico
            </Link>
          </div>
        </div>

        {/* Lista de Últimos Alertas */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Últimos alertas enviados</h3>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-600 bg-slate-50 rounded-lg border border-slate-200">
              <Mail className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p>Nenhum alerta enviado ainda</p>
              <p className="text-xs mt-1">O sistema está monitorando seus prazos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {alert.notification_status === 'sent' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      ) : alert.notification_status === 'failed' ? (
                        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600 shrink-0" />
                      )}
                      <p className="text-sm font-medium text-slate-900 truncate">{alert.title}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600 ml-6">
                      <span>{formatDateTime(alert.sent_at || alert.created_at)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        E-mail
                      </span>
                      {alert.days_remaining !== null && (
                        <>
                          <span>•</span>
                          <span>
                            {alert.days_remaining === 0
                              ? 'Vence hoje'
                              : alert.days_remaining < 0
                              ? `Vencido há ${Math.abs(alert.days_remaining)} dias`
                              : `Vence em ${alert.days_remaining} dias`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 ml-3">{getStatusBadge(alert.notification_status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

