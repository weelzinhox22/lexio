import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle2, TrendingUp, XCircle, Calendar } from "lucide-react"

// Lista de admin IDs e e-mails (configurar via env)
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean).map(e => e.trim().toLowerCase())

export default async function MetricsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verificar se é admin (por ID ou e-mail)
  const userEmail = user.email?.toLowerCase() || ''
  const isAdmin = ADMIN_USER_IDS.includes(user.id) || ADMIN_EMAILS.includes(userEmail) || user.email?.endsWith('@themixa.com')

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Calcular métricas
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Total de usuários
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // Usuários que criaram primeiro prazo (ativação)
  const { data: usersWithDeadlines } = await supabase
    .from("deadlines")
    .select("user_id", { count: "exact" })
    .limit(1)

  const activatedUsers = new Set(usersWithDeadlines?.map((d: any) => d.user_id) || []).size
  const activationRate = totalUsers ? ((activatedUsers / totalUsers) * 100).toFixed(1) : '0'

  // Usuários ativos (fizeram login nos últimos 7 dias)
  const { data: recentLogins } = await supabase
    .from("profiles")
    .select("id, last_sign_in_at")
    .gte("last_sign_in_at", sevenDaysAgo.toISOString())

  const activeUsers = recentLogins?.length || 0
  const retentionRate = totalUsers ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0'

  // Conversão Free → Pro (assumindo que Pro tem subscription ativa)
  const { data: proUsers } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active")

  const convertedUsers = proUsers?.length || 0
  const conversionRate = totalUsers ? ((convertedUsers / totalUsers) * 100).toFixed(1) : '0'

  // Churn (cancelamentos nos últimos 30 dias)
  const { data: cancelledSubs } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("status", "canceled")
    .gte("updated_at", thirtyDaysAgo.toISOString())

  const churnedUsers = cancelledSubs?.length || 0
  const churnRate = convertedUsers > 0 ? ((churnedUsers / convertedUsers) * 100).toFixed(1) : '0'

  const metrics = [
    {
      name: "Total de Usuários",
      value: totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Taxa de Ativação",
      value: `${activationRate}%`,
      description: `${activatedUsers} de ${totalUsers} usuários`,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Retenção (7 dias)",
      value: `${retentionRate}%`,
      description: `${activeUsers} usuários ativos`,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Conversão (Free → Pro)",
      value: `${conversionRate}%`,
      description: `${convertedUsers} usuários Pro`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      name: "Churn (30 dias)",
      value: `${churnRate}%`,
      description: `${churnedUsers} cancelamentos`,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Métricas do Produto</h1>
        <p className="text-slate-600 mt-1 text-sm md:text-base">
          Dashboard interno para acompanhamento de métricas de negócio
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.name} className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-3 md:p-6">
                <CardTitle className="text-xs font-medium text-slate-600 truncate pr-2">
                  {metric.name}
                </CardTitle>
                <div className={`rounded-lg p-1.5 shrink-0 ${metric.bgColor}`}>
                  <Icon className={`h-3 w-3 md:h-4 md:w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className={`text-lg md:text-xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                {metric.description && (
                  <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Notas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>
            <strong>Taxa de Ativação:</strong> Usuários que criaram pelo menos 1 prazo / Total de usuários
          </p>
          <p>
            <strong>Retenção:</strong> Usuários que fizeram login nos últimos 7 dias / Total de usuários
          </p>
          <p>
            <strong>Conversão:</strong> Usuários com assinatura Pro ativa / Total de usuários
          </p>
          <p>
            <strong>Churn:</strong> Cancelamentos nos últimos 30 dias / Total de usuários Pro
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

