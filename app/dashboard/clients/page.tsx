import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ClientList } from "@/components/clients/client-list"

export default async function ClientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  // Get client stats
  const activeClients = clients?.filter((c) => c.status === "active").length || 0
  const totalClients = clients?.length || 0

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">
            {activeClients} clientes ativos de {totalClients} totais
          </p>
        </div>
        <Link href="/dashboard/clients/new" className="flex-1 sm:flex-initial">
          <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-sm">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Novo Cliente</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <ClientList clients={clients || []} />
      </Card>
    </div>
  )
}
