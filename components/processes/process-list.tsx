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
          <Button className="mt-4 bg-slate-900 hover:bg-slate-800 text-white">Criar primeiro processo</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-200">
      {processes.map((process) => (
        <div key={process.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{process.title}</h3>
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
                    ? "bg-blue-100 text-blue-700"
                    : process.status === "won"
                      ? "bg-green-100 text-green-700"
                      : ""
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
              <Badge
                variant="outline"
                className={
                  process.priority === "urgent"
                    ? "border-red-200 text-red-700"
                    : process.priority === "high"
                      ? "border-orange-200 text-orange-700"
                      : "border-slate-200 text-slate-700"
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
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>Processo: {process.process_number}</span>
              <span>•</span>
              <span>Cliente: {process.clients.name}</span>
              {process.court && (
                <>
                  <span>•</span>
                  <span>{process.court}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/processes/${process.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/dashboard/processes/${process.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700"
              onClick={() => setDeleteDialog({ isOpen: true, process, isLoading: false })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
