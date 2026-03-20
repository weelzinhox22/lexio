"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Bell, Users as UsersIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type WeekEvent = {
    id: string
    title: string
    date: string
    type: "deadline" | "audience"
    priority?: string
    link: string
}

type WeekCalendarProps = {
    deadlines: Array<{
        id: string
        title: string
        deadline_date: string
        priority?: string
    }>
    audiences: Array<{
        id: string
        title: string
        audience_date: string
    }>
}

const DAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTH_NAMES = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
]

export function WeekCalendar({ deadlines, audiences }: WeekCalendarProps) {
    const { days, events, todayIndex } = useMemo(() => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        // Gerar 7 dias a partir de hoje
        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today)
            date.setDate(date.getDate() + i)
            return date
        })

        // Mapear eventos por dia (YYYY-MM-DD)
        const eventMap = new Map<string, WeekEvent[]>()

        deadlines.forEach((d) => {
            const dateKey = new Date(d.deadline_date).toISOString().split("T")[0]
            if (!eventMap.has(dateKey)) eventMap.set(dateKey, [])
            eventMap.get(dateKey)!.push({
                id: d.id,
                title: d.title,
                date: d.deadline_date,
                type: "deadline",
                priority: d.priority,
                link: `/dashboard/deadlines/${d.id}`,
            })
        })

        audiences.forEach((a) => {
            const dateKey = new Date(a.audience_date).toISOString().split("T")[0]
            if (!eventMap.has(dateKey)) eventMap.set(dateKey, [])
            eventMap.get(dateKey)!.push({
                id: a.id,
                title: a.title,
                date: a.audience_date,
                type: "audience",
                link: `/dashboard/audiences/${a.id}`,
            })
        })

        return {
            days: weekDays,
            events: eventMap,
            todayIndex: 0,
        }
    }, [deadlines, audiences])

    const totalEvents = Array.from(events.values()).flat().length

    return (
        <Card className="rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden flex flex-col h-full">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100/60 bg-slate-50/50 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-[17px] font-semibold text-slate-900 flex items-center gap-2 tracking-tight">
                        <Calendar className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-500" />
                        Próximos 7 Dias
                    </CardTitle>
                    {totalEvents > 0 && (
                        <Badge variant="outline" className="text-xs bg-white text-slate-600 shadow-sm px-2.5 rounded-full border-slate-200/60">
                            {totalEvents} evento{totalEvents > 1 ? "s" : ""}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {/* Grid de dias - horizontal scrollável no mobile */}
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
                    {days.map((day, index) => {
                        const dateKey = day.toISOString().split("T")[0]
                        const dayEvents = events.get(dateKey) || []
                        const isToday = index === todayIndex
                        const hasDeadline = dayEvents.some((e) => e.type === "deadline")
                        const hasAudience = dayEvents.some((e) => e.type === "audience")
                        const hasUrgent = dayEvents.some(
                            (e) => e.type === "deadline" && (e.priority === "urgent" || e.priority === "high")
                        )

                        return (
                            <div
                                key={dateKey}
                                className={cn(
                                    "flex flex-col items-center min-w-[44px] sm:min-w-[56px] flex-1 rounded-xl p-2 transition-all border",
                                    isToday
                                        ? "bg-slate-900 text-white border-slate-800 shadow-md transform -translate-y-0.5"
                                        : dayEvents.length > 0
                                            ? hasUrgent
                                                ? "bg-red-50/50 border-red-200 hover:border-red-300 hover:bg-red-50"
                                                : "bg-blue-50/50 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                                            : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                {/* Nome do dia */}
                                <span
                                    className={cn(
                                        "text-[10px] sm:text-xs font-medium mb-0.5",
                                        isToday ? "text-slate-300" : "text-slate-500"
                                    )}
                                >
                                    {DAY_NAMES_SHORT[day.getDay()]}
                                </span>

                                {/* Número */}
                                <span
                                    className={cn(
                                        "text-base sm:text-lg font-bold leading-tight",
                                        isToday
                                            ? "text-white"
                                            : hasUrgent
                                                ? "text-red-700"
                                                : dayEvents.length > 0
                                                    ? "text-blue-700"
                                                    : "text-slate-900"
                                    )}
                                >
                                    {day.getDate()}
                                </span>

                                {/* Mês (só mostra se for primeiro dia do mês ou primeiro da semana) */}
                                {(day.getDate() === 1 || index === 0) && (
                                    <span
                                        className={cn(
                                            "text-[9px] sm:text-[10px] font-medium",
                                            isToday ? "text-slate-400" : "text-slate-400"
                                        )}
                                    >
                                        {MONTH_NAMES[day.getMonth()]}
                                    </span>
                                )}

                                {/* Indicadores de evento */}
                                {dayEvents.length > 0 && (
                                    <div className="flex gap-0.5 mt-1">
                                        {hasDeadline && (
                                            <div
                                                className={cn(
                                                    "h-1.5 w-1.5 rounded-full",
                                                    isToday
                                                        ? "bg-orange-400"
                                                        : hasUrgent
                                                            ? "bg-red-500"
                                                            : "bg-orange-400"
                                                )}
                                            />
                                        )}
                                        {hasAudience && (
                                            <div
                                                className={cn(
                                                    "h-1.5 w-1.5 rounded-full",
                                                    isToday ? "bg-purple-400" : "bg-purple-500"
                                                )}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Lista de eventos do período */}
                {totalEvents > 0 ? (
                    <div className="space-y-1.5 mt-2 max-h-[200px] overflow-y-auto">
                        {days.map((day, dayIndex) => {
                            const dateKey = day.toISOString().split("T")[0]
                            const dayEvents = events.get(dateKey) || []
                            if (dayEvents.length === 0) return null

                            return dayEvents.map((event) => (
                                <Link key={event.id} href={event.link} className="block group">
                                    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200">
                                        <div
                                            className={cn(
                                                "shrink-0 rounded-lg p-2 shadow-sm border border-black/5",
                                                event.type === "deadline"
                                                    ? "bg-orange-50 text-orange-600"
                                                    : "bg-purple-50 text-purple-600"
                                            )}
                                        >
                                            {event.type === "deadline" ? (
                                                <Bell className="h-3.5 w-3.5" />
                                            ) : (
                                                <UsersIcon className="h-3.5 w-3.5" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                                                {event.title}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {dayIndex === 0
                                                        ? "Hoje"
                                                        : dayIndex === 1
                                                            ? "Amanhã"
                                                            : DAY_NAMES_SHORT[day.getDay()]}{" "}
                                                    · {new Date(event.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                                {event.priority === "urgent" && (
                                                    <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">
                                                        Urgente
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        })}
                    </div>
                ) : (
                    <div className="text-center py-4 text-sm text-slate-500">
                        <Calendar className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p>Nenhum evento nos próximos 7 dias</p>
                        <p className="text-xs text-slate-400 mt-1">Seus prazos e audiências aparecerão aqui</p>
                    </div>
                )}

                {/* Legenda */}
                {totalEvents > 0 && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <div className="h-2 w-2 rounded-full bg-orange-400" />
                            <span>Prazo</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                            <span>Audiência</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
