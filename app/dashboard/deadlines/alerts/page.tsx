import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle2, XCircle, Clock, Filter } from "lucide-react"
import { AlertHistoryList } from "@/components/deadlines/alert-history-list"

export default async function AlertHistoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; type?: string; date?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const params = await searchParams
  const statusFilter = params?.status
  const typeFilter = params?.type
  const dateFilter = params?.date

  // Construir query com filtros
  let query = supabase
    .from('notifications')
    .select(`
      id,
      title,
      message,
      created_at,
      sent_at,
      notification_status,
      channel,
      deadline_id,
      days_remaining,
      error_message,
      deadlines (
        id,
        title,
        deadline_date
      )
    `)
    .eq('user_id', user.id)
    .eq('channel', 'email')
    .order('created_at', { ascending: false })
    .limit(100)

  if (statusFilter) {
    query = query.eq('notification_status', statusFilter)
  }

  if (typeFilter) {
    query = query.eq('notification_type', typeFilter)
  }

  if (dateFilter) {
    const date = new Date(dateFilter)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    query = query.gte('created_at', date.toISOString()).lt('created_at', nextDay.toISOString())
  }

  const { data: alerts } = await query

  // Estatísticas
  const totalAlerts = alerts?.length || 0
  const sentAlerts = alerts?.filter(a => a.notification_status === 'sent').length || 0
  const failedAlerts = alerts?.filter(a => a.notification_status === 'failed').length || 0
  const pendingAlerts = alerts?.filter(a => a.notification_status === 'pending').length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Histórico de Alertas</h1>
        <p className="text-slate-600 mt-1 text-sm md:text-base">
          Visualize todos os alertas enviados por e-mail
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{totalAlerts}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Enviados</p>
                <p className="text-2xl font-bold text-green-600">{sentAlerts}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Falharam</p>
                <p className="text-2xl font-bold text-red-600">{failedAlerts}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingAlerts}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Alertas Enviados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlertHistoryList alerts={alerts || []} />
        </CardContent>
      </Card>
    </div>
  )
}

