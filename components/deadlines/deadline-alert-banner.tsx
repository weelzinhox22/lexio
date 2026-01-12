'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

export type BannerDeadline = {
  id: string
  title: string
  deadline_date: string
  days_remaining: number
  acknowledged_at: string | null
}

export function DeadlineAlertBanner({ deadlines }: { deadlines: BannerDeadline[] }) {
  const counts = useMemo(() => {
    let overdue = 0
    let today = 0
    let tomorrow = 0
    for (const d of deadlines) {
      if (d.days_remaining < 0) overdue++
      else if (d.days_remaining === 0) today++
      else if (d.days_remaining === 1) tomorrow++
    }
    return { overdue, today, tomorrow }
  }, [deadlines])

  if (!deadlines || deadlines.length === 0) return null

  const isDanger = counts.overdue > 0 || counts.today > 0
  const isWarning = !isDanger && counts.tomorrow > 0

  return (
    <div
      className={
        isDanger
          ? 'w-full border-b border-red-200 bg-red-50 px-4 py-3'
          : isWarning
            ? 'w-full border-b border-yellow-200 bg-yellow-50 px-4 py-3'
            : 'w-full border-b border-slate-200 bg-slate-50 px-4 py-3'
      }
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className={
              isDanger ? 'mt-0.5 h-5 w-5 text-red-700' : isWarning ? 'mt-0.5 h-5 w-5 text-yellow-700' : 'mt-0.5 h-5 w-5 text-slate-700'
            }
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={isDanger ? 'font-semibold text-red-900' : isWarning ? 'font-semibold text-yellow-900' : 'font-semibold text-slate-900'}>
                Alertas de prazo
              </span>
              {counts.overdue > 0 && <Badge variant="destructive">{counts.overdue} vencido(s)</Badge>}
              {counts.today > 0 && <Badge variant="destructive">{counts.today} vence(m) hoje</Badge>}
              {counts.tomorrow > 0 && <Badge className="bg-yellow-100 text-yellow-800">{counts.tomorrow} vence(m) amanhã</Badge>}
            </div>
            <div className={isDanger ? 'text-xs text-red-900/90' : isWarning ? 'text-xs text-yellow-900/90' : 'text-xs text-slate-700'}>
              Alerta auxiliar — confira o prazo no teor da publicação/andamento. Não substitui conferência profissional.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            className={
              isDanger
                ? 'border-red-200 bg-white hover:bg-red-50'
                : isWarning
                  ? 'border-yellow-200 bg-white hover:bg-yellow-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
            }
          >
            <Link href="/dashboard/deadlines">Ver prazos</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}


