'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MaskedInput } from '@/components/ui/masked-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { unformat, formatProcessNumber } from '@/lib/utils/masks'
import type { Process } from '@/lib/types/database'

type Client = {
  id: string
  name: string
}

export function ProcessEditForm({
  process,
  clients,
  userId,
}: {
  process: Process
  clients: Client[]
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
        .from('processes')
        .update({
          client_id: formData.get('client_id') as string,
          process_number: unformat(formData.get('process_number') as string),
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          court: formData.get('court') as string,
          vara: formData.get('vara') as string,
          process_type: formData.get('process_type') as string,
          matter: formData.get('matter') as string,
          priority: formData.get('priority') as string,
          status: formData.get('status') as string,
        })
        .eq('id', process.id)
        .eq('user_id', userId)

      if (error) throw error

      router.push(`/dashboard/processes/${process.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar processo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente *</Label>
          <Select name="client_id" required defaultValue={process.client_id}>
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
          <MaskedInput
            id="process_number"
            name="process_number"
            mask="process"
            defaultValue={formatProcessNumber(process.process_number)}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Título *</Label>
          <Input id="title" name="title" defaultValue={process.title} required />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={process.description || ''}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="process_type">Tipo de Processo</Label>
          <Select name="process_type" defaultValue={process.process_type || ''}>
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
          <Select name="priority" defaultValue={process.priority || 'medium'}>
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
          <Select name="status" defaultValue={process.status || 'active'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
              <SelectItem value="won">Ganho</SelectItem>
              <SelectItem value="lost">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="court">Tribunal/Fórum</Label>
          <Input id="court" name="court" defaultValue={process.court || ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vara">Vara</Label>
          <Input id="vara" name="vara" defaultValue={process.vara || ''} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="matter">Matéria/Assunto</Label>
          <Input id="matter" name="matter" defaultValue={process.matter || ''} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
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

