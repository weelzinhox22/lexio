import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudienceForm } from "@/components/audiences/audience-form"

export default async function NewAudiencePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Buscar processos e clientes
  const [processesResult, clientsResult] = await Promise.all([
    supabase
      .from("processes")
      .select("id, title, process_number")
      .eq("user_id", user.id)
      .order("title", { ascending: true }),
    supabase
      .from("clients")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
  ])

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Nova Audiência</h1>
        <p className="text-slate-600 mt-1 text-sm md:text-base">Cadastre uma nova audiência e receba lembretes automáticos</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Informações da Audiência</CardTitle>
        </CardHeader>
        <CardContent>
          <AudienceForm
            userId={user.id}
            processes={processesResult.data || []}
            clients={clientsResult.data || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}

