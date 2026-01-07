import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Bell, DollarSign } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch dashboard stats
  const [processesResult, clientsResult, deadlinesResult, financialResult] = await Promise.all([
    supabase.from("processes").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase
      .from("deadlines")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .eq("status", "pending"),
    supabase.from("financial_transactions").select("amount, type").eq("user_id", user!.id).eq("status", "paid"),
  ])

  const stats = [
    {
      name: "Processos Ativos",
      value: processesResult.count || 0,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Clientes",
      value: clientsResult.count || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Prazos Pendentes",
      value: deadlinesResult.count || 0,
      icon: Bell,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      name: "Receita Total",
      value: `R$ ${
        financialResult.data
          ?.filter((t) => t.type === "income")
          .reduce((acc, t) => acc + Number(t.amount), 0)
          .toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"
      }`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Visão geral do seu escritório jurídico</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">{stat.name}</CardTitle>
              <div className={cn("rounded-lg p-2", stat.bgColor)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Próximos Prazos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Nenhum prazo próximo</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Nenhuma atividade recente</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
