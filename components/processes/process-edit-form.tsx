'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MaskedInput } from '@/components/ui/masked-input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { unformat, formatProcessNumber } from '@/lib/utils/masks'
import type { Process } from '@/lib/types/database'
import { Percent, DollarSign, Scale } from 'lucide-react'

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
  const [valorCausa, setValorCausa] = useState((process as any).valor_causa || 0)
  const [percentualHonorario, setPercentualHonorario] = useState((process as any).percentual_honorario || 0)
  const [currency, setCurrency] = useState('BRL')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const polo = formData.get('polo') as string
      const statusGanho = formData.get('status_ganho') as string

      const updateData: any = {
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
        polo: polo || (process as any).polo || 'ativo',
        status_ganho: statusGanho || (process as any).status_ganho || 'em_andamento',
      }

      // Adicionar valor da causa se informado
      if (valorCausa > 0) {
        updateData.valor_causa = valorCausa
      } else {
        updateData.valor_causa = null
      }

      // Adicionar percentual de honorário se informado
      if (percentualHonorario > 0) {
        updateData.percentual_honorario = percentualHonorario
      } else {
        updateData.percentual_honorario = null
      }

      // Calcular honorário se causa ganha e ambos valores existirem
      if (statusGanho === 'ganho' && valorCausa > 0 && percentualHonorario > 0) {
        updateData.honorario_calculado = valorCausa * (percentualHonorario / 100)
      } else {
        updateData.honorario_calculado = null
      }

      const { error } = await supabase
        .from('processes')
        .update(updateData)
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
          <Label htmlFor="polo" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Polo *
          </Label>
          <Select name="polo" defaultValue={(process as any).polo || 'ativo'} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="passivo">Passivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status_ganho">Status da Causa</Label>
          <Select name="status_ganho" defaultValue={(process as any).status_ganho || 'em_andamento'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="ganho">Ganho</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="valor_causa" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Valor da Causa (opcional)
          </Label>
          <CurrencyInput
            id="valor_causa"
            value={valorCausa}
            onChange={setValorCausa}
            currency={currency}
            onCurrencyChange={setCurrency}
          />
          <p className="text-xs text-slate-500">Valor total da causa judicial</p>
        </div>

        {valorCausa > 0 && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="percentual_honorario" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Percentual de Honorário (opcional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="percentual_honorario"
                name="percentual_honorario"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={percentualHonorario || ''}
                onChange={(e) => setPercentualHonorario(parseFloat(e.target.value) || 0)}
                placeholder="20.00"
                className="flex-1"
              />
              <span className="text-slate-600 font-medium">%</span>
            </div>
            <p className="text-xs text-slate-500">
              Percentual sobre o valor da causa quando ganha
            </p>
            {percentualHonorario > 0 && valorCausa > 0 && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-semibold">
                  💰 Honorário calculado: {currency === 'BRL' ? 'R$' : currency}{' '}
                  {(valorCausa * (percentualHonorario / 100)).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {statusGanho === 'ganho'
                    ? '✅ Causa ganha - honorário será calculado automaticamente'
                    : '⚠️ Calcule apenas se a causa for ganha (mude o status para "Ganho")'}
                </p>
              </div>
            )}
          </div>
        )}
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

