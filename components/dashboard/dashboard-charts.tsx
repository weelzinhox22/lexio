"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"

// ---- Pure CSS/SVG Charts ----

type ChartData = { label: string; value: number; color: string }

function DonutChart({ data, size = 180 }: { data: ChartData[]; size?: number }) {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    if (total === 0) return (
        <div className="flex items-center justify-center" style={{ width: size, height: size }}>
            <p className="text-sm text-slate-400">Sem dados</p>
        </div>
    )

    const cx = size / 2, cy = size / 2, r = size / 2 - 16
    const circumference = 2 * Math.PI * r
    let offset = 0

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {data.map((d, i) => {
                    const pct = d.value / total
                    const dashLength = circumference * pct
                    const dashGap = circumference - dashLength
                    const strokeDashoffset = -offset
                    offset += dashLength
                    return (
                        <circle
                            key={i}
                            cx={cx} cy={cy} r={r}
                            fill="none"
                            stroke={d.color}
                            strokeWidth={24}
                            strokeDasharray={`${dashLength} ${dashGap}`}
                            strokeDashoffset={strokeDashoffset}
                            transform={`rotate(-90 ${cx} ${cy})`}
                            className="transition-all duration-700"
                        />
                    )
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-slate-900">{total}</p>
                <p className="text-xs text-slate-500">Total</p>
            </div>
        </div>
    )
}

function BarChart({ data, height = 140 }: { data: ChartData[]; height?: number }) {
    const maxVal = Math.max(...data.map(d => d.value), 1)

    return (
        <div className="flex items-end gap-2 justify-around" style={{ height }}>
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 max-w-[50px]">
                    <span className="text-xs font-semibold text-slate-700">{d.value}</span>
                    <div
                        className="w-full rounded-t-md transition-all duration-700"
                        style={{
                            height: `${Math.max((d.value / maxVal) * (height - 30), 4)}px`,
                            backgroundColor: d.color,
                            minHeight: 4,
                        }}
                    />
                    <span className="text-[10px] text-slate-500 text-center leading-tight">{d.label}</span>
                </div>
            ))}
        </div>
    )
}

function MiniLineChart({ data, color = "#3b82f6" }: { data: number[]; color?: string }) {
    if (data.length < 2) return null
    const maxVal = Math.max(...data, 1)
    const w = 280, h = 80
    const points = data.map((v, i) => ({
        x: (i / (data.length - 1)) * w,
        y: h - (v / maxVal) * (h - 10) - 5,
    }))
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaD = pathD + ` L ${w} ${h} L 0 ${h} Z`

    return (
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaD} fill="url(#lineGrad)" />
            <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="white" strokeWidth="1.5" />
            ))}
        </svg>
    )
}

// ---- Main Component ----

interface DashboardChartsProps {
    processByStatus: Record<string, number>
    processByType: Record<string, number>
    monthlyRevenue: number[]
    monthLabels: string[]
    deadlineStats: { completed: number; pending: number; overdue: number }
}

export function DashboardCharts({
    processByStatus,
    processByType,
    monthlyRevenue,
    monthLabels,
    deadlineStats,
}: DashboardChartsProps) {
    const statusColors: Record<string, string> = {
        active: "#22c55e",
        archived: "#94a3b8",
        suspended: "#f59e0b",
        closed: "#ef4444",
    }
    const statusLabels: Record<string, string> = {
        active: "Ativos",
        archived: "Arquivados",
        suspended: "Suspensos",
        closed: "Encerrados",
    }

    const statusData = useMemo(() =>
        Object.entries(processByStatus)
            .filter(([, v]) => v > 0)
            .map(([k, v]) => ({
                label: statusLabels[k] || k,
                value: v,
                color: statusColors[k] || "#64748b",
            })),
        [processByStatus]
    )

    const typeColors = ["#3b82f6", "#8b5cf6", "#f97316", "#06b6d4", "#ec4899", "#10b981"]
    const typeData = useMemo(() =>
        Object.entries(processByType)
            .filter(([, v]) => v > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([k, v], i) => ({
                label: k.length > 12 ? k.slice(0, 12) + '…' : k,
                value: v,
                color: typeColors[i % typeColors.length],
            })),
        [processByType]
    )

    const deadlineData: ChartData[] = [
        { label: "Cumpridos", value: deadlineStats.completed, color: "#22c55e" },
        { label: "Pendentes", value: deadlineStats.pending, color: "#f59e0b" },
        { label: "Vencidos", value: deadlineStats.overdue, color: "#ef4444" },
    ]

    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 px-1">Análise e Gráficos</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* 1. Processos por Status */}
                <Card className="rounded-2xl border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Processos por Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-3">
                        <DonutChart data={statusData} size={160} />
                        <div className="flex flex-wrap gap-2 justify-center">
                            {statusData.map((d) => (
                                <div key={d.label} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                    <span className="text-xs text-slate-600">{d.label} ({d.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Processos por Tipo */}
                <Card className="rounded-2xl border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Por Tipo / Área</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {typeData.length > 0 ? (
                            <BarChart data={typeData} height={160} />
                        ) : (
                            <div className="flex items-center justify-center h-[160px]">
                                <p className="text-sm text-slate-400">Sem dados de tipo</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 3. Receita Mensal */}
                <Card className="rounded-2xl border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Receita Mensal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-2">
                            <MiniLineChart data={monthlyRevenue} color="#22c55e" />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 px-1 font-medium">
                            {monthLabels.map((m, i) => (
                                <span key={i}>{m}</span>
                            ))}
                        </div>
                        <div className="mt-2 text-center">
                            <p className="text-xs text-slate-500 font-medium">Este mês</p>
                            <p className="text-lg font-bold text-green-600 tracking-tight">
                                R$ {(monthlyRevenue[monthlyRevenue.length - 1] || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Prazos */}
                <Card className="rounded-2xl border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Prazos</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-3">
                        <DonutChart data={deadlineData} size={160} />
                        <div className="flex flex-wrap gap-2 justify-center">
                            {deadlineData.map((d) => (
                                <div key={d.label} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                    <span className="text-xs text-slate-600">{d.label} ({d.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
