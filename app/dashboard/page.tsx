import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DeadlineAlertModal } from "@/components/deadlines/deadline-alert-modal"
import { NPSChecker } from "@/components/feedback/nps-checker"
import { MinimalDashboard } from "@/components/dashboard/minimal-dashboard"
import { GuidedTour } from "@/components/onboarding/guided-tour"
import { EnrichedDashboard } from "@/components/dashboard/enriched-dashboard"
import { ReferralSection } from "@/components/dashboard/referral-section"

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


  // Buscar próximos prazos (máx 5 para o dashboard minimalista)
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

  // Buscar métricas para dashboard enriquecido
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    processesCount,
    clientsCount,
    clientsThisMonth,
    recentMovements,
    upcomingAudiences,
    monthlyRevenue,
    recentProcessUpdates,
    recentNotifications,
  ] = await Promise.all([
    supabase
      .from("processes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .eq("status", "active"),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase
      .from("process_updates")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .gte("created_at", sevenDaysAgo.toISOString()),
    supabase
      .from("audiences")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .eq("status", "scheduled")
      .gte("audience_date", new Date().toISOString())
      .lte("audience_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("financial_transactions")
      .select("amount")
      .eq("user_id", user!.id)
      .eq("type", "income")
      .eq("status", "paid")
      .gte("paid_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase
      .from("process_updates")
      .select("id, process_id, title, update_type, created_at, processes(title, process_number)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("notifications")
      .select("id, title, sent_at, deadline_id, deadlines(title)")
      .eq("user_id", user!.id)
      .eq("notification_status", "sent")
      .order("sent_at", { ascending: false })
      .limit(5),
  ])

  const revenue = monthlyRevenue.data?.reduce((acc, t) => acc + Number(t.amount || 0), 0) || 0

  // Construir eventos recentes
  const recentEvents: Array<{
    id: string
    type: 'movement' | 'audience' | 'deadline' | 'alert'
    title: string
    description: string
    date: string
    link: string
    isNew?: boolean
  }> = []

  // Adicionar movimentações
  recentProcessUpdates.data?.forEach((update: any) => {
    recentEvents.push({
      id: update.id,
      type: 'movement',
      title: 'Nova movimentação em processo',
      description: `${update.processes?.process_number || 'Processo'} - ${update.title || update.update_type || 'Movimentação'}`,
      date: update.created_at,
      link: update.process_id ? `/dashboard/processes/${update.process_id}` : '/dashboard/processes',
      isNew: new Date(update.created_at) > sevenDaysAgo,
    })
  })

  // Adicionar alertas enviados
  recentNotifications.data?.forEach((notif: any) => {
    recentEvents.push({
      id: notif.id,
      type: 'alert',
      title: 'Alerta enviado',
      description: notif.deadlines?.title || notif.title || 'Alerta de prazo',
      date: notif.sent_at || notif.created_at,
      link: notif.deadline_id ? `/dashboard/deadlines/${notif.deadline_id}` : '/dashboard/deadlines',
    })
  })

  // Ordenar eventos por data
  recentEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <DashboardLayout userId={user?.id} userEmail={user?.email}>
      <DeadlineAlertModal deadlines={modalDeadlines} />
      <GuidedTour userId={user!.id} />
      <NPSChecker userId={user!.id} />
      
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1 text-sm">Visão geral do seu escritório jurídico</p>
        </div>

        {/* Dashboard Enriquecido */}
        <EnrichedDashboard
          metrics={{
            activeProcesses: processesCount.count || 0,
            totalClients: clientsCount.count || 0,
            clientsGrowth: clientsThisMonth.count || undefined,
            recentMovements: recentMovements.count || 0,
            upcomingAudiences: upcomingAudiences.count || 0,
            monthlyRevenue: revenue > 0 ? revenue : undefined,
          }}
          recentEvents={recentEvents.slice(0, 5)}
        />

        {/* Dashboard Minimalista (Prazos e Status) */}
        <MinimalDashboard
          userId={user!.id}
          upcomingDeadlines={upcomingDeadlines || []}
          lastAlert={lastAlert || null}
          systemStatus={{
            status: systemStatus,
            alertsToday: todayAlerts?.length || 0,
          }}
        />

        {/* Seção de Referral */}
        <ReferralSection userId={user!.id} />
      </div>
    </DashboardLayout>
  )
}

