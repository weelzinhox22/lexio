import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LawsSearch } from "@/components/laws/laws-search"

export default async function LawsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Consulta de Leis</h1>
        <p className="text-slate-600 mt-1">
          Pesquise e consulte leis, decretos e códigos brasileiros
        </p>
      </div>

      <LawsSearch />
    </div>
  )
}

