"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, Mail, Phone } from "lucide-react"
import Link from "next/link"
import type { Client } from "@/lib/types/database"

export function ClientList({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-600">Nenhum cliente cadastrado ainda.</p>
        <Link href="/dashboard/clients/new">
          <Button className="mt-4 bg-slate-900 hover:bg-slate-800 text-white">Criar primeiro cliente</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-200">
      {clients.map((client) => (
        <div key={client.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{client.name}</h3>
              <Badge
                variant={client.status === "active" ? "default" : "secondary"}
                className={client.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}
              >
                {client.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-700">
                {client.client_type === "person" ? "Pessoa Física" : "Pessoa Jurídica"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              {client.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {client.email}
                </span>
              )}
              {client.phone && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {client.phone}
                  </span>
                </>
              )}
              {client.cpf_cnpj && (
                <>
                  <span>•</span>
                  <span>{client.cpf_cnpj}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/clients/${client.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/dashboard/clients/${client.id}/edit`}>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
