"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

type Process = {
  id: string
  title: string
  process_number: string
}

type Deadline = {
  id: string
  title: string
  description: string | null
  deadline_date: string
  reminder_date: string | null
  priority: string
  type: string | null
  status: string
  process_id: string | null
}

export function DeadlineEditForm({
  deadline,
  processes,
  userId,
}: {
  deadline: Deadline
  processes: Process[]
  userId: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("deadlines")
        .update({
          process_id: formData.get("process_id") ? (formData.get("process_id") as string) : null,
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          deadline_date: formData.get("deadline_date") as string,
          reminder_date: formData.get("reminder_date") as string,
          priority: formData.get("priority") as string,
          type: formData.get("type") as string,
          status: formData.get("status") as string,
        })
        .eq("id", deadline.id)
        .eq("user_id", userId)

      if (error) throw error

      router.push(`/dashboard/deadlines/${deadline.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar prazo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="process_id">Processo (Opcional)</Label>
          <Select name="process_id" defaultValue={deadline.process_id || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um processo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {processes.map((process) => (
                <SelectItem key={process.id} value={process.id}>
                  {process.title} - {process.process_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Prazo</Label>
          <Input
            id="type"
            name="type"
            placeholder="Ex: Contestação, Apelação..."
            defaultValue={deadline.type || ""}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Título do Prazo *</Label>
          <Input
            id="title"
            name="title"
            placeholder="Ex: Protocolar Contestação"
            defaultValue={deadline.title}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Detalhes sobre o prazo..."
            rows={4}
            defaultValue={deadline.description || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline_date">Data do Prazo *</Label>
          <Input
            id="deadline_date"
            name="deadline_date"
            type="datetime-local"
            defaultValue={deadline.deadline_date.slice(0, 16)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder_date">Lembrete</Label>
          <Input
            id="reminder_date"
            name="reminder_date"
            type="datetime-local"
            defaultValue={deadline.reminder_date?.slice(0, 16) || ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select name="priority" defaultValue={deadline.priority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={deadline.status}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800">
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/deadlines/${deadline.id}`)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

