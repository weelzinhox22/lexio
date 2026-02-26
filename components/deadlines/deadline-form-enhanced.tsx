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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { DEADLINE_CHAINS, ChainedTask } from '@/lib/data/task-chains'

type Process = {
  id: string
  title: string
  process_number: string
}

export function DeadlineFormEnhanced({
  processes,
  userId,
  isOnboarding = false,
  prefillDate,
  prefillTime = '09:00'
}: {
  processes: Process[]
  userId: string
  isOnboarding?: boolean
  prefillDate?: string
  prefillTime?: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDeadlineType, setSelectedDeadlineType] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [calculatedDate, setCalculatedDate] = useState<Date | null>(null)
  const [calculatedReminder, setCalculatedReminder] = useState<Date | null>(null)
  const [useManualDate, setUseManualDate] = useState(false)
  const [selectedDeadline, setSelectedDeadline] = useState<typeof LEGAL_DEADLINES[0] | null>(null)

  const [chainedTasksPrompt, setChainedTasksPrompt] = useState<{
    isOpen: boolean
    originalDate: Date
    originalProcessId: string | null
    tasks: ChainedTask[]
  }>({
    isOpen: false,
    originalDate: new Date(),
    originalProcessId: null,
    tasks: []
  })
  const [selectedChainedTasks, setSelectedChainedTasks] = useState<string[]>([])
  const [isCreatingChained, setIsCreatingChained] = useState(false)

  // Pré-preencher para onboarding
  useEffect(() => {
    if (isOnboarding && prefillDate) {
      // Aguardar um pouco para garantir que o DOM está pronto
      setTimeout(() => {
        const dateTime = `${prefillDate}T${prefillTime}`
        const input = document.getElementById('deadline_date') as HTMLInputElement
        if (input) {
          // Formato datetime-local: YYYY-MM-DDTHH:mm
          input.value = dateTime
        }
        // Pré-preencher título também
        const titleInput = document.getElementById('title') as HTMLInputElement
        if (titleInput && !titleInput.value) {
          titleInput.value = 'Prazo de resposta - Processo exemplo'
        }
      }, 100)
    }
  }, [isOnboarding, prefillDate, prefillTime])

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

      // Se for onboarding, enviar e-mail de teste
      if (isOnboarding && newDeadline) {
        try {
          await fetch('/api/deadlines/send-test-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deadlineId: newDeadline.id,
            }),
          })
        } catch (emailError) {
          console.log('Não foi possível enviar e-mail de teste:', emailError)
          // Não bloqueia o fluxo
        }
      }

      // Confirmar referral se for primeiro prazo
      if (newDeadline) {
        try {
          await fetch('/api/referrals/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (referralError) {
          // Silencioso - não é crítico
          console.log('Referral confirmation:', referralError)
        }
      }

      const typeForChain = selectedDeadlineType && selectedDeadlineType !== 'manual' ? selectedDeadlineType : (formData.get('type') as string || null);
      if (newDeadline && typeForChain && DEADLINE_CHAINS[typeForChain]) {
        const chains = DEADLINE_CHAINS[typeForChain]
        if (chains && chains.length > 0) {
          setChainedTasksPrompt({
            isOpen: true,
            originalDate: new Date(deadlineDate),
            originalProcessId: deadlineData.process_id,
            tasks: chains
          })
          setSelectedChainedTasks(chains.map(c => c.type))
          setIsLoading(false)
          return
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

  const handleCreateChainedTasks = async () => {
    setIsCreatingChained(true)
    const supabase = createClient()

    try {
      const selectedTasksObj = chainedTasksPrompt.tasks.filter(t => selectedChainedTasks.includes(t.type))

      const inserts = selectedTasksObj.map(task => {
        const startDate = new Date(chainedTasksPrompt.originalDate)
        const calcDate = calculateDeadline(startDate, task.daysFromOriginal, task.businessDays)
        const reminderDays = task.daysFromOriginal <= 5 ? 1 : 5
        const calcReminder = calculateReminderDate(calcDate, reminderDays)

        return {
          user_id: userId,
          process_id: chainedTasksPrompt.originalProcessId,
          title: task.title,
          description: task.description || '',
          deadline_date: calcDate.toISOString(),
          reminder_date: calcReminder.toISOString(),
          priority: 'medium',
          type: task.type,
          status: 'pending'
        }
      })

      if (inserts.length > 0) {
        const { error } = await supabase.from('deadlines').insert(inserts)
        if (error) throw error
      }

      setChainedTasksPrompt(prev => ({ ...prev, isOpen: false }))
      router.push('/dashboard/deadlines')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('Erro ao criar tarefas em cadeia')
    } finally {
      setIsCreatingChained(false)
    }
  }

  const handleSkipChainedTasks = () => {
    setChainedTasksPrompt(prev => ({ ...prev, isOpen: false }))
    router.push('/dashboard/deadlines')
    router.refresh()
  }

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
    <>
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
                defaultValue={isOnboarding && prefillDate ? `${prefillDate}T${prefillTime}` : undefined}
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
              placeholder={selectedDeadline ? selectedDeadline.type : "Ex: Audiência – 15/01 – lembrar 1 dia antes"}
              defaultValue={isOnboarding ? 'Prazo de resposta - Processo exemplo' : selectedDeadline?.type}
              required
              className="border-slate-300 focus:border-blue-400 focus:ring-blue-200"
            />
            <p className="text-xs text-slate-500">
              Exemplos: "Audiência – 15/01", "Prazo processual – vence amanhã", "Contestação – 20/01"
            </p>
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

      <Dialog open={chainedTasksPrompt.isOpen} onOpenChange={(open) => {
        if (!open && !isCreatingChained) handleSkipChainedTasks()
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sugestão de Próximos Passos</DialogTitle>
            <DialogDescription>
              Com base no prazo que você acabou de criar, sugerimos as seguintes tarefas em cadeia. Desmarque as que não desejar criar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {chainedTasksPrompt.tasks.map(task => (
              <div key={task.type} className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <Checkbox
                  id={`task-${task.type}`}
                  checked={selectedChainedTasks.includes(task.type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedChainedTasks(prev => [...prev, task.type])
                    } else {
                      setSelectedChainedTasks(prev => prev.filter(t => t !== task.type))
                    }
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor={`task-${task.type}`} className="text-sm font-medium leading-none cursor-pointer">
                    {task.title}
                  </label>
                  <p className="text-sm text-slate-500">
                    {task.description}
                  </p>
                  <p className="text-xs font-semibold text-blue-600 mt-1">
                    Prazo provável: {calculateDeadline(chainedTasksPrompt.originalDate, task.daysFromOriginal, task.businessDays).toLocaleDateString('pt-BR')} ({task.daysFromOriginal} dias {task.businessDays ? 'úteis' : 'corridos'})
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={handleSkipChainedTasks} disabled={isCreatingChained}>
              Pular
            </Button>
            <Button type="button" onClick={handleCreateChainedTasks} disabled={isCreatingChained || selectedChainedTasks.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isCreatingChained ? 'Criando...' : `Criar ${selectedChainedTasks.length} Tarefa(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

