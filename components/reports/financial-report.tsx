"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FinancialTransaction } from "@/lib/types/database"
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function FinancialReport({ transactions }: { transactions: FinancialTransaction[] }) {
  const [incomeChartType, setIncomeChartType] = useState<'pie' | 'bar'>('pie')
  const [expenseChartType, setExpenseChartType] = useState<'pie' | 'bar'>('pie')
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']

  const incomeChartData = Object.entries(incomeByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }))

  const expenseChartData = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }))

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
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">Receitas por Categoria</CardTitle>
              <Select value={incomeChartType} onValueChange={(v: 'pie' | 'bar') => setIncomeChartType(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pie">Pizza</SelectItem>
                  <SelectItem value="bar">Barras</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {incomeChartData.length > 0 ? (
              <div className="h-[300px]">
                {incomeChartType === 'pie' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incomeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="value" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-8">Nenhuma receita encontrada</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">Despesas por Categoria</CardTitle>
              <Select value={expenseChartType} onValueChange={(v: 'pie' | 'bar') => setExpenseChartType(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pie">Pizza</SelectItem>
                  <SelectItem value="bar">Barras</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {expenseChartData.length > 0 ? (
              <div className="h-[300px]">
                {expenseChartType === 'pie' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="value" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-8">Nenhuma despesa encontrada</p>
            )}
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
