"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Process } from "@/lib/types/database"

type ProcessWithClient = Process & {
  clients: {
    id: string
    name: string
  }
}

export function ProcessList({ processes }: { processes: ProcessWithClient[] }) {
  const router = useRouter()
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    process: ProcessWithClient | null
    isLoading: boolean
  }>({
    isOpen: false,
    process: null,
    isLoading: false,
  })

  const handleDelete = async () => {
    if (!deleteDialog.process) return

    setDeleteDialog((prev) => ({ ...prev, isLoading: true }))
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('processes')
        .delete()
        .eq('id', deleteDialog.process.id)

      if (error) throw error

      router.refresh()
      setDeleteDialog({ isOpen: false, process: null, isLoading: false })
    } catch (error) {
      console.error('Erro ao excluir processo:', error)
      setDeleteDialog((prev) => ({ ...prev, isLoading: false }))
    }
  }

  if (processes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-600">Nenhum processo cadastrado ainda.</p>
        <Link href="/dashboard/processes/new">
          <Button className="mt-4 w-full bg-slate-900 text-white hover:bg-slate-800 sm:w-auto rounded-full">
            Criar primeiro processo
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-100 bg-white">
      {processes.map((process) => (
        <div
          key={process.id}
          className="flex flex-col gap-4 p-5 hover:bg-slate-50 transition-colors duration-200 sm:flex-row sm:items-start sm:justify-between group"
        >
          <div className="flex-1 space-y-2.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href={`/dashboard/processes/${process.id}`} className="hover:underline decoration-slate-300 underline-offset-4 overflow-hidden">
                <h3 className="text-[15px] sm:text-base font-bold text-slate-900 leading-tight truncate">{process.title}</h3>
              </Link>
              <Badge
                variant={
                  process.status === "active"
                    ? "default"
                    : process.status === "won"
                      ? "default"
                      : process.status === "lost"
                        ? "destructive"
                        : "secondary"
                }
                className={
                  process.status === "active"
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-none border-blue-200"
                    : process.status === "won"
                      ? "bg-green-100 text-green-700 hover:bg-green-200 shadow-none border-green-200"
                      : "shadow-none"
                }
              >
                {process.status === "active"
                  ? "Ativo"
                  : process.status === "won"
                    ? "Ganho"
                    : process.status === "lost"
                      ? "Perdido"
                      : "Arquivado"}
              </Badge>
              {(process as any).polo && (
                <Badge
                  variant="outline"
                  className={
                    (process as any).polo === "ativo" || (process as any).polo === "vitima"
                      ? "border-green-200 text-green-700 bg-green-50 shadow-none"
                      : (process as any).polo === "testemunha" ? "border-blue-200 text-blue-700 bg-blue-50 shadow-none" : "border-orange-200 text-orange-700 bg-orange-50 shadow-none"
                  }
                >
                  {process.process_type === 'Inquérito Policial'
                    ? ((process as any).polo === "investigado" ? "Investigado" : (process as any).polo === "vitima" ? "Vítima/Ofendido" : "Testemunha")
                    : ((process as any).polo === "ativo" ? "Polo Ativo" : "Polo Passivo")}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={
                  process.priority === "urgent"
                    ? "border-red-200 text-red-700 bg-red-50 shadow-none"
                    : process.priority === "high"
                      ? "border-orange-200 text-orange-700 bg-orange-50 shadow-none"
                      : "border-slate-200 text-slate-700 bg-slate-50 shadow-none"
                }
              >
                {process.priority === "urgent"
                  ? "Urgente"
                  : process.priority === "high"
                    ? "Alta"
                    : process.priority === "medium"
                      ? "Média"
                      : "Baixa"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60 font-semibold">
                <span className="text-slate-400 font-normal">Nº</span>
                {process.process_number}
              </span>
              <span className="text-slate-300 md:hidden xl:inline">•</span>
              <span className="flex items-center"><span className="text-slate-400 font-normal mr-1">Cliente:</span> {process.clients.name}</span>
              {process.court && (
                <>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span>{process.court}</span>
                </>
              )}
              {(process as any).valor_causa && (
                <>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="font-medium text-emerald-700">
                    Valor: R$ {(process as any).valor_causa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </>
              )}
              {(process as any).honorario_calculado && (
                <>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    Honorários: R$ {(process as any).honorario_calculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 sm:mt-0 sm:shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-100 sm:border-transparent">
            <Link href={`/dashboard/processes/${process.id}`} className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-semibold px-4 tracking-tight">
                <Eye className="h-4 w-4 mr-1.5" />
                Acessar Processo
              </Button>
            </Link>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href={`/dashboard/processes/${process.id}/edit`} className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-full shadow-sm border-slate-200 hover:bg-slate-200/50 hover:border-slate-300 text-slate-700 font-semibold transition-colors px-4">
                  <Edit className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                  Editar
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full shadow-sm border-red-100 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 font-semibold transition-colors px-3"
                onClick={() => setDeleteDialog({ isOpen: true, process, isLoading: false })}
                title="Excluir processo"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, process: null, isLoading: false })}
        onConfirm={handleDelete}
        title="Excluir Processo"
        itemName={deleteDialog.process?.title || ''}
        itemType="processo"
        isLoading={deleteDialog.isLoading}
      />
    </div>
  )
}
