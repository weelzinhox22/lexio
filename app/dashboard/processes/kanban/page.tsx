import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus, Search, List, Kanban } from "lucide-react"
import Link from "next/link"
import { ProcessKanban } from "@/components/processes/process-kanban"

export default async function ProcessesKanbanPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Buscar todos os processos (sem paginação para o Kanban)
    const { data: processes } = await supabase
        .from("processes")
        .select(`
      id,
      title,
      process_number,
      status,
      priority,
      court,
      value,
      created_at,
      clients (
        id,
        name
      )
    `)
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Processos</h1>
                    <p className="text-slate-600 mt-1 text-sm">Visualização em Kanban — arraste para mudar o status</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    {/* View toggle */}
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        <Link href="/dashboard/processes">
                            <Button variant="ghost" size="sm" className="rounded-none border-r border-slate-200 h-9 px-3">
                                <List className="h-4 w-4 mr-1.5" />
                                Lista
                            </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="rounded-none h-9 px-3 bg-slate-100 text-slate-900 font-semibold" disabled>
                            <Kanban className="h-4 w-4 mr-1.5" />
                            Kanban
                        </Button>
                    </div>

                    <Link href="/dashboard/processes/search">
                        <Button variant="outline" className="w-full sm:w-auto" size="sm">
                            <Search className="mr-2 h-4 w-4" />
                            DataJud
                        </Button>
                    </Link>
                    <Link href="/dashboard/processes/new">
                        <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 sm:w-auto" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Processo
                        </Button>
                    </Link>
                </div>
            </div>

            <ProcessKanban processes={(processes || []) as any} />
        </div>
    )
}
