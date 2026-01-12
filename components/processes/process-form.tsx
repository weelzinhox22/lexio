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

type Client = {
  id: string
  name: string
}

export function ProcessForm({ clients, userId }: { clients: Client[]; userId: string }) {
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
      const { error } = await supabase.from("processes").insert({
        user_id: userId,
        client_id: formData.get("client_id") as string,
        process_number: formData.get("process_number") as string,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        court: formData.get("court") as string,
        vara: formData.get("vara") as string,
        process_type: formData.get("process_type") as string,
        matter: formData.get("matter") as string,
        priority: formData.get("priority") as string,
        status: "active",
      })

      if (error) throw error

      router.push("/dashboard/processes")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar processo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente *</Label>
          <Select name="client_id" required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="process_number">Número do Processo *</Label>
          <Input id="process_number" name="process_number" placeholder="0000000-00.0000.0.00.0000" required />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Título *</Label>
          <Input id="title" name="title" placeholder="Ex: Ação de Indenização" required />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" name="description" placeholder="Descreva o processo..." rows={4} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="process_type">Tipo de Processo</Label>
          <Select name="process_type">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="civel">Cível</SelectItem>
              <SelectItem value="trabalhista">Trabalhista</SelectItem>
              <SelectItem value="criminal">Criminal</SelectItem>
              <SelectItem value="tributario">Tributário</SelectItem>
              <SelectItem value="familia">Família</SelectItem>
              <SelectItem value="empresarial">Empresarial</SelectItem>
            </SelectContent>
          </Select>
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
          <Label htmlFor="court">Tribunal/Fórum</Label>
          <Input id="court" name="court" placeholder="Ex: Tribunal de Justiça de SP" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vara">Vara</Label>
          <Input id="vara" name="vara" placeholder="Ex: 1ª Vara Cível" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="matter">Matéria/Assunto</Label>
          <Input id="matter" name="matter" placeholder="Ex: Responsabilidade Civil" />
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white">
          {isLoading ? "Criando..." : "Criar Processo"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
