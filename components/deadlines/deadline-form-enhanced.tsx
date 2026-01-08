'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { LEGAL_DEADLINES, calculateDeadline, calculateReminderDate } from '@/lib/data/legal-deadlines'
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
  const [calculatedReminder, setCalculatedReminder] = useState<Date | null>(null)
  const [useManualDate, setUseManualDate] = useState(false)
  const [selectedDeadline, setSelectedDeadline] = useState<typeof LEGAL_DEADLINES[0] | null>(null)

  useEffect(() => {
    if (selectedDeadlineType && selectedDeadlineType !== 'manual') {
      const deadline = LEGAL_DEADLINES.find(d => d.type === selectedDeadlineType)
      setSelectedDeadline(deadline || null)
    } else {
      setSelectedDeadline(null)
    }
  }, [selectedDeadlineType])

  useEffect(() => {
    if (selectedDeadline && startDate && !useManualDate) {
      const start = new Date(startDate + 'T00:00:00')
      const calculated = calculateDeadline(start, selectedDeadline.days, selectedDeadline.businessDays)
      setCalculatedDate(calculated)
      
      // Calcular lembrete (5 dias antes por padrão, ou 1 dia se prazo for muito curto)
      const reminderDays = selectedDeadline.days <= 5 ? 1 : 5
      const reminder = calculateReminderDate(calculated, reminderDays)
      setCalculatedReminder(reminder)
    } else {
      setCalculatedDate(null)
      setCalculatedReminder(null)
    }
  }, [selectedDeadline, startDate, useManualDate])

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

      // Usar lembrete calculado se disponível, senão usar o manual
      const reminderDate = calculatedReminder && !useManualDate
        ? calculatedReminder.toISOString()
        : formData.get('reminder_date') as string || null

      const deadlineData = {
        user_id: userId,
        process_id: formData.get('process_id') ? (formData.get('process_id') as string) : null,
        title: formData.get('title') as string || (selectedDeadline ? selectedDeadline.type : 'Prazo'),
        description: formData.get('description') as string,
        deadline_date: deadlineDate,
        reminder_date: reminderDate,
        priority: formData.get('priority') as string,
        type: selectedDeadlineType && selectedDeadlineType !== 'manual' ? selectedDeadlineType : (formData.get('type') as string || null),
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
          <Label htmlFor="deadline_type" className="text-slate-700 font-medium">Tipo de Prazo *</Label>
          <Select value={selectedDeadlineType || undefined} onValueChange={(value) => setSelectedDeadlineType(value === "manual" ? null : value)}>
            <SelectTrigger className="border-slate-300 focus:border-blue-400 focus:ring-blue-200">
              <SelectValue placeholder="Selecione o tipo de prazo para cálculo automático" />
            </SelectTrigger>
            <SelectContent className="max-h-[500px]">
              <SelectItem value="manual">📝 Nenhum (Manual)</SelectItem>
              
              {Object.entries(groupedDeadlines).map(([category, deadlines]) => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 mt-2 first:mt-0 bg-slate-50">
                    {category}
                  </div>
                  {deadlines.map((deadline) => (
                    <SelectItem key={deadline.type} value={deadline.type}>
                      <div className="flex items-center justify-between w-full gap-3">
                        <span className="flex-1">{deadline.type}</span>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {deadline.days === 0 ? 'Sem prazo' : `${deadline.days} ${deadline.businessDays ? 'dias úteis' : 'dias'}`}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
          {selectedDeadline && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    {selectedDeadline.type}
                  </p>
                  <p className="text-xs text-blue-700 mb-2">
                    {selectedDeadline.description || 'Prazo processual'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-blue-600">
                    <span className="font-semibold">
                      📅 Prazo padrão: {selectedDeadline.days === 0 ? 'Sem prazo fixo' : `${selectedDeadline.days} ${selectedDeadline.businessDays ? 'dias úteis' : 'dias corridos'}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data de Início (para cálculo) */}
        {selectedDeadlineType && selectedDeadlineType !== 'manual' && (
          <div className="space-y-2">
            <Label htmlFor="start_date" className="text-slate-700 font-medium">Data de Início do Prazo *</Label>
            <Input 
              id="start_date" 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="border-slate-300 focus:border-blue-400 focus:ring-blue-200"
            />
            <p className="text-xs text-slate-500">Ex: data da intimação, publicação, sentença, etc.</p>
          </div>
        )}

        {/* Data Calculada */}
        {calculatedDate && !useManualDate && selectedDeadline && (
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Data Final Calculada Automaticamente</Label>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
              <p className="text-xl font-bold text-green-900 flex items-center gap-2 mb-2">
                <Calendar className="h-6 w-6" />
                {calculatedDate.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  weekday: 'long'
                })}
              </p>
              <div className="flex items-center gap-2 text-xs text-green-700">
                <span className="font-semibold">
                  {selectedDeadline.businessDays ? '📅 Contando apenas dias úteis' : '📅 Contando dias corridos'}
                </span>
                <span>•</span>
                <span>{selectedDeadline.days} {selectedDeadline.businessDays ? 'dias úteis' : 'dias'} após a data de início</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUseManualDate(true)}
              className="w-full border-slate-300 hover:bg-slate-50"
            >
              ✏️ Prefiro informar manualmente
            </Button>
          </div>
        )}

        {/* Data Manual */}
        {(!selectedDeadlineType || selectedDeadlineType === 'manual' || useManualDate) && (
          <div className="space-y-2">
            <Label htmlFor="deadline_date" className="text-slate-700 font-medium">Data do Prazo *</Label>
            <Input 
              id="deadline_date" 
              name="deadline_date" 
              type="datetime-local" 
              required
              className="border-slate-300 focus:border-blue-400 focus:ring-blue-200"
            />
          </div>
        )}

        {/* Lembrete Calculado */}
        {calculatedReminder && !useManualDate && selectedDeadline && (
          <div className="space-y-2 md:col-span-2">
            <Label className="text-slate-700 font-medium">Lembrete Calculado Automaticamente</Label>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
              <p className="text-base font-semibold text-amber-900 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {calculatedReminder.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  weekday: 'long'
                })} às {calculatedReminder.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                ⏰ Lembrete configurado automaticamente para {selectedDeadline.days <= 5 ? '1 dia antes' : '5 dias antes'} do prazo
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title" className="text-slate-700 font-medium">Título do Prazo *</Label>
          <Input 
            id="title" 
            name="title" 
            placeholder={selectedDeadline ? selectedDeadline.type : "Ex: Protocolar Contestação"} 
            defaultValue={selectedDeadline?.type}
            required
            className="border-slate-300 focus:border-blue-400 focus:ring-blue-200"
          />
        </div>

        {/* Lembrete Manual (só aparece se não tiver cálculo automático) */}
        {(!calculatedReminder || useManualDate) && (
          <div className="space-y-2">
            <Label htmlFor="reminder_date" className="text-slate-700 font-medium">Lembrete (Opcional)</Label>
            <Input 
              id="reminder_date" 
              name="reminder_date" 
              type="datetime-local"
              className="border-slate-300 focus:border-blue-400 focus:ring-blue-200"
            />
            <p className="text-xs text-slate-500">Configure um lembrete personalizado</p>
          </div>
        )}

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

