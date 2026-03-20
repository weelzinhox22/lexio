"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Briefcase,
    GripVertical,
    Eye,
    Clock,
    User,
    Scale,
    MoveRight,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────

type KanbanProcess = {
    id: string
    title: string
    process_number: string
    status: string
    priority: string
    court: string | null
    value: number | null
    created_at: string
    clients: {
        id: string
        name: string
    } | null
}

type ColumnConfig = {
    id: string
    title: string
    color: string
    bgColor: string
    borderColor: string
    dotColor: string
    headerBg: string
}

const COLUMNS: ColumnConfig[] = [
    {
        id: "active",
        title: "Ativos",
        color: "text-blue-700",
        bgColor: "bg-blue-50/50",
        borderColor: "border-blue-200",
        dotColor: "bg-blue-500",
        headerBg: "bg-blue-100/80",
    },
    {
        id: "in_progress",
        title: "Em Andamento",
        color: "text-amber-700",
        bgColor: "bg-amber-50/50",
        borderColor: "border-amber-200",
        dotColor: "bg-amber-500",
        headerBg: "bg-amber-100/80",
    },
    {
        id: "won",
        title: "Ganhos",
        color: "text-green-700",
        bgColor: "bg-green-50/50",
        borderColor: "border-green-200",
        dotColor: "bg-green-500",
        headerBg: "bg-green-100/80",
    },
    {
        id: "lost",
        title: "Perdidos",
        color: "text-red-700",
        bgColor: "bg-red-50/50",
        borderColor: "border-red-200",
        dotColor: "bg-red-500",
        headerBg: "bg-red-100/80",
    },
    {
        id: "archived",
        title: "Arquivados",
        color: "text-slate-600",
        bgColor: "bg-slate-50/50",
        borderColor: "border-slate-200",
        dotColor: "bg-slate-400",
        headerBg: "bg-slate-100/80",
    },
]

// ─── Priority helpers ───────────────────────────────────────────────────────

function getPriorityConfig(priority: string) {
    switch (priority) {
        case "urgent":
            return { label: "Urgente", class: "bg-red-100 text-red-700 border-red-200" }
        case "high":
            return { label: "Alta", class: "bg-orange-100 text-orange-700 border-orange-200" }
        case "medium":
            return { label: "Média", class: "bg-yellow-100 text-yellow-700 border-yellow-200" }
        default:
            return { label: "Baixa", class: "bg-slate-100 text-slate-600 border-slate-200" }
    }
}

// ─── Kanban Card ────────────────────────────────────────────────────────────

