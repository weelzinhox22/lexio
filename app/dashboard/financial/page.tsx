import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import Link from "next/link"
import { FinancialList } from "@/components/financial/financial-list"
import { FinancialStats } from "@/components/financial/financial-stats"

export default async function FinancialPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: transactions } = await supabase
    .from("financial_transactions")
    .select(
      `
      *,
      clients (
        id,
        name
      ),
      processes (
        id,
        title,
        process_number
      )
    `,
    )
    .eq("user_id", user!.id)
    .order("due_date", { ascending: false })

  // Calculate stats
  const income = transactions?.filter((t) => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0) || 0
  const expenses = transactions?.filter((t) => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0) || 0
  const pending = transactions?.filter((t) => t.status === "pending").reduce((acc, t) => acc + Number(t.amount), 0) || 0
  const overdue = transactions?.filter((t) => t.status === "overdue").reduce((acc, t) => acc + Number(t.amount), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-600 mt-1">Controle completo das suas receitas e despesas</p>
        </div>
        <Link href="/dashboard/financial/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </Link>
      </div>

      <FinancialStats income={income} expenses={expenses} pending={pending} overdue={overdue} />

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="income">Receitas</TabsTrigger>
              <TabsTrigger value="expense">Despesas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="overdue">Atrasadas</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <FinancialList transactions={transactions || []} />
            </TabsContent>
            <TabsContent value="income">
              <FinancialList transactions={transactions?.filter((t) => t.type === "income") || []} />
            </TabsContent>
            <TabsContent value="expense">
              <FinancialList transactions={transactions?.filter((t) => t.type === "expense") || []} />
            </TabsContent>
            <TabsContent value="pending">
              <FinancialList transactions={transactions?.filter((t) => t.status === "pending") || []} />
            </TabsContent>
            <TabsContent value="overdue">
              <FinancialList transactions={transactions?.filter((t) => t.status === "overdue") || []} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
