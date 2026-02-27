import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DeadlineAlertModal } from "@/components/deadlines/deadline-alert-modal"
import { NPSChecker } from "@/components/feedback/nps-checker"
import { MinimalDashboard } from "@/components/dashboard/minimal-dashboard"
import { GuidedTour } from "@/components/onboarding/guided-tour"
import { EnrichedDashboard } from "@/components/dashboard/enriched-dashboard"
import { ReferralSection } from "@/components/dashboard/referral-section"
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting"
import { WeekCalendar } from "@/components/dashboard/week-calendar"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { SuggestionCard } from "@/components/dashboard/suggestion-card"
import { SuggestionPopup } from "@/components/feedback/suggestion-popup"

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

  const sevenDaysLater = new Date()
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

  const [
    processesCount,
    clientsCount,
    clientsThisMonth,
    recentMovements,
    upcomingAudiences,
    monthlyRevenue,
    recentProcessUpdates,
    recentNotifications,
    userProfile,
    weekDeadlines,
    weekAudiences,
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
      .lte("audience_date", sevenDaysLater.toISOString()),
    supabase
      .from("financial_transactions")
      .select("amount")
      .eq("user_id", user!.id)
      .in("type", ["income", "receita"])
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
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
    // Perfil do usuário (para saudação)
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user!.id)
      .single(),
    // Prazos dos próximos 7 dias (para mini calendário)
    supabase
      .from("deadlines")
      .select("id, title, deadline_date, priority")
      .eq("user_id", user!.id)
      .neq("status", "completed")
      .gte("deadline_date", today.toISOString())
      .lte("deadline_date", sevenDaysLater.toISOString())
      .order("deadline_date", { ascending: true }),
    // Audiências dos próximos 7 dias (para mini calendário)
    supabase
      .from("audiences")
      .select("id, title, audience_date")
      .eq("user_id", user!.id)
      .eq("status", "scheduled")
      .gte("audience_date", today.toISOString())
      .lte("audience_date", sevenDaysLater.toISOString())
      .order("audience_date", { ascending: true }),
  ])

  // ==== Charts data ====
  // Processes by status
  const { data: allProcesses } = await supabase
    .from("processes")
    .select("status, process_type")
    .eq("user_id", user!.id)

  const processByStatus: Record<string, number> = {}
  const processByType: Record<string, number> = {}
    ; (allProcesses || []).forEach((p: any) => {
      const s = p.status || 'active'
      processByStatus[s] = (processByStatus[s] || 0) + 1
      if (p.process_type) {
        processByType[p.process_type] = (processByType[p.process_type] || 0) + 1
      }
    })

  // Monthly revenue for last 6 months
  const monthlyRevenueData: number[] = []
  const monthLabels: string[] = []
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    monthLabels.push(monthNames[d.getMonth()])

    const { data: mrev } = await supabase
      .from("financial_transactions")
      .select("amount")
      .eq("user_id", user!.id)
      .in("type", ["income", "receita"])
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())

    monthlyRevenueData.push((mrev || []).reduce((acc, t) => acc + Number(t.amount || 0), 0))
  }

  // Deadlines stats
  const { data: allDeadlines } = await supabase
    .from("deadlines")
    .select("status, deadline_date")
    .eq("user_id", user!.id)

  const deadlineStats = { completed: 0, pending: 0, overdue: 0 }
    ; (allDeadlines || []).forEach((d: any) => {
      if (d.status === 'completed') {
        deadlineStats.completed++
      } else {
        const dd = new Date(d.deadline_date)
        if (dd < today) deadlineStats.overdue++
        else deadlineStats.pending++
      }
    })

  // Calcular contagens para saudação
  const todayDeadlineCount = (modalDeadlinesRaw || []).filter((d: any) => {
    const dd = new Date(d.deadline_date)
    const daysUntil = Math.ceil((dd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil === 0 && d.status !== "completed"
  }).length

  const urgentDeadlineCount = (upcomingDeadlines || []).filter((d: any) => {
    const dd = new Date(d.deadline_date)
    const daysUntil = Math.ceil((dd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil > 0 && daysUntil <= 3
  }).length

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
      <SuggestionPopup userId={user!.id} />

      <div className="space-y-4 sm:space-y-6 max-w-7xl">
        {/* Saudação personalizada */}
        <DashboardGreeting
          userName={userProfile.data?.full_name || null}
          urgentDeadlineCount={urgentDeadlineCount}
          todayDeadlineCount={todayDeadlineCount}
        />

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

        {/* Gráficos */}
        <DashboardCharts
          processByStatus={processByStatus}
          processByType={processByType}
          monthlyRevenue={monthlyRevenueData}
          monthLabels={monthLabels}
          deadlineStats={deadlineStats}
        />

        {/* Layout 2 colunas: Calendário + Prazos */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Mini Calendário Semanal */}
          <WeekCalendar
            deadlines={weekDeadlines.data || []}
            audiences={weekAudiences.data || []}
          />

          {/* Dashboard Minimalista (Prazos e Status) */}
          <MinimalDashboard
            userId={user!.id}
            upcomingDeadlines={(upcomingDeadlines || []) as any}
            lastAlert={lastAlert || null}
            systemStatus={{
              status: systemStatus,
              alertsToday: todayAlerts?.length || 0,
            }}
          />
        </div>

        {/* Sugestões de Melhoria */}
        <SuggestionCard />

        {/* Seção de Referral */}
        <ReferralSection userId={user!.id} />
      </div>
    </DashboardLayout>
  )
}

