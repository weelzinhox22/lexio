import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DeadlineAlertModal } from "@/components/deadlines/deadline-alert-modal"
import { MinimalDashboard } from "@/components/dashboard/minimal-dashboard"
import { GuidedTour } from "@/components/onboarding/guided-tour"
import { NPSChecker } from "@/components/feedback/nps-checker"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Modal: abrir se existir prazo vencido ou que vence hoje (e não confirmado)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const { data: modalDeadlinesRaw } = await supabase
    .from("deadlines")
    .select("id, title, deadline_date, status, acknowledged_at")
    .eq("user_id", user!.id)
    .neq("status", "completed")
    .limit(200)

  const modalDeadlines =
    (modalDeadlinesRaw || [])
      .map((d: any) => {
        const dd = new Date(d.deadline_date)
        const daysRemaining = Math.ceil((dd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return {
          id: d.id,
          title: d.title,
          deadline_date: d.deadline_date,
          days_remaining: daysRemaining,
          acknowledged_at: d.acknowledged_at || null,
          status: d.status,
        }
      })
      .filter((d: any) => d.status !== "completed" && d.days_remaining <= 0)
      .slice(0, 8) || []

  // Buscar próximos prazos (máx 5 para o dashboard)
  const { data: upcomingDeadlines } = await supabase
    .from("deadlines")
    .select(`
      id,
      title,
      deadline_date,
      priority,
      processes (
        title,
        process_number
      )
    `)
    .eq("user_id", user!.id)
    .eq("status", "pending")
    .gte("deadline_date", new Date().toISOString().split("T")[0])
    .order("deadline_date", { ascending: true })
    .limit(5)

  // Buscar último alerta enviado
  const { data: lastAlert } = await supabase
    .from("notifications")
    .select("sent_at, channel")
    .eq("user_id", user!.id)
    .eq("channel", "email")
    .eq("notification_status", "sent")
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Calcular status do sistema (últimos 15 minutos)
  const fifteenMinutesAgo = new Date()
  fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15)

  const { data: recentAlerts } = await supabase
    .from("notifications")
    .select("notification_status")
    .eq("user_id", user!.id)
    .eq("channel", "email")
    .gte("created_at", fifteenMinutesAgo.toISOString())

  const sent = recentAlerts?.filter(a => a.notification_status === 'sent').length || 0
  const failed = recentAlerts?.filter(a => a.notification_status === 'failed').length || 0
  const total = sent + failed
  const failureRate = total > 0 ? (failed / total) * 100 : 0

  const systemStatus: 'healthy' | 'warning' | 'critical' = 
    failureRate >= 5 ? 'critical' :
    failureRate > 0 ? 'warning' :
    'healthy'

  // Contar alertas de hoje
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: todayAlerts } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", user!.id)
    .eq("channel", "email")
    .eq("notification_status", "sent")
    .gte("sent_at", todayStart.toISOString())

  return (
    <DashboardLayout userId={user?.id} userEmail={user?.email}>
      <DeadlineAlertModal deadlines={modalDeadlines} />
      <GuidedTour userId={user!.id} />
      <NPSChecker userId={user!.id} />
      
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1 text-sm">Visão geral dos seus prazos e alertas</p>
        </div>

        <MinimalDashboard
          userId={user!.id}
          upcomingDeadlines={upcomingDeadlines || []}
          lastAlert={lastAlert || null}
          systemStatus={{
            status: systemStatus,
            alertsToday: todayAlerts?.length || 0,
          }}
        />
      </div>
    </DashboardLayout>
  )
}


