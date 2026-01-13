"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, AlertTriangle, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { Deadline } from "@/lib/types/database"
import { DeleteDeadlineButton } from "./delete-deadline-button"
import { ConfirmAwarenessButton } from "./confirm-awareness-button"
import { useState } from "react"

type DeadlineWithProcess = Deadline & {
  processes?: {
    id: string
    title: string
    process_number: string
  } | null
}

type DeadlineState = 'vencido' | 'critico' | 'proximo' | 'ok'

function getDeadlineState(deadline: DeadlineWithProcess, now: Date): DeadlineState {
  if (deadline.status === "completed") return 'ok'
  
  const deadlineDate = new Date(deadline.deadline_date)
  const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntil < 0 || deadline.status === "overdue") return 'vencido'
  if (daysUntil <= 3) return 'critico'
  if (daysUntil <= 7) return 'proximo'
  return 'ok'
}

function getStateConfig(state: DeadlineState) {
  switch (state) {
    case 'vencido':
      return {
        label: 'VENCIDOS',
        icon: AlertTriangle,
        badgeClass: 'bg-red-600 text-white',
        cardClass: 'border-red-300 bg-red-50/50',
        titleClass: 'text-red-700',
        description: 'Prazos que já venceram. Ação imediata necessária.'
      }
    case 'critico':
      return {
        label: 'CRÍTICOS',
        icon: AlertTriangle,
        badgeClass: 'bg-orange-600 text-white',
        cardClass: 'border-orange-300 bg-orange-50/50',
        titleClass: 'text-orange-700',
        description: 'Prazos que vencem em 1-3 dias. Ação necessária em breve.'
      }
    case 'proximo':
      return {
        label: 'PRÓXIMOS',
        icon: Clock,
        badgeClass: 'bg-yellow-600 text-white',
        cardClass: 'border-yellow-300 bg-yellow-50/50',
        titleClass: 'text-yellow-700',
        description: 'Prazos que vencem em 4-7 dias. Atenção: prazo se aproxima.'
      }
    case 'ok':
      return {
        label: 'OK',
        icon: CheckCircle2,
        badgeClass: 'bg-green-600 text-white',
        cardClass: 'border-green-300 bg-green-50/50',
        titleClass: 'text-green-700',
        description: 'Prazos com mais de 7 dias. Nenhuma ação urgente.'
      }
  }
}

function formatDaysUntil(deadlineDate: string): string {
  const now = new Date()
  const deadline = new Date(deadlineDate)
  const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntil < 0) return `Vencido há ${Math.abs(daysUntil)} ${Math.abs(daysUntil) === 1 ? 'dia' : 'dias'}`
  if (daysUntil === 0) return 'Vence hoje'
  if (daysUntil === 1) return 'Vence amanhã'
  return `Vence em ${daysUntil} dias`
}

