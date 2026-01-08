import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialReport } from "@/components/reports/financial-report"
import { ProcessReport } from "@/components/reports/process-report"
import { ClientReport } from "@/components/reports/client-report"
import { PerformanceReport } from "@/components/reports/performance-report"

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all data for reports
  const [processesResult, clientsResult, financialResult, deadlinesResult, leadsResult] = await Promise.all([
    supabase.from("processes").select("*").eq("user_id", user!.id),
    supabase.from("clients").select("*").eq("user_id", user!.id),
    supabase.from("financial_transactions").select("*").eq("user_id", user!.id),
    supabase.from("deadlines").select("*").eq("user_id", user!.id),
    supabase.from("leads").select("*").eq("user_id", user!.id),
  ])

  const processes = processesResult.data || []
  const clients = clientsResult.data || []
  const transactions = financialResult.data || []
  const deadlines = deadlinesResult.data || []
  const leads = leadsResult.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Relatórios e Análises</h1>
        <p className="text-slate-600 mt-1 text-sm md:text-base">Insights completos sobre seu escritório jurídico</p>
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 md:gap-0">
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="processes">Processos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6 mt-6">
          <FinancialReport transactions={transactions} />
        </TabsContent>

        <TabsContent value="processes" className="space-y-6 mt-6">
          <ProcessReport processes={processes} deadlines={deadlines} />
        </TabsContent>

        <TabsContent value="clients" className="space-y-6 mt-6">
          <ClientReport clients={clients} leads={leads} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <PerformanceReport
            processes={processes}
            transactions={transactions}
            deadlines={deadlines}
            clients={clients}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
