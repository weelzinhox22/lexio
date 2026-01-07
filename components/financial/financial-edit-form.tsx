'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { FinancialTransaction } from '@/lib/types/database'

type Client = {
  id: string
  name: string
}

type Process = {
  id: string
  title: string
  process_number: string
}

export function FinancialEditForm({
  transaction,
  clients,
  processes,
  userId,
}: {
  transaction: FinancialTransaction
  clients: Client[]
  processes: Process[]
  userId: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState<number>(Number(transaction.amount) || 0)
  const [currency, setCurrency] = useState<string>((transaction as any).currency || 'BRL')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('financial_transactions')
        .update({
          client_id: formData.get('client_id') ? (formData.get('client_id') as string) : null,
          process_id: formData.get('process_id') ? (formData.get('process_id') as string) : null,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          amount: amount,
          currency: currency,
          type: formData.get('type') as string,
          category: formData.get('category') as string,
          status: formData.get('status') as string,
          due_date: formData.get('due_date') as string,
          payment_method: formData.get('payment_method') as string,
        })
        .eq('id', transaction.id)
        .eq('user_id', userId)

      if (error) throw error

      router.push('/dashboard/financial')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar transação')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Título *</Label>
          <Input id="title" name="title" defaultValue={transaction.title} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Select name="type" defaultValue={transaction.type} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor *</Label>
          <CurrencyInput
            id="amount"
            value={amount}
            onChange={setAmount}
            currency={currency}
            onCurrencyChange={setCurrency}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select name="category" defaultValue={transaction.category || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="honorarios">Honorários</SelectItem>
              <SelectItem value="custas">Custas Processuais</SelectItem>
              <SelectItem value="despesas">Despesas Operacionais</SelectItem>
              <SelectItem value="impostos">Impostos</SelectItem>
              <SelectItem value="salarios">Salários</SelectItem>
              <SelectItem value="aluguel">Aluguel</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select name="status" defaultValue={transaction.status || 'pending'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="overdue">Atrasado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Data de Vencimento</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={transaction.due_date ? new Date(transaction.due_date).toISOString().split('T')[0] : ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_method">Método de Pagamento</Label>
          <Select name="payment_method" defaultValue={transaction.payment_method || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="transferencia">Transferência</SelectItem>
              <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
              <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
              <SelectItem value="boleto">Boleto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente (opcional)</Label>
          <Select name="client_id" defaultValue={transaction.client_id || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
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
          <Label htmlFor="process_id">Processo (opcional)</Label>
          <Select name="process_id" defaultValue={transaction.process_id || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o processo" />
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={transaction.description || ''}
            rows={4}
          />
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

