"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit } from "lucide-react"
import Link from "next/link"
import type { Deadline } from "@/lib/types/database"
import { DeleteDeadlineButton } from "./delete-deadline-button"

type DeadlineWithProcess = Deadline & {
  processes?: {
    id: string
    title: string
    process_number: string
  } | null
}

export function DeadlineList({ deadlines }: { deadlines: DeadlineWithProcess[] }) {
  if (deadlines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-600">Nenhum prazo cadastrado ainda.</p>
        <Link href="/dashboard/deadlines/new">
          <Button className="mt-4 bg-slate-900 hover:bg-slate-800 text-white">Criar primeiro prazo</Button>
        </Link>
      </div>
    )
  }

  const getStatusBadge = (status: string, deadlineDate: string) => {
    const now = new Date()
    const deadline = new Date(deadlineDate)
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (status === "completed") {
      return <Badge className="bg-green-100 text-green-700">Concluído</Badge>
    }
    if (status === "overdue" || daysUntil < 0) {
      return <Badge className="bg-red-100 text-red-700">Atrasado</Badge>
    }
    if (daysUntil === 0) {
      return <Badge className="bg-orange-100 text-orange-700">Hoje</Badge>
    }
    if (daysUntil <= 3) {
      return <Badge className="bg-yellow-100 text-yellow-700">Urgente</Badge>
    }
    return <Badge className="bg-blue-100 text-blue-700">Pendente</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorities: Record<string, string> = {
      urgent: "bg-red-100 text-red-700",
      high: "bg-orange-100 text-orange-700",
      medium: "bg-blue-100 text-blue-700",
      low: "bg-slate-100 text-slate-700",
    }
    const labels: Record<string, string> = {
      urgent: "Urgente",
      high: "Alta",
      medium: "Média",
      low: "Baixa",
    }
    return (
      <Badge variant="outline" className={priorities[priority]}>
        {labels[priority]}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
  }

  const getDaysUntil = (deadlineDate: string) => {
    const now = new Date()
    const deadline = new Date(deadlineDate)
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) return `${Math.abs(daysUntil)} dias atrás`
    if (daysUntil === 0) return "Hoje"
    if (daysUntil === 1) return "Amanhã"
    return `em ${daysUntil} dias`
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-slate-900">Todos os Prazos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-slate-200">
          {deadlines.map((deadline) => (
            <div key={deadline.id} className="flex items-center justify-between py-4 first:pt-0">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{deadline.title}</h3>
                  {getStatusBadge(deadline.status, deadline.deadline_date)}
                  {getPriorityBadge(deadline.priority)}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="font-medium">{formatDate(deadline.deadline_date)}</span>
                  <span>•</span>
                  <span>{getDaysUntil(deadline.deadline_date)}</span>
                  {deadline.type && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{deadline.type}</span>
                    </>
                  )}
                  {deadline.processes && (
                    <>
                      <span>•</span>
                      <span>{deadline.processes.process_number}</span>
                    </>
                  )}
                </div>
                {deadline.description && <p className="text-sm text-slate-600 mt-1">{deadline.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/deadlines/${deadline.id}`}>
                  <Button variant="ghost" size="icon" title="Visualizar">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Button>
                </Link>
                <Link href={`/dashboard/deadlines/${deadline.id}/edit`}>
                  <Button variant="ghost" size="icon" title="Editar">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <DeleteDeadlineButton deadlineId={deadline.id} deadlineTitle={deadline.title} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  )
}
