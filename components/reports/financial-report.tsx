import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FinancialTransaction } from "@/lib/types/database"
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"

export function FinancialReport({ transactions }: { transactions: FinancialTransaction[] }) {
  // Calculate metrics
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0)

  const netProfit = totalIncome - totalExpenses

  const paidTransactions = transactions.filter((t) => t.status === "paid").reduce((acc, t) => acc + Number(t.amount), 0)

  const pendingTransactions = transactions
    .filter((t) => t.status === "pending")
    .reduce((acc, t) => acc + Number(t.amount), 0)

  // Group by category
  const incomeByCategory: Record<string, number> = {}
  const expenseByCategory: Record<string, number> = {}

  transactions.forEach((t) => {
    const category = t.category || "Outros"
    if (t.type === "income") {
      incomeByCategory[category] = (incomeByCategory[category] || 0) + Number(t.amount)
    } else {
      expenseByCategory[category] = (expenseByCategory[category] || 0) + Number(t.amount)
    }
  })

  // Group by month
  const monthlyData: Record<string, { income: number; expense: number }> = {}
  transactions.forEach((t) => {
    const date = new Date(t.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 }
    }
    if (t.type === "income") {
      monthlyData[monthKey].income += Number(t.amount)
    } else {
      monthlyData[monthKey].expense += Number(t.amount)
    }
  })

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Receitas Totais</CardTitle>
            <div className="rounded-lg p-2 bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Despesas Totais</CardTitle>
            <div className="rounded-lg p-2 bg-red-50">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Lucro Líquido</CardTitle>
            <div className={`rounded-lg p-2 ${netProfit >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
              <DollarSign className={`h-5 w-5 ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(netProfit)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">A Receber</CardTitle>
            <div className="rounded-lg p-2 bg-orange-50">
              <CreditCard className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingTransactions)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(incomeByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-medium">{category}</span>
                      <span className="text-slate-900 font-semibold">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${(amount / totalIncome) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(expenseByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-medium">{category}</span>
                      <span className="text-slate-900 font-semibold">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${(amount / totalExpenses) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Fluxo de Caixa Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(monthlyData)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 6)
              .map(([month, data]) => {
                const monthDate = new Date(month + "-01")
                const monthName = monthDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                const profit = data.income - data.expense

                return (
                  <div key={month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-medium capitalize">{monthName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-green-600">↑ {formatCurrency(data.income)}</span>
                        <span className="text-red-600">↓ {formatCurrency(data.expense)}</span>
                        <span className={`font-semibold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          = {formatCurrency(profit)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${(data.income / (data.income + data.expense)) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-red-500"
                        style={{
                          width: `${(data.expense / (data.income + data.expense)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
