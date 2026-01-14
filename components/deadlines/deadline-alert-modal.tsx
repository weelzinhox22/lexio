'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export type ModalDeadline = {
  id: string
  title: string
  deadline_date: string
  days_remaining: number
  acknowledged_at: string | null
}

async function acknowledge(deadlineId: string) {
  await fetch(`/api/deadlines/${deadlineId}/ack`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  })
}

export function DeadlineAlertModal({ deadlines }: { deadlines: ModalDeadline[] }) {
  const [open, setOpen] = useState(false)
  const [ackLoading, setAckLoading] = useState<string | null>(null)

  const shouldOpen = useMemo(() => {
    // Open only if there is due-today or overdue AND not acknowledged.
    return (deadlines || []).some((d) => (d.days_remaining <= 0) && !d.acknowledged_at)
  }, [deadlines])

  useEffect(() => {
    if (shouldOpen) setOpen(true)
  }, [shouldOpen])

  if (!deadlines || deadlines.length === 0) return null

  const criticalDeadlines = deadlines
    .filter((d) => d.days_remaining <= 0 && !d.acknowledged_at)
    .sort((a, b) => a.days_remaining - b.days_remaining)
    .slice(0, 8)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="rounded-t-lg bg-gradient-to-r from-red-500 to-red-600 -m-6 mb-0 p-6 text-white">
          <AlertDialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <div className="rounded-full bg-white/20 p-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            Prazos Críticos
          </AlertDialogTitle>
          <AlertDialogDescription className="text-red-100 mt-2">
            Você tem {criticalDeadlines.length} prazo{criticalDeadlines.length > 1 ? 's' : ''} vencendo hoje ou já vencido{criticalDeadlines.length > 1 ? 's' : ''}. Verifique os autos do processo imediatamente.
          </AlertDialogDescription>
        </div>

        <div className="mt-6 space-y-3">
          {criticalDeadlines.map((d) => {
            const isOverdue = d.days_remaining < 0
            const isToday = d.days_remaining === 0
            return (
              <div
                key={d.id}
                className={`rounded-xl border-2 p-4 transition-all ${
                  isOverdue
                    ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100'
                    : 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-base mb-1">{d.title}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      {isOverdue && (
                        <Badge className="bg-red-600 text-white font-semibold px-2.5 py-0.5">
                          ⏰ Vencido
                        </Badge>
                      )}
                      {isToday && (
                        <Badge className="bg-orange-600 text-white font-semibold px-2.5 py-0.5">
                          🚨 Vence hoje
                        </Badge>
                      )}
                      <span className="text-sm text-slate-600">
                        {new Date(d.deadline_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={isOverdue ? 'destructive' : 'default'}
                    size="sm"
                    disabled={Boolean(d.acknowledged_at) || ackLoading === d.id}
                    onClick={async () => {
                      try {
                        setAckLoading(d.id)
                        await acknowledge(d.id)
                      } finally {
                        setAckLoading(null)
                        if (criticalDeadlines.length === 1) {
                          setOpen(false)
                        }
                      }
                    }}
                    className="shrink-0"
                  >
                    {d.acknowledged_at ? (
                      '✓ Confirmado'
                    ) : ackLoading === d.id ? (
                      'Confirmando…'
                    ) : (
                      'Confirmar ciência'
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-900">
            <strong>⚠️ Importante:</strong> Este alerta é auxiliar e não substitui a conferência nos autos do processo. Sempre confira o teor da publicação/andamento.
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <AlertDialogCancel className="border-slate-300">Fechar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => setOpen(false)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Entendi
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}


