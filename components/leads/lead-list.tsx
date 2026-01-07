"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, Mail, Phone, UserCheck } from "lucide-react"
import Link from "next/link"
import type { Lead } from "@/lib/types/database"

export function LeadList({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-600">Nenhum lead cadastrado ainda.</p>
        <Link href="/dashboard/leads/new">
          <Button className="mt-4 bg-slate-900 hover:bg-slate-800 text-white">Criar primeiro lead</Button>
        </Link>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: "Novo", class: "bg-blue-100 text-blue-700" },
      contacted: { label: "Contatado", class: "bg-purple-100 text-purple-700" },
      qualified: { label: "Qualificado", class: "bg-indigo-100 text-indigo-700" },
      converted: { label: "Convertido", class: "bg-green-100 text-green-700" },
      lost: { label: "Perdido", class: "bg-red-100 text-red-700" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new
    return <Badge className={config.class}>{config.label}</Badge>
  }

  return (
    <div className="divide-y divide-slate-200">
      {leads.map((lead) => (
        <div key={lead.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{lead.name}</h3>
              {getStatusBadge(lead.status)}
              {lead.score > 0 && (
                <Badge variant="outline" className="border-amber-200 text-amber-700">
                  Score: {lead.score}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              {lead.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {lead.email}
                </span>
              )}
              {lead.phone && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </span>
                </>
              )}
              {lead.source && (
                <>
                  <span>•</span>
                  <span>Origem: {lead.source}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lead.status === "qualified" && (
              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                <UserCheck className="h-4 w-4" />
              </Button>
            )}
            <Link href={`/dashboard/leads/${lead.id}`}>
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/dashboard/leads/${lead.id}/edit`}>
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
