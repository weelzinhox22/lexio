import { LeadForm } from "@/components/leads/lead-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function NewLeadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Novo Lead</h1>
        <p className="text-slate-600 mt-1">Cadastre um novo potencial cliente</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Informações do Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadForm userId={user!.id} />
        </CardContent>
      </Card>
    </div>
  )
}
