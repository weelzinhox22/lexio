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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Processos</h1>
          <p className="text-slate-600 mt-1">Gerencie todos os seus processos jurídicos</p>
        </div>
        <div className="flex items-center gap-3">
          <UpdateProcessesButton userId={user!.id} />
          <Link href="/dashboard/processes/new">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novo Processo
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
