'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogTitle>⚠️ Prazos críticos</AlertDialogTitle>
        <AlertDialogDescription>
          Alerta auxiliar — confira o prazo no teor da publicação/andamento. Não substitui conferência profissional.
        </AlertDialogDescription>

        <div className="mt-3 space-y-2">
          {deadlines
            .slice()
            .sort((a, b) => a.days_remaining - b.days_remaining)
            .slice(0, 8)
            .map((d) => (
              <div key={d.id} className="rounded border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{d.title}</div>
                  <div className="flex items-center gap-2">
                    {d.days_remaining < 0 && <Badge variant="destructive">Vencido</Badge>}
                    {d.days_remaining === 0 && <Badge variant="destructive">Vence hoje</Badge>}
                    {d.days_remaining === 1 && <Badge className="bg-yellow-100 text-yellow-800">Amanhã</Badge>}
                    {d.acknowledged_at && <Badge variant="secondary">Ciência</Badge>}
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Data: {new Date(d.deadline_date).toLocaleString('pt-BR')}
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    disabled={Boolean(d.acknowledged_at) || ackLoading === d.id}
                    onClick={async () => {
                      try {
                        setAckLoading(d.id)
                        await acknowledge(d.id)
                      } finally {
                        setAckLoading(null)
                        setOpen(false)
                      }
                    }}
                  >
                    {d.acknowledged_at ? 'Ciência confirmada' : ackLoading === d.id ? 'Confirmando…' : 'Confirmar ciência'}
                  </Button>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <AlertDialogCancel>Fechar</AlertDialogCancel>
          <AlertDialogAction onClick={() => setOpen(false)}>Ok</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}


