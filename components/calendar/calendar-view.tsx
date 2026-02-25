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
      <Card className="rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Button variant="outline" className="h-9 px-4 rounded-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition-colors font-semibold border shadow-sm w-full sm:w-auto">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sincronizar Google
              </Button>
              <div className="flex gap-2">
                <Button onClick={previousMonth} variant="outline" size="icon" className="h-9 w-9 rounded-full border-slate-200 hover:bg-slate-100 transition-colors">
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                </Button>
                <Button
                  onClick={() => setCurrentDate(new Date())}
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-full border-slate-200 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  Hoje
                </Button>
                <Button onClick={nextMonth} variant="outline" size="icon" className="h-9 w-9 rounded-full border-slate-200 hover:bg-slate-100 transition-colors">
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
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
                    "min-h-[100px] border border-slate-100 rounded-xl p-2 sm:p-3 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex flex-col group cursor-pointer",
                    isToday ? "border-blue-200 bg-blue-50/50 shadow-sm" : "bg-white",
                  )}
                >
                  <div className="flex flex-col h-full">
                    <span className={cn(
                      "text-sm font-semibold mb-1",
                      isToday ? "text-blue-700 bg-blue-100/50 w-fit px-2 py-0.5 rounded-md" : "text-slate-500 group-hover:text-slate-800"
                    )}>
                      {day}
                    </span>
                    {hasEvents && (
                      <div className="mt-1 space-y-1.5 flex-1 overflow-hidden">
                        {events.deadlines.slice(0, 2).map((d) => (
                          <div
                            key={d.id}
                            className="text-[11px] leading-tight truncate px-1.5 py-1 rounded bg-orange-50 text-orange-700 border border-orange-100 font-medium"
                          >
                            <span className="opacity-70 mr-1">•</span>{d.title}
                          </div>
                        ))}
                        {events.appointments.slice(0, 2).map((a) => (
                          <div key={a.id} className="text-[11px] leading-tight truncate px-1.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                            <span className="opacity-70 mr-1">•</span>{a.title}
                          </div>
                        ))}
                        {events.deadlines.length + events.appointments.length > 4 && (
                          <div className="text-[10px] text-slate-500 font-medium text-center bg-slate-100 rounded py-0.5">
                            +{events.deadlines.length + events.appointments.length - 4} mais
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
        <Card className="rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-4">
            <CardTitle className="text-slate-900 text-lg">Próximos Prazos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {deadlines.slice(0, 5).map((deadline) => (
              <div key={deadline.id} className="flex items-start gap-3 p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 leading-tight">{deadline.title}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(deadline.deadline_date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shadow-none px-2",
                    deadline.priority === "urgent" ? "bg-red-50 text-red-700 border-red-200" :
                      deadline.priority === "high" ? "bg-orange-50 text-orange-700 border-orange-200" :
                        deadline.priority === "medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          "bg-slate-50 text-slate-700 border-slate-200",
                  )}
                >
                  {deadline.priority}
                </Badge>
              </div>
            ))}
            {deadlines.length === 0 && <p className="text-sm text-slate-500 p-4 text-center">Nenhum prazo cadastrado</p>}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-4">
            <CardTitle className="text-slate-900 text-lg">Próximos Compromissos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {appointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex items-start gap-3 p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 leading-tight">{appointment.title}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(appointment.start_time).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(appointment.start_time).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {appointment.location && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {appointment.location}</p>}
                </div>
              </div>
            ))}
            {appointments.length === 0 && <p className="text-sm text-slate-500 p-4 text-center">Nenhum compromisso cadastrado</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
