'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/lib/types/database'

type Client = {
  id: string
  name: string
}

type Process = {
  id: string
  title: string
  process_number: string
}

export function DocumentEditForm({
  document,
  clients,
  processes,
  userId,
}: {
  document: Document
  clients: Client[]
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
      const clientId = formData.get('client_id') as string
      const processId = formData.get('process_id') as string

      const { error } = await supabase
        .from('documents')
        .update({
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          category: formData.get('category') as string,
          client_id: clientId || null,
          process_id: processId || null,
        })
        .eq('id', document.id)
        .eq('user_id', userId)

      if (error) throw error

      router.push(`/dashboard/documents/${document.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar documento')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Título *</Label>
          <Input id="title" name="title" defaultValue={document.title} required />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={document.description || ''}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select name="category" defaultValue={document.category || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contrato">Contrato</SelectItem>
              <SelectItem value="peticao">Petição</SelectItem>
              <SelectItem value="certidao">Certidão</SelectItem>
              <SelectItem value="procuracao">Procuração</SelectItem>
              <SelectItem value="sentenca">Sentença</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente</Label>
          <Select name="client_id" defaultValue={document.client_id || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Nenhum cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum cliente</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="process_id">Processo</Label>
          <Select name="process_id" defaultValue={document.process_id || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Nenhum processo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum processo</SelectItem>
              {processes.map((process) => (
                <SelectItem key={process.id} value={process.id}>
                  {process.title} - {process.process_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

