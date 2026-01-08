import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TemplatesManager } from "@/components/templates/templates-manager"

export default async function TemplatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Buscar templates do sistema e do usuário
  const { data: templates } = await supabase
    .from("document_templates")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  // Buscar papéis timbrados
  const { data: letterheads } = await supabase
    .from("letterheads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Modelos de Documentos</h1>
        <p className="text-slate-600 mt-1">
          Crie e gerencie templates de documentos jurídicos com preenchimento automático
        </p>
      </div>

      <TemplatesManager
        initialTemplates={templates || []}
        initialLetterheads={letterheads || []}
        userId={user.id}
      />
    </div>
  )
}

