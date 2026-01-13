import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { ProcessList } from "@/components/processes/process-list"
import { getPaginationParams, buildPaginatedResult } from "@/lib/supabase/pagination"

export default async function ProcessesPage({
  searchParams,
}: {
  searchParams?: { page?: string; limit?: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { page, limit, from, to } = getPaginationParams({
    page: searchParams?.page ? parseInt(searchParams.page) : 1,
    limit: searchParams?.limit ? parseInt(searchParams.limit) : 20,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Processos</h1>
          <p className="text-slate-600 mt-1">Gerencie todos os seus processos jurídicos</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/processes/search">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Pesquisar no DataJud (Processo)
            </Button>
          </Link>
          <Link href="/dashboard/processes/new">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novo Processo
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-slate-200">
        <ProcessList processes={pagination.data} />
      </Card>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
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
