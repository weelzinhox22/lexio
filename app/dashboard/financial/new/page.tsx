import { FinancialForm } from "@/components/financial/financial-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function NewFinancialPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch clients and processes for dropdowns
  const [clientsResult, processesResult] = await Promise.all([
    supabase.from("clients").select("id, name").eq("user_id", user!.id),
    supabase.from("processes").select("id, title, process_number").eq("user_id", user!.id),
  ])

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nova Transação</h1>
        <p className="text-slate-600 mt-1">Registre uma nova receita ou despesa</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Informações da Transação</CardTitle>
        </CardHeader>
        <CardContent>
          <FinancialForm clients={clientsResult.data || []} processes={processesResult.data || []} userId={user!.id} />
        </CardContent>
      </Card>
    </div>
  )
}
