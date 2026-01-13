"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, XCircle, Clock, Mail, Activity } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type SystemHealth = {
  status: 'healthy' | 'warning' | 'critical'
  lastCronExecution: string | null
  alertsToday: number
  failedToday: number
  failureRate: number
}

export function SystemHealthDashboard({ userId }: { userId: string }) {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    lastCronExecution: null,
    alertsToday: 0,
    failedToday: 0,
    failureRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHealth = async () => {
      const supabase = createClient()
      
      // Calcular últimas 15 minutos
      const fifteenMinutesAgo = new Date()
      fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15)
      
      // Buscar alertas das últimas 15 minutos
      const { data: recentAlerts } = await supabase
        .from('notifications')
        .select('notification_status, sent_at')
        .eq('user_id', userId)
        .eq('channel', 'email')
        .gte('created_at', fifteenMinutesAgo.toISOString())

      const sent = recentAlerts?.filter(a => a.notification_status === 'sent').length || 0
      const failed = recentAlerts?.filter(a => a.notification_status === 'failed').length || 0
      const total = sent + failed
      const failureRate = total > 0 ? (failed / total) * 100 : 0

      // Buscar último alerta enviado (para saber última execução do cron)
      const { data: lastAlert } = await supabase
        .from('notifications')
        .select('sent_at')
        .eq('user_id', userId)
        .eq('channel', 'email')
        .eq('notification_status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Buscar alertas de hoje
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: todayAlerts } = await supabase
        .from('notifications')
        .select('notification_status')
        .eq('user_id', userId)
        .eq('channel', 'email')
        .gte('created_at', today.toISOString())

      const alertsToday = todayAlerts?.filter(a => a.notification_status === 'sent').length || 0
      const failedToday = todayAlerts?.filter(a => a.notification_status === 'failed').length || 0

      // Determinar status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      if (failureRate >= 5 || !lastAlert?.sent_at) {
        status = 'critical'
      } else if (failureRate > 0 && failureRate < 5) {
        status = 'warning'
      }

      setHealth({
        status,
        lastCronExecution: lastAlert?.sent_at || null,
        alertsToday,
        failedToday,
        failureRate: Math.round(failureRate * 10) / 10,
      })
      
      setLoading(false)
    }

    if (userId) {
      loadHealth()
      // Atualizar a cada 60 segundos
      const interval = setInterval(loadHealth, 60000)
      return () => clearInterval(interval)
    }
  }, [userId])

  const formatLastExecution = (dateString: string | null) => {
    if (!dateString) return 'Ainda não executado'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'há menos de 1 minuto'
    if (diffMins < 60) return `há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
    if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    return 'há mais de 24 horas'
  }

  const getStatusConfig = () => {
    switch (health.status) {
      case 'healthy':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          badgeColor: 'bg-green-600',
          label: 'Sistema Operacional',
        }
      case 'warning':
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          badgeColor: 'bg-yellow-600',
          label: 'Atenção Necessária',
        }
      case 'critical':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          badgeColor: 'bg-red-600',
          label: 'Sistema com Problemas',
        }
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

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Card className={`border-2 ${health.status === 'healthy' ? 'border-green-200 bg-green-50/30' : health.status === 'warning' ? 'border-yellow-200 bg-yellow-50/30' : 'border-red-200 bg-red-50/30'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`rounded-full ${config.bgColor} p-2`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${config.badgeColor} text-white`}>
                  {health.status === 'healthy' ? '🟢' : health.status === 'warning' ? '🟡' : '🔴'} {config.label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Última execução: {formatLastExecution(health.lastCronExecution)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>Enviados hoje: <strong className="text-slate-900">{health.alertsToday}</strong></span>
                </div>
                {health.failedToday > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-3 w-3" />
                    <span>Falharam hoje: <strong>{health.failedToday}</strong></span>
                  </div>
                )}
                {health.failureRate > 0 && (
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span>Taxa de falha: <strong className={health.failureRate >= 5 ? 'text-red-600' : 'text-yellow-600'}>{health.failureRate}%</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


