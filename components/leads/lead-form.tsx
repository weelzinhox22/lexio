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

export function LeadForm({ userId }: { userId: string }) {
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
      const { error } = await supabase.from("leads").insert({
        user_id: userId,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        source: formData.get("source") as string,
        status: formData.get("status") as string,
        interest: formData.get("interest") as string,
        notes: formData.get("notes") as string,
        score: Number.parseInt(formData.get("score") as string) || 0,
      })

      if (error) throw error

      router.push("/dashboard/leads")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar lead")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name" className="text-slate-700 font-semibold">Nome Completo *</Label>
          <Input id="name" name="name" placeholder="Ex: Maria Santos" className="rounded-full shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
          <Input id="email" name="email" type="email" placeholder="lead@email.com" className="rounded-full shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-700 font-semibold">Telefone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="(00) 00000-0000" className="rounded-full shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="source" className="text-slate-700 font-semibold">Origem</Label>
          <Select name="source">
            <SelectTrigger className="rounded-full shadow-sm border-slate-300 focus:ring-blue-200">
              <SelectValue placeholder="Como conheceu?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Indicação</SelectItem>
              <SelectItem value="social_media">Redes Sociais</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="event">Evento</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-slate-700 font-semibold">Status</Label>
          <Select name="status" defaultValue="new">
            <SelectTrigger className="rounded-full shadow-sm border-slate-300 focus:ring-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Novo</SelectItem>
              <SelectItem value="contacted">Contatado</SelectItem>
              <SelectItem value="qualified">Qualificado</SelectItem>
              <SelectItem value="converted">Convertido</SelectItem>
              <SelectItem value="lost">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="score" className="text-slate-700 font-semibold">Score (0-100)</Label>
          <Input id="score" name="score" type="number" min="0" max="100" defaultValue="0" className="rounded-full shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="interest" className="text-slate-700 font-semibold">Interesse</Label>
          <Input id="interest" name="interest" placeholder="Ex: Ação trabalhista" className="rounded-full shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes" className="text-slate-700 font-semibold">Observações</Label>
          <Textarea id="notes" name="notes" placeholder="Informações sobre o lead..." rows={4} className="rounded-2xl shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200" />
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-sm font-semibold transition-transform hover:-translate-y-0.5">
          {isLoading ? "Criando..." : "Criar Lead"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-full shadow-sm font-semibold border-slate-200 text-slate-600">
          Cancelar
        </Button>
      </div>
    </form>
  )
}
