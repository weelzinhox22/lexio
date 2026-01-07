import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Process, FinancialTransaction, Deadline, Client } from "@/lib/types/database"
import { Activity, Target, TrendingUp, Award } from "lucide-react"

export function PerformanceReport({
  processes,
  transactions,
  deadlines,
  clients,
}: {
  processes: Process[]
  transactions: FinancialTransaction[]
  deadlines: Deadline[]
  clients: Client[]
}) {
  // Overall performance metrics
  const totalRevenue = transactions
    .filter((t) => t.type === "income" && t.status === "paid")
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const avgRevenuePerClient = clients.length > 0 ? totalRevenue / clients.length : 0

  const processCompletionRate =
    processes.length > 0
      ? (
          ((processes.filter((p) => p.status === "won").length +
            processes.filter((p) => p.status === "archived").length) /
            processes.length) *
          100
        ).toFixed(1)
      : "0"

  const deadlineCompletionRate =
    deadlines.length > 0
      ? ((deadlines.filter((d) => d.status === "completed").length / deadlines.length) * 100).toFixed(1)
      : "0"

  // Monthly growth
  const currentMonth = new Date().getMonth()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const currentYear = new Date().getFullYear()

  const currentMonthRevenue = transactions
    .filter((t) => {
      const date = new Date(t.created_at)
      return (
        t.type === "income" &&
        t.status === "paid" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      )
    })
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const lastMonthRevenue = transactions
    .filter((t) => {
      const date = new Date(t.created_at)
      const year = lastMonth === 11 ? currentYear - 1 : currentYear
      return t.type === "income" && t.status === "paid" && date.getMonth() === lastMonth && date.getFullYear() === year
    })
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const revenueGrowth =
    lastMonthRevenue > 0 ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1) : "0"

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Performance Geral</CardTitle>
            <div className="rounded-lg p-2 bg-blue-50">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Number.parseFloat(
                ((Number.parseFloat(processCompletionRate) + Number.parseFloat(deadlineCompletionRate)) / 2).toFixed(1),
              )}
              %
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Crescimento Mensal</CardTitle>
            <div className="rounded-lg p-2 bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${Number.parseFloat(revenueGrowth) >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {Number.parseFloat(revenueGrowth) >= 0 ? "+" : ""}
              {revenueGrowth}%
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Receita Média/Cliente</CardTitle>
            <div className="rounded-lg p-2 bg-purple-50">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(avgRevenuePerClient)}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Taxa de Sucesso</CardTitle>
            <div className="rounded-lg p-2 bg-emerald-50">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{processCompletionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Resumo de Produtividade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Processos em andamento</span>
                <span className="text-lg font-semibold text-slate-900">
                  {processes.filter((p) => p.status === "active").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Prazos cumpridos no prazo</span>
                <span className="text-lg font-semibold text-green-600">
                  {deadlines.filter((d) => d.status === "completed").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Transações pagas</span>
                <span className="text-lg font-semibold text-blue-600">
                  {transactions.filter((t) => t.status === "paid").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Clientes ativos</span>
                <span className="text-lg font-semibold text-purple-600">
                  {clients.filter((c) => c.status === "active").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Indicadores Chave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">Taxa de conclusão de processos</span>
                  <span className="font-semibold text-slate-900">{processCompletionRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${processCompletionRate}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">Taxa de cumprimento de prazos</span>
                  <span className="font-semibold text-slate-900">{deadlineCompletionRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${deadlineCompletionRate}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">Clientes ativos vs total</span>
                  <span className="font-semibold text-slate-900">
                    {clients.length > 0
                      ? ((clients.filter((c) => c.status === "active").length / clients.length) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{
                      width: `${
                        clients.length > 0
                          ? (clients.filter((c) => c.status === "active").length / clients.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Análise Comparativa Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Receita Mês Atual</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(currentMonthRevenue)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Receita Mês Anterior</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(lastMonthRevenue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
