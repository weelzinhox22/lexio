import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Search, List, Kanban, Upload } from "lucide-react"
import Link from "next/link"
import { ProcessList } from "@/components/processes/process-list"
import { getPaginationParams, buildPaginatedResult } from "@/lib/supabase/pagination"

export default async function ProcessesPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; limit?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const params = await searchParams
  const { page, limit, from, to } = getPaginationParams({
    page: params?.page ? parseInt(params.page) : 1,
    limit: params?.limit ? parseInt(params.limit) : 20,
  })

  // Buscar total para paginação
  const { count } = await supabase
    .from("processes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)

  // Buscar processos paginados
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
      { count: "exact" }
    )
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .range(from, to)

  const pagination = buildPaginatedResult(processes || [], count || 0, page, limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Processos</h1>
          <p className="text-slate-600 mt-1">Gerencie todos os seus processos jurídicos</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {/* View toggle */}
          <div className="flex rounded-full border border-slate-200 overflow-hidden shadow-sm mr-1 hidden sm:flex">
            <Button variant="ghost" size="sm" className="rounded-none border-r border-slate-200 h-9 px-3.5 bg-slate-100 text-slate-900 font-semibold" disabled>
              <List className="h-4 w-4 mr-1.5" />
              Lista
            </Button>
            <Link href="/dashboard/processes/kanban">
              <Button variant="ghost" size="sm" className="rounded-none h-9 px-3.5 hover:bg-slate-50 transition-colors">
                <Kanban className="h-4 w-4 mr-1.5 text-slate-500" />
                <span className="text-slate-600">Kanban</span>
              </Button>
            </Link>
          </div>
          <Link href="/dashboard/processes/search">
            <Button variant="outline" className="w-full sm:w-auto rounded-full shadow-sm">
              <Search className="mr-2 h-4 w-4 text-slate-500" />
              Pesquisar
            </Button>
          </Link>
          <Link href="/dashboard/processes/import">
            <Button variant="outline" className="w-full sm:w-auto rounded-full shadow-sm">
              <Upload className="mr-2 h-4 w-4 text-slate-500" />
              Importar em Lote
            </Button>
          </Link>
          <Link href="/dashboard/processes/new">
            <Button className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold transition-all hover:shadow hover:-translate-y-0.5 px-4">
              <Plus className="mr-2 h-4 w-4" />
              Novo Processo
            </Button>
          </Link>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden">
        <ProcessList processes={pagination.data} />
      </Card>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Mostrando {from + 1} a {Math.min(to + 1, pagination.total)} de {pagination.total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/dashboard/processes?page=${page - 1}&limit=${limit}`}>
                <Button variant="outline" size="sm">
                  Anterior
                </Button>
              </Link>
            )}
            {pagination.hasMore && (
              <Link href={`/dashboard/processes?page=${page + 1}&limit=${limit}`}>
                <Button variant="outline" size="sm">
                  Próxima
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
