"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"

interface Deadline {
  id: string
  title: string
  description: string | null
  deadline_date: string
  priority: string
  status: string
  processes?: any
}

interface Appointment {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  location: string | null
  type: string | null
  status: string
}

interface CalendarViewProps {
  deadlines: Deadline[]
  appointments: Appointment[]
}

export function CalendarView({ deadlines, appointments }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

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

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  function getEventsForDay(day: number) {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split("T")[0]

    const dayDeadlines = deadlines.filter((d) => d.deadline_date.startsWith(dateStr))
    const dayAppointments = appointments.filter((a) => a.start_time.startsWith(dateStr))

    return { deadlines: dayDeadlines, appointments: dayAppointments }
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={previousMonth} variant="outline" size="sm" className="border-slate-300 bg-transparent">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCurrentDate(new Date())}
                variant="outline"
                size="sm"
                className="border-slate-300"
              >
                Hoje
              </Button>
              <Button onClick={nextMonth} variant="outline" size="sm" className="border-slate-300 bg-transparent">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-center font-semibold text-slate-700 py-2">
                {day}
              </div>
            ))}
            {emptyDays.map((i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const events = getEventsForDay(day)
              const hasEvents = events.deadlines.length > 0 || events.appointments.length > 0
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={day}
                  className={cn(
                    "aspect-square border border-slate-200 rounded-lg p-2 hover:bg-slate-50 transition-colors",
                    isToday && "border-blue-500 bg-blue-50",
                  )}
                >
                  <div className="flex flex-col h-full">
                    <span className={cn("text-sm font-medium", isToday ? "text-blue-700" : "text-slate-700")}>
                      {day}
                    </span>
                    {hasEvents && (
                      <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                        {events.deadlines.slice(0, 2).map((d) => (
                          <div
                            key={d.id}
                            className="text-xs truncate px-1 py-0.5 rounded bg-orange-100 text-orange-700"
                          >
                            {d.title}
                          </div>
                        ))}
                        {events.appointments.slice(0, 2).map((a) => (
                          <div key={a.id} className="text-xs truncate px-1 py-0.5 rounded bg-blue-100 text-blue-700">
                            {a.title}
                          </div>
                        ))}
                        {events.deadlines.length + events.appointments.length > 2 && (
                          <div className="text-xs text-slate-500">
                            +{events.deadlines.length + events.appointments.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Próximos Prazos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deadlines.slice(0, 5).map((deadline) => (
              <div key={deadline.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{deadline.title}</p>
                  <p className="text-sm text-slate-600">
                    {new Date(deadline.deadline_date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    deadline.priority === "urgent" && "bg-red-50 text-red-700 border-red-200",
                    deadline.priority === "high" && "bg-orange-50 text-orange-700 border-orange-200",
                    deadline.priority === "medium" && "bg-yellow-50 text-yellow-700 border-yellow-200",
                    deadline.priority === "low" && "bg-slate-50 text-slate-700 border-slate-200",
                  )}
                >
                  {deadline.priority}
                </Badge>
              </div>
            ))}
            {deadlines.length === 0 && <p className="text-sm text-slate-600">Nenhum prazo cadastrado</p>}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Próximos Compromissos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{appointment.title}</p>
                  <p className="text-sm text-slate-600">
                    {new Date(appointment.start_time).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(appointment.start_time).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {appointment.location && <p className="text-xs text-slate-500 mt-1">{appointment.location}</p>}
                </div>
              </div>
            ))}
            {appointments.length === 0 && <p className="text-sm text-slate-600">Nenhum compromisso cadastrado</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