function KanbanCard({
    process,
    onDragStart,
    isDragging,
}: {
    process: KanbanProcess
    onDragStart: (e: React.DragEvent, processId: string) => void
    isDragging: boolean
}) {
    const priority = getPriorityConfig(process.priority)

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, process.id)}
            className={cn(
                "group relative bg-white rounded-lg border border-slate-200 p-3 cursor-grab active:cursor-grabbing",
                "shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200",
                "touch-manipulation",
                isDragging && "opacity-40 scale-95 rotate-1"
            )}
        >
            {/* Drag handle */}
            <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
                <GripVertical className="h-4 w-4 text-slate-400" />
            </div>

            <div className="space-y-2 pl-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 flex-1">
                        {process.title}
                    </h4>
                    <Link href={`/dashboard/processes/${process.id}`}>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                    </Link>
                </div>

                {/* Process number */}
                <p className="text-xs text-slate-500 font-mono truncate">
                    {process.process_number}
                </p>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", priority.class)}>
                        {priority.label}
                    </Badge>

                    {process.clients && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{process.clients.name}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    {process.court && (
                        <div className="flex items-center gap-1 truncate">
                            <Scale className="h-3 w-3 shrink-0" />
                            <span className="truncate">{process.court}</span>
                        </div>
                    )}
                    {process.value && (
                        <span className="font-medium text-green-600 shrink-0">
                            R$ {process.value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                        </span>
                    )}
                    {!process.court && !process.value && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(process.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Kanban Column ──────────────────────────────────────────────────────────

function KanbanColumn({
    column,
    processes,
    onDragStart,
    onDragOver,
    onDrop,
    onDragLeave,
    isDropTarget,
    draggingId,
}: {
    column: ColumnConfig
    processes: KanbanProcess[]
    onDragStart: (e: React.DragEvent, processId: string) => void
    onDragOver: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent, columnId: string) => void
    onDragLeave: (e: React.DragEvent) => void
    isDropTarget: boolean
    draggingId: string | null
}) {
    return (
        <div
            className={cn(
                "flex flex-col rounded-xl border-2 transition-all duration-200 min-w-[280px] sm:min-w-[300px]",
                column.bgColor,
                isDropTarget
                    ? `${column.borderColor} shadow-lg ring-2 ring-offset-2 ring-blue-300`
                    : "border-transparent"
            )}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, column.id)}
            onDragLeave={onDragLeave}
        >
            {/* Column header */}
            <div className={cn("flex items-center justify-between px-3 py-2.5 rounded-t-lg", column.headerBg)}>
                <div className="flex items-center gap-2">
                    <div className={cn("h-2.5 w-2.5 rounded-full", column.dotColor)} />
                    <h3 className={cn("text-sm font-bold", column.color)}>
                        {column.title}
                    </h3>
                </div>
                <Badge variant="secondary" className="text-xs bg-white/70 font-semibold">
                    {processes.length}
                </Badge>
            </div>

            {/* Cards area */}
            <div className="flex-1 p-2 space-y-2 min-h-[120px] max-h-[calc(100vh-280px)] overflow-y-auto">
                {processes.length === 0 ? (
                    <div className={cn(
                        "flex flex-col items-center justify-center py-8 text-center rounded-lg border-2 border-dashed",
                        isDropTarget ? column.borderColor : "border-slate-200/50"
                    )}>
                        <MoveRight className="h-6 w-6 text-slate-300 mb-2" />
                        <p className="text-xs text-slate-400">
                            Arraste processos para cá
                        </p>
                    </div>
                ) : (
                    processes.map((process) => (
                        <KanbanCard
                            key={process.id}
                            process={process}
                            onDragStart={onDragStart}
                            isDragging={draggingId === process.id}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

// ─── Mobile View: Stacked Columns ───────────────────────────────────────────

function MobileKanbanColumn({
    column,
    processes,
    onStatusChange,
    isUpdating,
}: {
    column: ColumnConfig
    processes: KanbanProcess[]
    onStatusChange: (processId: string, newStatus: string) => void
    isUpdating: string | null
}) {
    const [expanded, setExpanded] = useState(column.id === "active")

    return (
        <div className={cn("rounded-xl border overflow-hidden", column.borderColor)}>
            {/* Header (toggle) */}
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "flex items-center justify-between w-full px-4 py-3 text-left transition-colors",
                    column.headerBg
                )}
            >
                <div className="flex items-center gap-2">
                    <div className={cn("h-2.5 w-2.5 rounded-full", column.dotColor)} />
                    <h3 className={cn("text-sm font-bold", column.color)}>{column.title}</h3>
                    <Badge variant="secondary" className="text-xs bg-white/70">{processes.length}</Badge>
                </div>
                <span className="text-xs text-slate-400">{expanded ? "▲" : "▼"}</span>
            </button>

            {/* Cards */}
            {expanded && (
                <div className={cn("p-3 space-y-3", column.bgColor)}>
                    {processes.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">Nenhum processo</p>
                    ) : (
                        processes.map((process) => {
                            const priority = getPriorityConfig(process.priority)
                            const otherColumns = COLUMNS.filter((c) => c.id !== column.id)

                            return (
                                <div key={process.id} className="bg-white rounded-lg border border-slate-200 p-3 space-y-2 shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">{process.title}</h4>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{process.process_number}</p>
                                        </div>
                                        <Link href={`/dashboard/processes/${process.id}`}>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                                <Eye className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="outline" className={cn("text-[10px]", priority.class)}>{priority.label}</Badge>
                                        {process.clients && (
                                            <span className="text-[11px] text-slate-500 truncate">
                                                <User className="h-3 w-3 inline mr-0.5" />{process.clients.name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Mover para outra coluna */}
                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                                        <span className="text-[10px] text-slate-400 w-full mb-0.5">Mover para:</span>
                                        {otherColumns.map((col) => (
                                            <button
                                                key={col.id}
                                                onClick={() => onStatusChange(process.id, col.id)}
                                                disabled={isUpdating === process.id}
                                                className={cn(
                                                    "text-[10px] font-medium px-2 py-1 rounded-md border transition-all",
                                                    "hover:shadow-sm active:scale-95",
                                                    col.borderColor, col.color, col.bgColor,
                                                    isUpdating === process.id && "opacity-50"
                                                )}
                                            >
                                                {col.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Main Kanban Board ──────────────────────────────────────────────────────

export function ProcessKanban({ processes: initial }: { processes: KanbanProcess[] }) {
    const router = useRouter()
    const [processes, setProcesses] = useState<KanbanProcess[]>(initial)
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [dropTarget, setDropTarget] = useState<string | null>(null)
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const dragCounter = useRef(0)

    // Group processes by status
    const grouped = COLUMNS.reduce((acc, col) => {
        acc[col.id] = processes.filter((p) => {
            if (col.id === "in_progress") {
                // Processos que podem estar como "in_progress" ou sem status específico
                return p.status === "in_progress"
            }
            return p.status === col.id
        })
        return acc
    }, {} as Record<string, KanbanProcess[]>)

    // Update status in DB
    const updateStatus = useCallback(async (processId: string, newStatus: string) => {
        setIsUpdating(processId)
        const supabase = createClient()

        // Optimistic update
        setProcesses((prev) =>
            prev.map((p) => (p.id === processId ? { ...p, status: newStatus } : p))
        )

        try {
            const { error } = await supabase
                .from("processes")
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq("id", processId)

            if (error) {
                // Revert on error
                setProcesses(initial)
                console.error("[Kanban] update error:", error)
            }
        } catch (err) {
            setProcesses(initial)
            console.error("[Kanban] error:", err)
        } finally {
            setIsUpdating(null)
        }
    }, [initial])

    // ─── Drag handlers ────────────────────────────────────────────────────

    const handleDragStart = useCallback((e: React.DragEvent, processId: string) => {
        setDraggingId(processId)
        e.dataTransfer.setData("text/plain", processId)
        e.dataTransfer.effectAllowed = "move"

        // Custom drag image
        const elem = e.currentTarget as HTMLElement
        if (elem) {
            const rect = elem.getBoundingClientRect()
            e.dataTransfer.setDragImage(elem, rect.width / 2, 20)
        }
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
    }, [])

    const handleDragEnter = useCallback((columnId: string) => {
        dragCounter.current++
        setDropTarget(columnId)
    }, [])

    const handleDragLeave = useCallback(() => {
        dragCounter.current--
        if (dragCounter.current <= 0) {
            dragCounter.current = 0
            setDropTarget(null)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
        e.preventDefault()
        dragCounter.current = 0
        setDropTarget(null)

        const processId = e.dataTransfer.getData("text/plain")
        if (!processId) return

        const process = processes.find((p) => p.id === processId)
        if (!process || process.status === columnId) {
            setDraggingId(null)
            return
        }

        updateStatus(processId, columnId)
        setDraggingId(null)
    }, [processes, updateStatus])

    const handleDragEnd = useCallback(() => {
        setDraggingId(null)
        setDropTarget(null)
        dragCounter.current = 0
    }, [])

    return (
        <div onDragEnd={handleDragEnd}>
            {/* Desktop: horizontal scroll Kanban */}
            <div className="hidden md:block overflow-x-auto pb-4 -mx-2 px-2">
                <div className="flex gap-4 min-w-max">
                    {COLUMNS.map((column) => (
                        <div
                            key={column.id}
                            className="w-[300px] lg:w-[320px] shrink-0"
                            onDragEnter={() => handleDragEnter(column.id)}
                        >
                            <KanbanColumn
                                column={column}
                                processes={grouped[column.id] || []}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onDragLeave={handleDragLeave}
                                isDropTarget={dropTarget === column.id}
                                draggingId={draggingId}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile: stacked accordion columns */}
            <div className="md:hidden space-y-3">
                {COLUMNS.map((column) => (
                    <MobileKanbanColumn
                        key={column.id}
                        column={column}
                        processes={grouped[column.id] || []}
                        onStatusChange={updateStatus}
                        isUpdating={isUpdating}
                    />
                ))}
            </div>
        </div>
    )
}
