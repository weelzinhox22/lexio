"use client"

import { useMemo } from "react"
import { Sunrise, Sun, Sunset, Moon } from "lucide-react"

type GreetingProps = {
    userName: string | null
    urgentDeadlineCount?: number
    todayDeadlineCount?: number
}

export function DashboardGreeting({ userName, urgentDeadlineCount = 0, todayDeadlineCount = 0 }: GreetingProps) {
    const { greeting, Icon, gradientClass } = useMemo(() => {
        const hour = new Date().getHours()

        if (hour >= 5 && hour < 12) {
            return {
                greeting: "Bom dia",
                Icon: Sunrise,
                gradientClass: "from-amber-50 to-orange-50 border-amber-200",
            }
        } else if (hour >= 12 && hour < 18) {
            return {
                greeting: "Boa tarde",
                Icon: Sun,
                gradientClass: "from-sky-50 to-blue-50 border-sky-200",
            }
        } else if (hour >= 18 && hour < 21) {
            return {
                greeting: "Boa noite",
                Icon: Sunset,
                gradientClass: "from-indigo-50 to-purple-50 border-indigo-200",
            }
        } else {
            return {
                greeting: "Boa noite",
                Icon: Moon,
                gradientClass: "from-slate-50 to-zinc-50 border-slate-200",
            }
        }
    }, [])

    const displayName = userName
        ? userName.split(" ")[0] // Primeiro nome apenas
        : null

    const hasUrgent = urgentDeadlineCount > 0 || todayDeadlineCount > 0

    return (
        <div className={`relative rounded-2xl border ${gradientClass} shadow-sm overflow-hidden p-6 sm:p-8 isolate`}>
            {/* Soft background glow */}
            <div className={`absolute -inset-24 opacity-40 blur-3xl -z-10 rounded-full bg-gradient-to-br ${gradientClass}`} />

            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-4 relative z-10">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/80 shadow-sm border border-slate-100 backdrop-blur-sm">
                            <Icon className="h-5 w-5 text-slate-700 shrink-0" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                            {greeting}{displayName ? `, ${displayName}` : ""}!
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 sm:ml-14 max-w-2xl leading-relaxed">
                        {hasUrgent ? (
                            <span className="flex flex-wrap items-center gap-1.5">
                                {todayDeadlineCount > 0 && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm">
                                        {todayDeadlineCount} prazo{todayDeadlineCount > 1 ? "s" : ""} vence{todayDeadlineCount > 1 ? "m" : ""} hoje
                                    </span>
                                )}
                                {urgentDeadlineCount > 0 && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 shadow-sm">
                                        {urgentDeadlineCount} prazo{urgentDeadlineCount > 1 ? "s" : ""} urgente{urgentDeadlineCount > 1 ? "s" : ""}
                                    </span>
                                )}
                                <span className="text-slate-500 ml-1">Fique de olho na sua agenda.</span>
                            </span>
                        ) : (
                            "Tudo em dia! Nenhuma pendência urgente no momento. Continue o bom trabalho."
                        )}
                    </p>
                </div>

                {/* Indicador de urgência */}
                {todayDeadlineCount > 0 && (
                    <div className="shrink-0 flex flex-col items-center justify-center p-3 sm:px-5 sm:py-3 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-md shadow-sm">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Pendentes</span>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-2xl font-bold text-slate-900 leading-none">{todayDeadlineCount}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
