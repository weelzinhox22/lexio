'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/lib/types/database'

export function LeadEditForm({ lead, userId }: { lead: Lead; userId: string }) {
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
        .from('leads')
        .update({
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          source: formData.get('source') as string,
          status: formData.get('status') as string,
          interest: formData.get('interest') as string,
          notes: formData.get('notes') as string,
          score: Number.parseInt(formData.get('score') as string) || 0,
        })
        .eq('id', lead.id)
        .eq('user_id', userId)

      if (error) throw error

      router.push(`/dashboard/leads/${lead.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar lead')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input id="name" name="name" defaultValue={lead.name} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={lead.email || ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={lead.phone || ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Origem</Label>
          <Select name="source" defaultValue={lead.source || ''}>
            <SelectTrigger>
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
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={lead.status || 'new'}>
            <SelectTrigger>
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
          <Label htmlFor="score">Score (0-100)</Label>
          <Input
            id="score"
            name="score"
            type="number"
            min="0"
            max="100"
            defaultValue={lead.score || 0}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="interest">Interesse</Label>
          <Input id="interest" name="interest" defaultValue={lead.interest || ''} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" name="notes" defaultValue={lead.notes || ''} rows={4} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white">
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}











