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
import { unformat, formatCPFCNPJ, formatPhone } from '@/lib/utils/masks'
import type { Client } from '@/lib/types/database'

export function ClientEditForm({ client, userId }: { client: Client; userId: string }) {
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
        .from('clients')
        .update({
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          phone: unformat(formData.get('phone') as string),
          cpf_cnpj: unformat(formData.get('cpf_cnpj') as string),
          client_type: formData.get('client_type') as string,
          status: formData.get('status') as string,
          notes: formData.get('notes') as string,
        })
        .eq('id', client.id)
        .eq('user_id', userId)

      if (error) throw error

      router.push(`/dashboard/clients/${client.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cliente')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nome Completo / Razão Social *</Label>
          <Input id="name" name="name" defaultValue={client.name} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_type">Tipo de Cliente *</Label>
          <Select name="client_type" defaultValue={client.client_type || 'person'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="person">Pessoa Física</SelectItem>
              <SelectItem value="company">Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf_cnpj">CPF / CNPJ</Label>
          <MaskedInput
            id="cpf_cnpj"
            name="cpf_cnpj"
            mask="cpf-cnpj"
            defaultValue={client.cpf_cnpj ? formatCPFCNPJ(client.cpf_cnpj) : ''}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={client.email || ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <MaskedInput
            id="phone"
            name="phone"
            mask="phone"
            defaultValue={client.phone ? formatPhone(client.phone) : ''}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={client.status || 'active'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" name="notes" defaultValue={client.notes || ''} rows={4} />
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

