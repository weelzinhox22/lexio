import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, Bell, DollarSign, FileText, TrendingUp, Calendar, AlertCircle, Clock, CheckCircle2 } from "lucide-react"
import { HonorariosCard } from "@/components/dashboard/honorarios-card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch dashboard stats
  const [
    processesResult,
    clientsResult,
    deadlinesResult,
    financialResult,
    documentsResult,
    leadsResult,
    recentProcesses,
    upcomingDeadlines,
    recentTransactions,
    overdueDeadlines,
    wonProcesses,
  ] = await Promise.all([
    supabase.from("processes").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase
      .from("deadlines")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .eq("status", "pending"),
    supabase.from("financial_transactions").select("amount, type, status").eq("user_id", user!.id),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("leads").select("id, status", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase
      .from("processes")
      .select("id, title, process_number, priority, status, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("deadlines")
      .select("id, title, deadline_date, priority, processes(title, process_number)")
      .eq("user_id", user!.id)
      .eq("status", "pending")
      .gte("deadline_date", new Date().toISOString().split("T")[0])
      .order("deadline_date", { ascending: true })
      .limit(5),
    supabase
      .from("financial_transactions")
      .select("id, title, amount, type, status, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("deadlines")
      .select("id, title, deadline_date, priority")
      .eq("user_id", user!.id)
      .eq("status", "pending")
      .lt("deadline_date", new Date().toISOString().split("T")[0])
      .limit(5),
    supabase
      .from("processes")
      .select("id, title, process_number, valor_causa, percentual_honorario, honorario_calculado")
      .eq("user_id", user!.id)
      .eq("status_ganho", "ganho")
      .not("honorario_calculado", "is", null)
      .order("created_at", { ascending: false }),
  ])

  const totalIncome = financialResult.data
    ?.filter((t) => t.type === "income" && t.status === "paid")
    .reduce((acc, t) => acc + Number(t.amount), 0) || 0

  const totalExpenses = financialResult.data
    ?.filter((t) => t.type === "expense" && t.status === "paid")
    .reduce((acc, t) => acc + Number(t.amount), 0) || 0

  const pendingIncome = financialResult.data
    ?.filter((t) => t.type === "income" && t.status === "pending")
    .reduce((acc, t) => acc + Number(t.amount), 0) || 0

  const newLeads = leadsResult.data?.filter((l: any) => l.status === "new").length || 0
  const convertedLeads = leadsResult.data?.filter((l: any) => l.status === "converted").length || 0

  // Calcular total de honorários
  const totalHonorarios = wonProcesses.data?.reduce((acc, p: any) => acc + Number(p.honorario_calculado || 0), 0) || 0

  const stats = [
    {
      name: "Processos Ativos",
      value: processesResult.count || 0,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/dashboard/processes",
    },
    {
      name: "Clientes",
      value: clientsResult.count || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/dashboard/clients",
    },
    {
      name: "Prazos Pendentes",
      value: deadlinesResult.count || 0,
      icon: Bell,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      link: "/dashboard/deadlines",
    },
    {
      name: "Documentos",
      value: documentsResult.count || 0,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/dashboard/documents",
    },
    {
      name: "Receita Total",
      value: `R$ ${totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      link: "/dashboard/financial",
    },
    {
      name: "A Receber",
      value: `R$ ${pendingIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      link: "/dashboard/financial",
    },
    {
      name: "Honorários Calculados",
      value: `R$ ${totalHonorarios.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/dashboard/financial",
      description: `${wonProcesses.data?.length || 0} processo(s) ganho(s)`,
    },
    {
      name: "Leads Novos",
      value: newLeads,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      link: "/dashboard/leads",
    },
    {
      name: "Leads Convertidos",
      value: convertedLeads,
      icon: CheckCircle2,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      link: "/dashboard/leads",
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
          <Link key={stat.name} href={stat.link || "#"}>
            <Card className="border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
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
          </Link>
        ))}
      </div>

      {/* Card de Honorários */}
      {wonProcesses.data && wonProcesses.data.length > 0 && (
        <HonorariosCard 
          processes={wonProcesses.data} 
          totalHonorarios={totalHonorarios}
        />
      )}

      {/* Financial Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">Resumo Financeiro</CardTitle>
              <Link href="/dashboard/financial">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Receitas</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Despesas</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600 rotate-180" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Saldo Líquido</p>
                  <p
                    className={`text-2xl font-bold ${
                      totalIncome - totalExpenses >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    R$ {(totalIncome - totalExpenses).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Prazos Vencidos</span>
              <Badge variant="destructive">{overdueDeadlines.data?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Prazos Hoje</span>
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                {upcomingDeadlines.data?.filter(
                  (d: any) => new Date(d.deadline_date).toISOString().split("T")[0] === new Date().toISOString().split("T")[0]
                ).length || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Processos Urgentes</span>
              <Badge variant="outline" className="border-red-200 text-red-700">
                {recentProcesses.data?.filter((p: any) => p.priority === "urgent").length || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">A Receber</span>
              <Badge variant="outline" className="border-amber-200 text-amber-700">
                R$ {pendingIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos Prazos */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Prazos
              </CardTitle>
              <Link href="/dashboard/deadlines">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.data && upcomingDeadlines.data.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.data.map((deadline: any) => {
                  const deadlineDate = new Date(deadline.deadline_date)
                  const today = new Date()
                  const daysDiff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  const isToday = daysDiff === 0
                  const isUrgent = daysDiff <= 3

                  return (
                    <div
                      key={deadline.id}
                      className={`p-3 rounded-lg border ${
                        isToday ? "bg-red-50 border-red-200" : isUrgent ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{deadline.title}</p>
                          {deadline.processes && (
                            <p className="text-xs text-slate-600 mt-1">
                              {deadline.processes.title} - {deadline.processes.process_number}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span className="text-xs text-slate-600">
                              {deadlineDate.toLocaleDateString("pt-BR")} {isToday && "(Hoje)"}
                              {!isToday && daysDiff > 0 && `(${daysDiff} ${daysDiff === 1 ? "dia" : "dias"})`}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            deadline.priority === "urgent"
                              ? "border-red-200 text-red-700"
                              : deadline.priority === "high"
                                ? "border-orange-200 text-orange-700"
                                : "border-slate-200 text-slate-700"
                          }
                        >
                          {deadline.priority === "urgent" ? "Urgente" : deadline.priority === "high" ? "Alta" : "Normal"}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-4">Nenhum prazo próximo</p>
            )}
          </CardContent>
        </Card>

        {/* Processos Recentes */}
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Processos Recentes
              </CardTitle>
              <Link href="/dashboard/processes">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentProcesses.data && recentProcesses.data.length > 0 ? (
              <div className="space-y-3">
                {recentProcesses.data.map((process: any) => (
                  <Link key={process.id} href={`/dashboard/processes/${process.id}`}>
                    <div className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{process.title}</p>
                          <p className="text-xs text-slate-600 mt-1">{process.process_number}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(process.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className={
                              process.priority === "urgent"
                                ? "border-red-200 text-red-700"
                                : process.priority === "high"
                                  ? "border-orange-200 text-orange-700"
                                  : "border-slate-200 text-slate-700"
                            }
                          >
                            {process.priority === "urgent" ? "Urgente" : process.priority === "high" ? "Alta" : "Normal"}
                          </Badge>
                          <Badge
                            variant={process.status === "active" ? "default" : "secondary"}
                            className={process.status === "active" ? "bg-blue-100 text-blue-700" : ""}
                          >
                            {process.status === "active" ? "Ativo" : "Arquivado"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-4">Nenhum processo cadastrado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prazos Vencidos e Transações Recentes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {overdueDeadlines.data && overdueDeadlines.data.length > 0 && (
          <Card className="border-slate-200 border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Prazos Vencidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueDeadlines.data.map((deadline: any) => (
                  <div key={deadline.id} className="p-3 rounded-lg bg-white border border-red-200">
                    <p className="font-medium text-slate-900">{deadline.title}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Vencido em {new Date(deadline.deadline_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))}
                <Link href="/dashboard/deadlines">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Ver todos os prazos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Transações Recentes
              </CardTitle>
              <Link href="/dashboard/financial">
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.data && recentTransactions.data.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.data.map((transaction: any) => (
                  <div key={transaction.id} className="p-3 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{transaction.title}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {new Date(transaction.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}R${" "}
                          {Number(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            transaction.status === "paid"
                              ? "border-green-200 text-green-700"
                              : transaction.status === "pending"
                                ? "border-orange-200 text-orange-700"
                                : "border-slate-200 text-slate-700"
                          }
                        >
                          {transaction.status === "paid" ? "Pago" : transaction.status === "pending" ? "Pendente" : "Atrasado"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-4">Nenhuma transação recente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
