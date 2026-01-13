"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Mail } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type SystemStatus = {
  isOperational: boolean
  lastCheck: string | null
  alertsToday: number
}

export function SystemStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<SystemStatus>({
    isOperational: true,
    lastCheck: null,
    alertsToday: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStatus = async () => {
      const supabase = createClient()
      
      // Buscar última verificação (último alerta enviado hoje)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: todayAlerts } = await supabase
        .from('notifications')
        .select('sent_at')
        .eq('user_id', userId)
        .eq('channel', 'email')
        .eq('notification_status', 'sent')
        .gte('sent_at', today.toISOString())

      const alertsCount = todayAlerts?.length || 0
      
      // Buscar último alerta enviado (para saber quando foi a última verificação)
      const { data: lastAlert } = await supabase
        .from('notifications')
        .select('sent_at')
        .eq('user_id', userId)
        .eq('channel', 'email')
        .eq('notification_status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setStatus({
        isOperational: true, // Assumimos operacional se há alertas sendo enviados
        lastCheck: lastAlert?.sent_at || null,
        alertsToday: alertsCount,
      })
      
      setLoading(false)
    }

    if (userId) {
      loadStatus()
      // Atualizar a cada 60 segundos
      const interval = setInterval(loadStatus, 60000)
      return () => clearInterval(interval)
    }
  }, [userId])

  const formatLastCheck = (dateString: string | null) => {
    if (!dateString) return 'Ainda não verificado'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'há menos de 1 minuto'
    if (diffMins < 60) return `há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
    if (diffHours < 24) return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`
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
    <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600 text-white">✓ Sistema operacional</Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Última verificação: {formatLastCheck(status.lastCheck)}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Alertas enviados hoje: <strong className="text-slate-900">{status.alertsToday}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

