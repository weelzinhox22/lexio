import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, RefreshCw } from "lucide-react"
import Link from "next/link"
import { ProcessList } from "@/components/processes/process-list"
import { UpdateProcessesButton } from "@/components/processes/update-processes-button"

export default async function ProcessesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: processes } = await supabase
    .from("processes")
    .select(
      `
      *,
      clients (
        id,
        name
      )
    `,
    )
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Processos</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">Gerencie todos os seus processos jurídicos</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <UpdateProcessesButton userId={user!.id} />
          <Link href="/dashboard/processes/new" className="flex-1 sm:flex-initial">
            <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Novo Processo</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-slate-200">
        <ProcessList processes={processes || []} />
      </Card>
    </div>
  )
}
