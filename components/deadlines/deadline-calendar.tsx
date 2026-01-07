"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Deadline } from "@/lib/types/database"

export function DeadlineCalendar({ deadlines }: { deadlines: Deadline[] }) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  // Create calendar grid
  const calendarDays = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const hasDeadline = (day: number) => {
    return deadlines.some((d) => {
      const deadlineDate = new Date(d.deadline_date)
      return (
        deadlineDate.getDate() === day &&
        deadlineDate.getMonth() === currentMonth &&
        deadlineDate.getFullYear() === currentYear &&
        d.status === "pending"
      )
    })
  }

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  return (
    <>
      <CardHeader>
        <CardTitle className="text-slate-900">
          {monthNames[currentMonth]} {currentYear}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-600 mb-2">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isToday = day === today.getDate()
              const hasDeadlineDay = day ? hasDeadline(day) : false

              return (
                <div
                  key={index}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-sm
                    ${day ? "hover:bg-slate-50" : ""}
                    ${isToday ? "bg-slate-900 text-white font-semibold" : ""}
                    ${hasDeadlineDay && !isToday ? "bg-red-100 text-red-700 font-semibold" : ""}
                    ${!day ? "text-transparent" : "text-slate-900"}
                  `}
                >
                  {day || "-"}
                </div>
              )
            })}
          </div>
          <div className="pt-4 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-slate-900"></div>
              <span className="text-slate-600">Hoje</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-100 border border-red-200"></div>
              <span className="text-slate-600">Com prazo</span>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  )
}
