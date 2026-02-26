"use client"

import { useState, useCallback } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Plus,
    MoreVertical,
    Calendar,
    User,
    DollarSign,
    ChevronRight,
    Clock
} from "lucide-react"
import { updateKanbanItem } from "@/app/dashboard/kanban/actions"
import { toast } from "sonner"
import Link from "next/link"

interface KanbanItem {
    id: string
    title: string
    subtitle?: string
    status: string
    kanban_order: number
    metadata?: {
        date?: string
        value?: string | number
        priority?: string
        client_name?: string
    }
}

interface KanbanColumn {
    id: string
    title: string
    color?: string
    items: KanbanItem[]
}

interface KanbanBoardProps {
    initialColumns: KanbanColumn[]
    type: "leads" | "processes"
}

const columnStyles: Record<string, { bg: string, text: string, border: string, dot: string }> = {
    new: { bg: "bg-blue-50/50", text: "text-blue-700", border: "border-blue-200/60", dot: "bg-blue-500" },
    contacted: { bg: "bg-amber-50/50", text: "text-amber-700", border: "border-amber-200/60", dot: "bg-amber-500" },
    qualified: { bg: "bg-indigo-50/50", text: "text-indigo-700", border: "border-indigo-200/60", dot: "bg-indigo-500" },
    converted: { bg: "bg-emerald-50/50", text: "text-emerald-700", border: "border-emerald-200/60", dot: "bg-emerald-500" },
    lost: { bg: "bg-red-50/50", text: "text-red-700", border: "border-red-200/60", dot: "bg-red-500" },
    active: { bg: "bg-blue-50/50", text: "text-blue-700", border: "border-blue-200/60", dot: "bg-blue-500" },
    won: { bg: "bg-emerald-50/50", text: "text-emerald-700", border: "border-emerald-200/60", dot: "bg-emerald-500" },
    lost_proc: { bg: "bg-red-50/50", text: "text-red-700", border: "border-red-200/60", dot: "bg-red-500" }, // specific for process lost
    archived: { bg: "bg-slate-50/50", text: "text-slate-600", border: "border-slate-200/60", dot: "bg-slate-400" },
}

export function KanbanBoard({ initialColumns, type }: KanbanBoardProps) {
    const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns)

    const onDragEnd = useCallback(
        async (result: DropResult) => {
            const { source, destination, draggableId } = result

            if (!destination) return

            if (
                source.droppableId === destination.droppableId &&
                source.index === destination.index
            ) {
                return
            }

            // Find source and destination columns
            const sourceColIndex = columns.findIndex((c) => c.id === source.droppableId)
            const destColIndex = columns.findIndex((c) => c.id === destination.droppableId)

            const sourceCol = columns[sourceColIndex]
            const destCol = columns[destColIndex]

            const sourceItems = Array.from(sourceCol.items)
            const destItems = source.droppableId === destination.droppableId
                ? sourceItems
                : Array.from(destCol.items)

            // Remove from source
            const [movedItem] = sourceItems.splice(source.index, 1)

            // Change status if moving to another column
            if (source.droppableId !== destination.droppableId) {
                movedItem.status = destination.droppableId
            }

            // Add to destination
            destItems.splice(destination.index, 0, movedItem)

            // Update local state
            const newColumns = [...columns]
            newColumns[sourceColIndex] = { ...sourceCol, items: sourceItems }
            newColumns[destColIndex] = { ...destCol, items: destItems }
            setColumns(newColumns)

            // Save to database
            try {
                const result = await updateKanbanItem(
                    type,
                    draggableId,
                    destination.droppableId,
                    destination.index
                )
                if (!result.success) {
                    toast.error("Erro ao sincronizar posição no servidor")
                }
            } catch (error) {
                toast.error("Erro de conexão com o servidor")
            }
        },
        [columns, type]
    )

    const getPriorityColor = (priority?: string) => {
        switch (priority?.toLowerCase()) {
            case "high": case "urgent": return "bg-red-100 text-red-700"
            case "medium": return "bg-amber-100 text-amber-700"
            case "low": return "bg-emerald-100 text-emerald-700"
            default: return "bg-slate-100 text-slate-700"
        }
    }

    return (
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 md:-mx-6 md:px-6 min-h-[calc(100vh-250px)] scrollbar-hide">
            <DragDropContext onDragEnd={onDragEnd}>
                {columns.map((column) => {
                    const styleKey = column.id === 'lost' && type === 'processes' ? 'lost_proc' : column.id
                    const style = columnStyles[styleKey] || columnStyles.archived

                    return (
                        <div key={column.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm", style.dot)} />
                                    <h3 className={cn("font-bold tracking-tight", style.text)}>{column.title}</h3>
                                    <span className="bg-white/50 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded-full ring-1 ring-slate-200 shadow-sm">
                                        {column.items.length}
                                    </span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100/50">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={cn(
                                            "flex-1 flex flex-col gap-3 p-3 rounded-2xl border transition-all duration-300 min-h-[150px]",
                                            style.bg,
                                            style.border,
                                            snapshot.isDraggingOver && "bg-slate-100/80 border-slate-300 shadow-inner"
                                        )}
                                    >
                                        {column.items.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={cn(
                                                            "group select-none",
                                                            snapshot.isDragging && "scale-[1.02] shadow-2xl"
                                                        )}
                                                    >
                                                        <Link href={`/dashboard/${type}/${item.id}`}>
                                                            <Card className={cn(
                                                                "p-4 border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer rounded-xl bg-white",
                                                                snapshot.isDragging && "border-indigo-400 ring-2 ring-indigo-100"
                                                            )}>
                                                                <div className="space-y-3">
                                                                    <div className="flex justify-between items-start gap-2">
                                                                        <p className="font-semibold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                                            {item.title}
                                                                        </p>
                                                                        {item.metadata?.priority && (
                                                                            <Badge className={cn("text-[10px] uppercase tracking-wider font-bold h-5", getPriorityColor(item.metadata.priority))}>
                                                                                {item.metadata.priority === 'urgent' ? 'Urgente' : item.metadata.priority}
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    {item.subtitle && (
                                                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                                            {item.subtitle}
                                                                        </p>
                                                                    )}

                                                                    <div className="pt-2 flex flex-wrap gap-2 items-center text-[11px] font-medium text-slate-500">
                                                                        {item.metadata?.client_name && (
                                                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md">
                                                                                <User className="h-3 w-3" />
                                                                                <span className="truncate max-w-[120px]">{item.metadata.client_name}</span>
                                                                            </div>
                                                                        )}

                                                                        {item.metadata?.value && (
                                                                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                                                                                <DollarSign className="h-3 w-3" />
                                                                                <span>{item.metadata.value}</span>
                                                                            </div>
                                                                        )}

                                                                        {item.metadata?.date && (
                                                                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                                                                                <Clock className="h-3 w-3" />
                                                                                <span>{item.metadata.date}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        </Link>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    )
                })}
            </DragDropContext>
        </div>
    )
}