export function DeadlineHub({ deadlines }: { deadlines: DeadlineWithProcess[] }) {
  const [showOk, setShowOk] = useState(false)
  const now = new Date()
  
  // Agrupar prazos por estado
  const grouped = deadlines.reduce((acc, deadline) => {
    const state = getDeadlineState(deadline, now)
    if (!acc[state]) acc[state] = []
    acc[state].push(deadline)
    return acc
  }, {} as Record<DeadlineState, DeadlineWithProcess[]>)
  
  // Ordenar dentro de cada grupo
  Object.keys(grouped).forEach((state) => {
    grouped[state as DeadlineState].sort((a, b) => {
      const dateA = new Date(a.deadline_date).getTime()
      const dateB = new Date(b.deadline_date).getTime()
      // Vencidos: mais antigos primeiro. Outros: mais próximos primeiro
      return state === 'vencido' ? dateA - dateB : dateB - dateA
    })
  })
  
  const states: DeadlineState[] = ['vencido', 'critico', 'proximo', 'ok']
  
  if (deadlines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-600 mb-2">Nenhum prazo cadastrado ainda.</p>
        <p className="text-sm text-slate-500 mb-4">Cadastre seu primeiro prazo para começar a receber alertas automáticos.</p>
        <Link href="/dashboard/deadlines/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">Criar primeiro prazo</Button>
        </Link>
      </div>
    )
  }
  
  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900">Central de Prazos</CardTitle>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-600"></div>
              {grouped.ok?.length || 0} OK
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
              {grouped.proximo?.length || 0} Próximos
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-600"></div>
              {grouped.critico?.length || 0} Críticos
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
              {grouped.vencido?.length || 0} Vencidos
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {states.map((state) => {
          const deadlinesInState = grouped[state] || []
          if (deadlinesInState.length === 0) return null
          if (state === 'ok' && !showOk) return null
          
          const config = getStateConfig(state)
          const Icon = config.icon
          
          return (
            <div key={state} className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-lg ${config.cardClass}`}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${config.badgeClass}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${config.titleClass}`}>
                      {config.label} ({deadlinesInState.length})
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">{config.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {deadlinesInState.map((deadline) => {
                  const isVencido = state === 'vencido'
                  const isCritico = state === 'critico'
                  
                  return (
                    <div
                      key={deadline.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isVencido
                          ? 'border-red-200 bg-red-50/30'
                          : isCritico
                          ? 'border-orange-200 bg-orange-50/30'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-2">
                            <h4 className="font-semibold text-slate-900 flex-1">
                              {isVencido && '⚠️ '}
                              {isCritico && '🚨 '}
                              {deadline.title}
                            </h4>
                            <Badge className={config.badgeClass}>
                              {state === 'vencido' ? '⏰ Vencido' : 
                               state === 'critico' ? '🚨 Crítico' :
                               state === 'proximo' ? '⏰ Próximo' : '✓ OK'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <span className="font-medium">
                              {new Date(deadline.deadline_date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span>•</span>
                            <span className={isVencido ? 'text-red-600 font-semibold' : isCritico ? 'text-orange-600 font-semibold' : ''}>
                              {formatDaysUntil(deadline.deadline_date)}
                            </span>
                            {deadline.processes && (
                              <>
                                <span>•</span>
                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                                  {deadline.processes.process_number}
                                </span>
                              </>
                            )}
                            {deadline.google_calendar_event_id && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  📅 Google Calendar
                                </Badge>
                              </>
                            )}
                          </div>
                          
                          {deadline.description && (
                            <p className="text-sm text-slate-600 mt-1">{deadline.description}</p>
                          )}
                          
                          {(isVencido || isCritico) && !deadline.acknowledged_at && (
                            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                              <strong>⚠️ Importante:</strong> Este alerta é auxiliar e não substitui a conferência nos autos do processo.
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-start gap-2 shrink-0">
                          {(isVencido || isCritico) && (
                            <ConfirmAwarenessButton 
                              deadlineId={deadline.id} 
                              disabled={Boolean(deadline.acknowledged_at)} 
                            />
                          )}
                          <Link href={`/dashboard/deadlines/${deadline.id}`}>
                            <Button variant="ghost" size="icon" title="Visualizar" className="hover:bg-blue-50">
                              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Button>
                          </Link>
                          <Link href={`/dashboard/deadlines/${deadline.id}/edit`}>
                            <Button variant="ghost" size="icon" title="Editar" className="hover:bg-amber-50">
                              <Edit className="h-4 w-4 text-amber-600" />
                            </Button>
                          </Link>
                          <DeleteDeadlineButton deadlineId={deadline.id} deadlineTitle={deadline.title} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        
        {grouped.ok && grouped.ok.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setShowOk(!showOk)}
              className="w-full"
            >
              {showOk ? 'Ocultar prazos OK' : `Mostrar ${grouped.ok.length} prazo${grouped.ok.length > 1 ? 's' : ''} OK`}
            </Button>
          </div>
        )}
      </CardContent>
    </>
  )
}

