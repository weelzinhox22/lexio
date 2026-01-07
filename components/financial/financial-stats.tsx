import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react"

export function FinancialStats({
  income,
  expenses,
  pending,
  overdue,
}: {
  income: number
  expenses: number
  pending: number
  overdue: number
}) {
  const balance = income - expenses

  const stats = [
    {
      name: "Receitas",
      value: income.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Despesas",
      value: expenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      name: "Saldo",
      value: balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: DollarSign,
      color: balance >= 0 ? "text-emerald-600" : "text-red-600",
      bgColor: balance >= 0 ? "bg-emerald-50" : "bg-red-50",
    },
    {
      name: "Atrasadas",
      value: overdue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">{stat.name}</CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
