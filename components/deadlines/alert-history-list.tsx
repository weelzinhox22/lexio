"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, Mail, Calendar } from "lucide-react"
import Link from "next/link"

type Alert = {
  id: string
  title: string
  message: string
  created_at: string
  sent_at: string | null
  notification_status: string
  channel: string
  deadline_id: string | null
  days_remaining: number | null
  error_message: string | null
  deadlines?: {
    id: string
    title: string
    deadline_date: string
  } | null
}

export function AlertHistoryList({ alerts }: { alerts: Alert[] }) {
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
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Enviado
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Falhou
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 text-slate-600">
        <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p>Nenhum alerta encontrado</p>
        <p className="text-sm text-slate-500 mt-1">Os alertas enviados aparecerão aqui</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border ${
            alert.notification_status === 'sent'
              ? 'bg-green-50/50 border-green-200'
              : alert.notification_status === 'failed'
              ? 'bg-red-50/50 border-red-200'
              : 'bg-yellow-50/50 border-yellow-200'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-slate-900">{alert.title}</h3>
                {getStatusBadge(alert.notification_status)}
              </div>
              
              <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Criado: {formatDateTime(alert.created_at)}
                </span>
                {alert.sent_at && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Enviado: {formatDateTime(alert.sent_at)}
                    </span>
                  </>
                )}
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
                {alert.deadlines && (
                  <>
                    <span>•</span>
                    <Link
                      href={`/dashboard/deadlines/${alert.deadlines.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Ver prazo
                    </Link>
                  </>
                )}
              </div>
              
              {alert.error_message && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  <strong>Erro:</strong> {alert.error_message}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


