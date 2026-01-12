import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, Calendar, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { DeleteDeadlineButton } from "@/components/deadlines/delete-deadline-button"

export default async function DeadlineViewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: deadline } = await supabase
    .from("deadlines")
    .select(
      `
      *,
      processes (
        id,
        title,
        process_number
      )
    `,
    )
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .single()

  if (!deadline) {
    return <div>Prazo não encontrado</div>
  }

  const deadlineDate = new Date(deadline.deadline_date)
  const now = new Date()
  const isOverdue = deadlineDate < now && deadline.status === "pending"
  const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/deadlines">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Detalhes do Prazo</h1>
            <p className="text-slate-600 mt-1">Visualize as informações do prazo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/deadlines/${deadline.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <DeleteDeadlineButton deadlineId={deadline.id} deadlineTitle={deadline.title} />
        </div>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-900">{deadline.title}</CardTitle>
              {deadline.processes && (
                <p className="text-sm text-slate-600 mt-2">
                  Processo: {deadline.processes.title} - {deadline.processes.process_number}
                </p>
              )}
            </div>
            <Badge
              variant={
                deadline.status === "completed"
                  ? "default"
                  : isOverdue
                    ? "destructive"
                    : deadline.priority === "urgent"
                      ? "destructive"
                      : "outline"
              }
            >
              {deadline.status === "completed" ? "Concluído" : isOverdue ? "Vencido" : "Pendente"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Data do Prazo */}
          <div className={`p-4 rounded-lg border ${isOverdue ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className={`h-5 w-5 ${isOverdue ? "text-red-600" : "text-blue-600"}`} />
              <p className="font-semibold text-slate-900">Data do Prazo</p>
            </div>
            <p className={`text-2xl font-bold ${isOverdue ? "text-red-600" : "text-blue-600"}`}>
              {deadlineDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                weekday: "long",
              })}
            </p>
            {deadline.status === "pending" && (
              <p className={`text-sm mt-2 ${isOverdue ? "text-red-700" : "text-blue-700"}`}>
                {isOverdue ? `Vencido há ${Math.abs(daysUntil)} dia(s)` : `Faltam ${daysUntil} dia(s)`}
              </p>
            )}
          </div>

          {/* Descrição */}
          {deadline.description && (
            <div>
              <p className="font-semibold text-slate-900 mb-2">Descrição</p>
              <p className="text-slate-700 whitespace-pre-wrap">{deadline.description}</p>
            </div>
          )}

          {/* Tipo */}
          {deadline.type && (
            <div>
              <p className="font-semibold text-slate-900 mb-2">Tipo de Prazo</p>
              <Badge variant="outline">{deadline.type}</Badge>
            </div>
          )}

          {/* Prioridade */}
          <div>
            <p className="font-semibold text-slate-900 mb-2">Prioridade</p>
            <Badge
              variant="outline"
              className={
                deadline.priority === "urgent"
                  ? "border-red-200 text-red-700"
                  : deadline.priority === "high"
                    ? "border-orange-200 text-orange-700"
                    : "border-slate-200 text-slate-700"
              }
            >
              {deadline.priority === "urgent"
                ? "Urgente"
                : deadline.priority === "high"
                  ? "Alta"
                  : deadline.priority === "medium"
                    ? "Média"
                    : "Baixa"}
            </Badge>
          </div>

          {/* Lembrete */}
          {deadline.reminder_date && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-amber-600" />
                <p className="font-semibold text-slate-900">Lembrete</p>
              </div>
              <p className="text-amber-700">
                {new Date(deadline.reminder_date).toLocaleString("pt-BR")}
              </p>
            </div>
          )}

          {/* Criado em */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Criado em {new Date(deadline.created_at).toLocaleDateString("pt-BR")} às{" "}
              {new Date(deadline.created_at).toLocaleTimeString("pt-BR")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}







