"use client"

import type React from "react"

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

export function DeadlineForm({ processes, userId }: { processes: Process[]; userId: string }) {
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
      const { error } = await supabase.from("deadlines").insert({
        user_id: userId,
        process_id: formData.get("process_id") ? (formData.get("process_id") as string) : null,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        deadline_date: formData.get("deadline_date") as string,
        reminder_date: formData.get("reminder_date") as string,
        priority: formData.get("priority") as string,
        type: formData.get("type") as string,
        status: "pending",
      })

      if (error) throw error

      router.push("/dashboard/deadlines")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar prazo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Título do Prazo *</Label>
          <Input id="title" name="title" placeholder="Ex: Protocolar Contestação" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline_date">Data do Prazo *</Label>
          <Input id="deadline_date" name="deadline_date" type="datetime-local" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder_date">Lembrete</Label>
          <Input id="reminder_date" name="reminder_date" type="datetime-local" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select name="priority" defaultValue="medium">
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
          <Label htmlFor="type">Tipo</Label>
          <Select name="type">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="peticao">Petição</SelectItem>
              <SelectItem value="audiencia">Audiência</SelectItem>
              <SelectItem value="recurso">Recurso</SelectItem>
              <SelectItem value="manifestacao">Manifestação</SelectItem>
              <SelectItem value="juntada">Juntada de Documentos</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="process_id">Processo (opcional)</Label>
          <Select name="process_id">
            <SelectTrigger>
              <SelectValue placeholder="Vincular a processo" />
            </SelectTrigger>
            <SelectContent>
              {processes.map((process) => (
                <SelectItem key={process.id} value={process.id}>
                  {process.title} - {process.process_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" name="description" placeholder="Detalhes sobre o prazo..." rows={4} />
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white">
          {isLoading ? "Criando..." : "Criar Prazo"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
