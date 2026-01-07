import { DocumentForm } from "@/components/documents/document-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function NewDocumentPage() {
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
        <h1 className="text-3xl font-bold text-slate-900">Novo Documento</h1>
        <p className="text-slate-600 mt-1">Faça upload de um novo documento</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Informações do Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentForm clients={clientsResult.data || []} processes={processesResult.data || []} userId={user!.id} />
        </CardContent>
      </Card>
    </div>
  )
}
