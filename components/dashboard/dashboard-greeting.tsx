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
        <div className={`rounded-xl border bg-gradient-to-r ${gradientClass} p-4 sm:p-5`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-5 w-5 text-slate-500 shrink-0" />
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 truncate">
                            {greeting}{displayName ? `, ${displayName}` : ""}! 👋
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 ml-7">
                        {hasUrgent ? (
                            <>
                                {todayDeadlineCount > 0 && (
                                    <span className="font-semibold text-red-600">
                                        {todayDeadlineCount} prazo{todayDeadlineCount > 1 ? "s" : ""} vence{todayDeadlineCount > 1 ? "m" : ""} hoje
                                    </span>
                                )}
                                {todayDeadlineCount > 0 && urgentDeadlineCount > 0 && " · "}
                                {urgentDeadlineCount > 0 && (
                                    <span className="font-semibold text-orange-600">
                                        {urgentDeadlineCount} prazo{urgentDeadlineCount > 1 ? "s" : ""} urgente{urgentDeadlineCount > 1 ? "s" : ""}
                                    </span>
                                )}
                            </>
                        ) : (
                            "Tudo em dia! Continue o bom trabalho."
                        )}
                    </p>
                </div>

                {/* Indicador de urgência */}
                {todayDeadlineCount > 0 && (
                    <div className="shrink-0 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 border-2 border-red-300 animate-pulse">
                        <span className="text-sm sm:text-lg font-bold text-red-700">{todayDeadlineCount}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
