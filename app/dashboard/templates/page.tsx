import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TemplatesListAdvanced } from "@/components/templates/templates-list-advanced"

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

  return (
    <TemplatesListAdvanced
      initialTemplates={templates || []}
      userId={user.id}
      userEmail={user.email}
    />
  )
}

