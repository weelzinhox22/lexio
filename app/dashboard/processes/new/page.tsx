import { ProcessForm } from "@/components/processes/process-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function NewProcessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch clients for dropdown
  const { data: clients } = await supabase.from("clients").select("id, name").eq("user_id", user!.id)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Novo Processo</h1>
        <p className="text-slate-600 mt-1">Cadastre um novo processo jurídico</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Informações do Processo</CardTitle>
        </CardHeader>
        <CardContent>
          <ProcessForm clients={clients || []} userId={user!.id} />
        </CardContent>
      </Card>
    </div>
  )
}
