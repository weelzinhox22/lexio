"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { Eye, Edit, Trash2, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Client } from "@/lib/types/database"

export function ClientList({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    client: Client | null
    isLoading: boolean
  }>({
    isOpen: false,
    client: null,
    isLoading: false,
  })

  const handleDelete = async () => {
    if (!deleteDialog.client) return

    setDeleteDialog((prev) => ({ ...prev, isLoading: true }))
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', deleteDialog.client.id)

      if (error) throw error

      router.refresh()
      setDeleteDialog({ isOpen: false, client: null, isLoading: false })
    } catch (error) {
      console.error('Erro ao excluir cliente:', error)
      setDeleteDialog((prev) => ({ ...prev, isLoading: false }))
    }
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-600 mb-4">Nenhum cliente cadastrado ainda.</p>
        <Link href="/dashboard/clients/new">
          <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 shadow-sm">Criar primeiro cliente</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-100 bg-white">
      {clients.map((client) => (
        <div key={client.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-5 hover:bg-slate-50 transition-colors duration-200 gap-4 group">
          <div className="flex-1 space-y-2.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href={`/dashboard/clients/${client.id}`} className="hover:underline decoration-slate-300 underline-offset-4 overflow-hidden">
                <h3 className="font-bold text-slate-900 text-[15px] sm:text-base leading-tight truncate">{client.name}</h3>
              </Link>
              <Badge
                variant={client.status === "active" ? "default" : "secondary"}
                className={`text-xs shadow-none border-transparent ${client.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-700"}`}
              >
                {client.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
              <Badge variant="outline" className="text-slate-700 text-xs shadow-none border-slate-200 font-medium px-2 bg-white">
                {client.client_type === "person" ? "PF" : "PJ"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
              {client.email && (
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </span>
              )}
              {client.phone && (
                <>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    {client.phone}
                  </span>
                </>
              )}
              {client.cpf_cnpj && (
                <>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="truncate bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60 font-semibold text-slate-600">{client.cpf_cnpj}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 sm:mt-0 sm:shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-100 sm:border-transparent">
            <Link href={`/dashboard/clients/${client.id}`} className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 font-semibold px-4 tracking-tight">
                <Eye className="h-4 w-4 mr-1.5" />
                Acessar Cliente
              </Button>
            </Link>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href={`/dashboard/clients/${client.id}/edit`} className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-full shadow-sm border-slate-200 hover:bg-slate-200/50 hover:border-slate-300 text-slate-700 font-semibold transition-colors px-4">
                  <Edit className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                  Editar
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                title="Excluir"
                className="shrink-0 rounded-full shadow-sm border-red-100 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 font-semibold transition-colors px-3"
                onClick={() => setDeleteDialog({ isOpen: true, client, isLoading: false })}
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, client: null, isLoading: false })}
        onConfirm={handleDelete}
        title="Excluir Cliente"
        itemName={deleteDialog.client?.name || ''}
        itemType="cliente"
        isLoading={deleteDialog.isLoading}
      />
    </div>
  )
}
