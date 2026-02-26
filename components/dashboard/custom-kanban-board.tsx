"use client"

import { useState, useCallback, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
    Plus,
    MoreVertical,
    Trash2,
    Calendar,
    Layers,
    CheckCircle2,
    AlertCircle,
    Edit2,
    Check,
    X,
    Trello
} from "lucide-react"
import { createCard, moveCard, createColumn, deleteColumn, updateColumnTitle, deleteCard, updateCardTitle, deleteBoard, updateBoardTitle } from "@/app/dashboard/kanban/custom-actions"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface KanbanCard {
    id: string
    title: string
    description?: string
    priority: string
    order_index: number
    due_date?: string
}

interface KanbanColumn {
    id: string
    title: string
    order_index: number
    cards: KanbanCard[]
}

interface CustomKanbanBoardProps {
    boardId: string
    initialColumns: KanbanColumn[]
}

export function CustomKanbanBoard({ boardId, initialColumns }: CustomKanbanBoardProps) {
    const router = useRouter()
    const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns)
    const [isAddingCard, setIsAddingCard] = useState<string | null>(null)
    const [newCardTitle, setNewCardTitle] = useState("")
    const [isAddingColumn, setIsAddingColumn] = useState(false)
    const [newColumnTitle, setNewColumnTitle] = useState("")
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
    const [tempColumnTitle, setTempColumnTitle] = useState("")
    const [editingCardId, setEditingCardId] = useState<string | null>(null)
    const [tempCardTitle, setTempCardTitle] = useState("")

    // Update local state when initialColumns change (e.g. on server revalidation)
    useEffect(() => {
        setColumns(initialColumns)
    }, [initialColumns])

    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result
        if (!destination) return
        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        const sourceColIndex = columns.findIndex(c => c.id === source.droppableId)
        const destColIndex = columns.findIndex(c => c.id === destination.droppableId)

        const sourceCol = { ...columns[sourceColIndex] }
        const destCol = source.droppableId === destination.droppableId
            ? sourceCol
            : { ...columns[destColIndex] }

        const sourceCards = [...sourceCol.cards]
        const destCards = source.droppableId === destination.droppableId
            ? sourceCards
            : [...destCol.cards]

        // Move card
        const [movedCard] = sourceCards.splice(source.index, 1)
        destCards.splice(destination.index, 0, movedCard)

        // Update state optimistically
        const newColumns = [...columns]
        if (source.droppableId === destination.droppableId) {
            newColumns[sourceColIndex] = { ...sourceCol, cards: sourceCards }
        } else {
            newColumns[sourceColIndex] = { ...sourceCol, cards: sourceCards }
            newColumns[destColIndex] = { ...destCol, cards: destCards }
        }
        setColumns(newColumns)

        // Persist to DB
        try {
            // Collect all updates for cards in both affected columns to maintain order_index
            const updates: { id: string, column_id: string, order_index: number }[] = []

            // Add moved card
            updates.push({ id: draggableId, column_id: destination.droppableId, order_index: destination.index })

            // Shift others if needed? For simplicity in MVP, we just send moveCard
            const res = await moveCard(draggableId, destination.droppableId, destination.index)
            if (!res.success) toast.error("Falha ao salvar movimento")
        } catch (e) {
            toast.error("Erro de conexão")
            setColumns(initialColumns) // Revert
        }
    }

    const handleCreateCard = async (columnId: string) => {
        if (!newCardTitle.trim()) {
            setIsAddingCard(null)
            return
        }

        const col = columns.find(c => c.id === columnId)
        const orderIndex = col ? col.cards.length : 0

        const res = await createCard(columnId, newCardTitle, orderIndex)
        if (res.success) {
            toast.success("Tarefa adicionada")
            setNewCardTitle("")
            setIsAddingCard(null)
        } else {
            toast.error("Erro ao criar tarefa")
        }
    }

    const handleCreateColumn = async () => {
        if (!newColumnTitle.trim()) {
            setIsAddingColumn(false)
            return
        }
        const res = await createColumn(boardId, newColumnTitle, columns.length)
        if (res.success) {
            toast.success("Coluna criada")
            setNewColumnTitle("")
            setIsAddingColumn(false)
        } else {
            toast.error("Erro ao criar coluna")
        }
    }

    const handleDeleteColumn = async (id: string) => {
        if (!confirm("Excluir esta coluna e todas as suas tarefas?")) return
        const res = await deleteColumn(id)
        if (res.success) toast.success("Coluna excluída")
        else toast.error("Erro ao excluir coluna")
    }

    const handleUpdateColumnTitle = async (id: string) => {
        if (!tempColumnTitle.trim()) {
            setEditingColumnId(null)
            return
        }
        const res = await updateColumnTitle(id, tempColumnTitle)
        if (res.success) {
            toast.success("Título atualizado")
            setEditingColumnId(null)
        } else {
            toast.error("Erro ao atualizar")
        }
    }

    const handleDeleteCard = async (id: string) => {
        const res = await deleteCard(id)
        if (res.success) toast.success("Tarefa excluída")
        else toast.error("Erro ao excluir tarefa")
    }

    const handleUpdateCardTitle = async (id: string) => {
        if (!tempCardTitle.trim()) {
            setEditingCardId(null)
            return
        }
        const res = await updateCardTitle(id, tempCardTitle)
        if (res.success) {
            toast.success("Tarefa atualizada")
            setEditingCardId(null)
        } else {
            toast.error("Erro ao atualizar")
        }
    }

    const handleDeleteBoard = async () => {
        if (!confirm("Excluir este quadro permanentemente?")) return
        const res = await deleteBoard(boardId)
        if (res.success) {
            toast.success("Quadro excluído")
            router.refresh()
        } else {
            toast.error("Erro ao excluir quadro")
        }
    }

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent': return <AlertCircle className="h-3 w-3 text-red-500" />
            case 'high': return <AlertCircle className="h-3 w-3 text-orange-500" />
            default: return <Layers className="h-3 w-3 text-slate-400" />
        }
    }

    return (
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide py-2">
            <DragDropContext onDragEnd={onDragEnd}>
                {columns.map((column) => (
                    <div key={column.id} className="w-[300px] shrink-0 flex flex-col gap-4 group/col">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {editingColumnId === column.id ? (
                                    <div className="flex items-center gap-1 w-full">
                                        <Input
                                            autoFocus
                                            className="h-7 text-xs py-0 px-2"
                                            value={tempColumnTitle}
                                            onChange={(e) => setTempColumnTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateColumnTitle(column.id)
                                                if (e.key === 'Escape') setEditingColumnId(null)
                                            }}
                                        />
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={() => handleUpdateColumnTitle(column.id)}>
                                            <Check className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider truncate cursor-pointer hover:text-indigo-600"
                                            onClick={() => {
                                                setEditingColumnId(column.id)
                                                setTempColumnTitle(column.title)
                                            }}
                                        >
                                            {column.title}
                                        </h3>
                                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                            {column.cards.length}
                                        </span>
                                    </>
                                )}
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 opacity-0 group-hover/col:opacity-100 transition-opacity">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-1" align="end">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-xs h-8 text-slate-600"
                                        onClick={() => {
                                            setEditingColumnId(column.id)
                                            setTempColumnTitle(column.title)
                                        }}
                                    >
                                        <Edit2 className="h-3.5 w-3.5 mr-2" /> Editar Título
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteColumn(column.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir Coluna
                                    </Button>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={cn(
                                        "flex-1 flex flex-col gap-3 p-3 rounded-2xl bg-slate-100/50 border-2 border-dashed transition-all duration-200",
                                        snapshot.isDraggingOver ? "bg-slate-200/50 border-slate-300" : "border-transparent"
                                    )}
                                >
                                    {column.cards.map((card, index) => (
                                        <Draggable key={card.id} draggableId={card.id} index={index}>
                                            {(provided, snapshot) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={cn(
                                                        "p-3 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                                                        snapshot.isDragging && "rotate-2 scale-105 shadow-xl border-indigo-400 z-50 pointer-events-none"
                                                    )}
                                                >
                                                    <div className="space-y-2 group/card relative">
                                                        <div className="flex items-start justify-between gap-2">
                                                            {editingCardId === card.id ? (
                                                                <div className="flex flex-col gap-2 w-full">
                                                                    <Input
                                                                        autoFocus
                                                                        className="text-xs h-8"
                                                                        value={tempCardTitle}
                                                                        onChange={(e) => setTempCardTitle(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') handleUpdateCardTitle(card.id)
                                                                            if (e.key === 'Escape') setEditingCardId(null)
                                                                        }}
                                                                    />
                                                                    <div className="flex gap-1 justify-end">
                                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-600" onClick={() => handleUpdateCardTitle(card.id)}>
                                                                            <Check className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400" onClick={() => setEditingCardId(null)}>
                                                                            <X className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <p className="text-sm font-medium text-slate-900 leading-tight w-full pr-6">{card.title}</p>
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-300 absolute right-0 top-0 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                                                <MoreVertical className="h-3 w-3" />
                                                                            </Button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-40 p-1" align="end">
                                                                            <Button
                                                                                variant="ghost"
                                                                                className="w-full justify-start text-[11px] h-7 px-2"
                                                                                onClick={() => {
                                                                                    setEditingCardId(card.id)
                                                                                    setTempCardTitle(card.title)
                                                                                }}
                                                                            >
                                                                                <Edit2 className="h-3 w-3 mr-2" /> Editar
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                className="w-full justify-start text-[11px] h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                                onClick={() => handleDeleteCard(card.id)}
                                                                            >
                                                                                <Trash2 className="h-3 w-3 mr-2" /> Excluir
                                                                            </Button>
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </>
                                                            )}
                                                        </div>

                                                        {card.description && (
                                                            <p className="text-[11px] text-slate-500 line-clamp-2">{card.description}</p>
                                                        )}

                                                        <div className="flex items-center justify-between pt-1">
                                                            <div className="flex items-center gap-2">
                                                                {getPriorityIcon(card.priority)}
                                                                {card.due_date && (
                                                                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span>{new Date(card.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="h-6 w-6 rounded-full bg-slate-100 border border-white -ml-2" />
                                                        </div>
                                                    </div>
                                                </Card>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    {/* Add Card Interface */}
                                    {isAddingCard === column.id ? (
                                        <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-sm animate-in fade-in zoom-in duration-200">
                                            <Input
                                                autoFocus
                                                placeholder="O que precisa ser feito?"
                                                className="text-sm mb-2 h-9"
                                                value={newCardTitle}
                                                onChange={(e) => setNewCardTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleCreateCard(column.id)
                                                    if (e.key === 'Escape') setIsAddingCard(null)
                                                }}
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700" onClick={() => handleCreateCard(column.id)}>Adicionar</Button>
                                                <Button size="sm" variant="ghost" className="h-8" onClick={() => setIsAddingCard(null)}>Cancelar</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 h-9"
                                            onClick={() => setIsAddingCard(column.id)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Novo item
                                        </Button>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}

                {/* New Column Button Placeholder */}
                <div className="w-[300px] shrink-0">
                    {isAddingColumn ? (
                        <div className="bg-slate-100 p-4 rounded-2xl border-2 border-dashed border-indigo-200 shadow-sm animate-in fade-in slide-in-from-right-4 duration-200">
                            <Input
                                autoFocus
                                placeholder="Nome da coluna..."
                                className="text-sm mb-3 h-10 border-indigo-100"
                                value={newColumnTitle}
                                onChange={(e) => setNewColumnTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateColumn()
                                    if (e.key === 'Escape') setIsAddingColumn(false)
                                }}
                            />
                            <div className="flex gap-2">
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 w-full" onClick={handleCreateColumn}>Criar Coluna</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsAddingColumn(false)}>Cancelar</Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full border-dashed border-2 py-8 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all hover:border-slate-300"
                            onClick={() => setIsAddingColumn(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Coluna
                        </Button>
                    )}

                    <div className="mt-12 p-6 rounded-2xl bg-red-50/50 border border-red-100">
                        <p className="text-[11px] font-bold text-red-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <AlertCircle className="h-3 w-3" /> Zona de Perigo
                        </p>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-[11px] text-red-600 hover:bg-red-100/50 h-8 font-semibold"
                            onClick={handleDeleteBoard}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            EXCLUIR ESTE QUADRO
                        </Button>
                    </div>
                </div>
            </DragDropContext>
        </div>
    )
}
