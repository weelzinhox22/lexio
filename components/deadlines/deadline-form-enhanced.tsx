'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { LEGAL_DEADLINES } from '@/lib/data/legal-deadlines'
import { Calendar, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Process = {
  id: string
  title: string
  process_number: string
}

export function DeadlineFormEnhanced({ processes, userId }: { processes: Process[]; userId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDeadlineType, setSelectedDeadlineType] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [calculatedDate, setCalculatedDate] = useState<Date | null>(null)
  const [useManualDate, setUseManualDate] = useState(false)

  useEffect(() => {
    if (selectedDeadlineType && startDate && !useManualDate) {
      const deadline = LEGAL_DEADLINES.find(d => d.type === selectedDeadlineType)
      if (deadline) {
        const start = new Date(startDate)
        const calculated = calculateDeadline(start, deadline.days, deadline.businessDays)
        setCalculatedDate(calculated)
      }
    }
  }, [selectedDeadlineType, startDate, useManualDate])

  // Função para calcular prazo
  const calculateDeadline = (startDate: Date, days: number, businessDays: boolean): Date => {
    const result = new Date(startDate)
    
    if (!businessDays) {
      result.setDate(result.getDate() + days)
      return result
    }

    // Para dias úteis, pular fins de semana
    let addedDays = 0
    while (addedDays < days) {
      result.setDate(result.getDate() + 1)
      const dayOfWeek = result.getDay()
      
      // Pular sábado (6) e domingo (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++
      }
    }

    return result
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const deadlineDate = useManualDate 
        ? formData.get('deadline_date') as string
        : calculatedDate?.toISOString() || formData.get('deadline_date') as string

      const deadlineData = {
        user_id: userId,
        process_id: formData.get('process_id') ? (formData.get('process_id') as string) : null,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        deadline_date: deadlineDate,
        reminder_date: formData.get('reminder_date') as string,
        priority: formData.get('priority') as string,
        type: selectedDeadlineType || formData.get('type') as string,
        status: 'pending',
      }

      const { data: newDeadline, error } = await supabase
        .from('deadlines')
        .insert(deadlineData)
        .select()
        .single()

      if (error) throw error

      // Tentar sincronizar com Google Calendar (não bloqueia se falhar)
      if (newDeadline) {
        try {
          await fetch('/api/deadlines/sync-google-calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create',
              deadlineId: newDeadline.id,
              deadline: deadlineData,
            }),
          })
        } catch (syncError) {
          console.log('Não foi possível sincronizar com Google Calendar:', syncError)
          // Não lança erro, apenas registra
        }
      }

      router.push('/dashboard/deadlines')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar prazo')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedDeadline = selectedDeadlineType 
    ? LEGAL_DEADLINES.find(d => d.type === selectedDeadlineType) 
    : null

  // Agrupar prazos por categoria
  const groupedDeadlines = Array.isArray(LEGAL_DEADLINES) 
    ? LEGAL_DEADLINES.reduce((acc, deadline) => {
        if (!acc[deadline.category]) {
          acc[deadline.category] = []
        }
        acc[deadline.category].push(deadline)
        return acc
      }, {} as Record<string, Array<typeof LEGAL_DEADLINES[0]>>)
    : {}

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tipo de Prazo com Cálculo Automático */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="deadline_type">Tipo de Prazo com Cálculo Automático</Label>
          <Select value={selectedDeadlineType || ''} onValueChange={setSelectedDeadlineType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione para cálculo automático ou deixe em branco" />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              <SelectItem value="">Nenhum (Manual)</SelectItem>
              
              {Object.entries(groupedDeadlines).map(([category, deadlines]) => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 mt-2 first:mt-0">
                    {category}
                  </div>
                  {deadlines.map((deadline) => (
                    <SelectItem key={deadline.type} value={deadline.type}>
                      <div className="flex items-center justify-between w-full gap-3">
                        <span className="flex-1">{deadline.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {deadline.days} {deadline.businessDays ? 'dias úteis' : 'dias'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
          {selectedDeadline && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{selectedDeadline.description}</span>
              </p>
            </div>
          )}
        </div>

        {/* Data de Início (para cálculo) */}
        {selectedDeadlineType && (
          <div className="space-y-2">
            <Label htmlFor="start_date">Data de Início do Prazo *</Label>
            <Input 
              id="start_date" 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required 
            />
            <p className="text-xs text-slate-500">Ex: data da intimação, publicação, etc.</p>
          </div>
        )}

        {/* Data Calculada */}
        {calculatedDate && !useManualDate && (
          <div className="space-y-2">
            <Label>Data Final Calculada</Label>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-lg font-bold text-green-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {calculatedDate.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  weekday: 'long'
                })}
              </p>
              <p className="text-xs text-green-700 mt-1">
                {selectedDeadline?.businessDays ? 'Contando apenas dias úteis' : 'Contando dias corridos'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUseManualDate(true)}
              className="w-full"
            >
              Prefiro informar manualmente
            </Button>
          </div>
        )}

        {/* Data Manual */}
        {(!selectedDeadlineType || useManualDate) && (
          <div className="space-y-2">
            <Label htmlFor="deadline_date">Data do Prazo *</Label>
            <Input id="deadline_date" name="deadline_date" type="datetime-local" required />
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Título do Prazo *</Label>
          <Input 
            id="title" 
            name="title" 
            placeholder={selectedDeadline ? selectedDeadline.type : "Ex: Protocolar Contestação"} 
            defaultValue={selectedDeadline?.type}
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder_date">Lembrete</Label>
          <Input id="reminder_date" name="reminder_date" type="datetime-local" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select name="priority" defaultValue="high">
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="process_id">Processo Relacionado</Label>
          <Select name="process_id">
            <SelectTrigger>
              <SelectValue placeholder="Selecione um processo (opcional)" />
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
          <Label htmlFor="description">Observações</Label>
          <Textarea 
            id="description" 
            name="description" 
            placeholder="Informações adicionais sobre o prazo..." 
            rows={3} 
          />
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white">
          {isLoading ? 'Criando...' : 'Criar Prazo'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

