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
      className={`w-full border-b-2 px-4 py-4 shadow-sm ${
        isDanger
          ? 'border-red-300 bg-gradient-to-r from-red-50 via-red-50 to-orange-50'
          : isWarning
            ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 via-yellow-50 to-amber-50'
            : 'border-blue-300 bg-gradient-to-r from-blue-50 via-blue-50 to-indigo-50'
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 rounded-full p-2 ${
              isDanger
                ? 'bg-red-100 text-red-700'
                : isWarning
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-blue-100 text-blue-700'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`font-bold text-base ${
                  isDanger ? 'text-red-900' : isWarning ? 'text-yellow-900' : 'text-blue-900'
                }`}
              >
                ⚠️ Alertas de Prazo
              </span>
              {counts.overdue > 0 && (
                <Badge className="bg-red-600 text-white font-semibold px-2.5 py-0.5 text-xs">
                  {counts.overdue} vencido{counts.overdue > 1 ? 's' : ''}
                </Badge>
              )}
              {counts.today > 0 && (
                <Badge className="bg-orange-600 text-white font-semibold px-2.5 py-0.5 text-xs">
                  {counts.today} vence hoje
                </Badge>
              )}
              {counts.tomorrow > 0 && (
                <Badge className="bg-yellow-500 text-white font-semibold px-2.5 py-0.5 text-xs">
                  {counts.tomorrow} vence amanhã
                </Badge>
              )}
            </div>
            <div
              className={`text-sm leading-relaxed ${
                isDanger ? 'text-red-800/90' : isWarning ? 'text-yellow-800/90' : 'text-blue-800/90'
              }`}
            >
              Confira o prazo no teor da publicação/andamento. Este alerta é auxiliar e não substitui conferência profissional.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            asChild
            className={`font-semibold shadow-md transition-all ${
              isDanger
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                : isWarning
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
            }`}
          >
            <Link href="/dashboard/deadlines">Ver prazos →</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}


