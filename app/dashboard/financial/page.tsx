import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, TrendingDown, Plus, Briefcase, Scale } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function FinancialPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Buscar transações financeiras
  const { data: transactions } = await supabase
    .from("financial_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  // Buscar honorários de processos ganhos
  const { data: wonProcesses } = await supabase
    .from("processes")
    .select("*")
    .eq("user_id", user.id)
    .eq("status_ganho", "ganho")
    .not("honorario_calculado", "is", null)

  // Calcular totais
  const totalReceitas = transactions
    ?.filter((t) => t.type === "receita")
    .reduce((sum, t) => sum + (t.amount || 0), 0) || 0

  const totalDespesas = transactions
    ?.filter((t) => t.type === "despesa")
    .reduce((sum, t) => sum + (t.amount || 0), 0) || 0

  const totalHonorarios = wonProcesses?.reduce((sum, p) => sum + (p.honorario_calculado || 0), 0) || 0

  const saldo = totalReceitas - totalDespesas

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-600 mt-1">Gerencie suas finanças e honorários</p>
        </div>
        <Link href="/dashboard/financial/new">
          <Button className="bg-slate-900 hover:bg-slate-800">
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </Link>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {transactions?.filter((t) => t.type === "receita").length || 0} transações
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-red-600 mt-1">
              {transactions?.filter((t) => t.type === "despesa").length || 0} transações
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Honorários</CardTitle>
            <Scale className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              R$ {totalHonorarios.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              De {wonProcesses?.length || 0} processos ganhos
            </p>
          </CardContent>
        </Card>

        <Card
          className={`border-2 ${
            saldo >= 0
              ? "border-green-300 bg-gradient-to-br from-green-100 to-emerald-100"
              : "border-red-300 bg-gradient-to-br from-red-100 to-rose-100"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${saldo >= 0 ? "text-green-900" : "text-red-900"}`}>
              Saldo
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${saldo >= 0 ? "text-green-600" : "text-red-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? "text-green-900" : "text-red-900"}`}>
              R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className={`text-xs mt-1 ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
              {saldo >= 0 ? "Positivo" : "Negativo"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Honorários de Processos Ganhos */}
      {wonProcesses && wonProcesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Honorários de Processos Ganhos
            </CardTitle>
            <CardDescription>Honorários calculados automaticamente dos processos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wonProcesses.map((process) => (
                <div
                  key={process.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{process.title}</p>
                    <p className="text-sm text-slate-600">{process.process_number}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>
                        Valor da Causa: R${" "}
                        {(process.valor_causa || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span>•</span>
                      <span>Percentual: {process.percentual_honorario}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-700">
                      R$ {(process.honorario_calculado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <Badge className="bg-green-100 text-green-700 border-green-300 mt-1">Honorário</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Histórico de movimentações financeiras</CardDescription>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Nenhuma transação cadastrada</p>
              <Link href="/dashboard/financial/new">
                <Button>Adicionar Primeira Transação</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{transaction.description}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(transaction.date).toLocaleDateString("pt-BR")}
                      {transaction.category && ` • ${transaction.category}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === "receita" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "receita" ? "+" : "-"} R${" "}
                      {(transaction.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant={transaction.type === "receita" ? "default" : "destructive"}>
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
