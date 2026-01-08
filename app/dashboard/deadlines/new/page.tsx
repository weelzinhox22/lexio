import { DeadlineFormEnhanced } from "@/components/deadlines/deadline-form-enhanced"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Calculator } from "lucide-react"

export default async function NewDeadlinePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch processes for dropdown
  const { data: processes } = await supabase
    .from("processes")
    .select("id, title, process_number")
    .eq("user_id", user!.id)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Calculator className="h-8 w-8" />
          Novo Prazo com Cálculo Automático
        </h1>
        <p className="text-slate-600 mt-1">Selecione o tipo de prazo para cálculo automático ou informe manualmente</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Informações do Prazo</CardTitle>
        </CardHeader>
        <CardContent>
          <DeadlineFormEnhanced processes={processes || []} userId={user!.id} />
        </CardContent>
      </Card>
    </div>
  )
}
