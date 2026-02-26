"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Board Actions
export async function createBoard(title: string, color: string = "#4F46E5") {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Não autorizado" }

    const { data, error } = await supabase
        .from("kanban_boards")
        .insert({ user_id: user.id, title, color })
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    // Create default columns for a new board
    const defaultCols = ["A Fazer", "Em Execução", "Aguardando", "Concluído"]
    const colInserts = defaultCols.map((title, index) => ({
        board_id: data.id,
        title,
        order_index: index
    }))

    await supabase.from("kanban_columns").insert(colInserts)

    revalidatePath("/dashboard/kanban")
    return { success: true, data }
}

export async function deleteBoard(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("kanban_boards").delete().eq("id", id)
    if (error) return { success: false, error: error.message }
    revalidatePath("/dashboard/kanban")
    return { success: true }
}

export async function updateBoardTitle(id: string, title: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("kanban_boards").update({ title }).eq("id", id)
    if (error) return { success: false, error: error.message }
    revalidatePath("/dashboard/kanban")
    return { success: true }
}

// Column Actions
export async function createColumn(boardId: string, title: string, orderIndex: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("kanban_columns")
        .insert({ board_id: boardId, title, order_index: orderIndex })

    if (error) return { success: false, error: error.message }
    revalidatePath("/dashboard/kanban")
    return { success: true }
}

export async function deleteColumn(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("kanban_columns").delete().eq("id", id)
    if (error) return { success: false, error: error.message }
    revalidatePath("/dashboard/kanban")
    return { success: true }
}

export async function updateColumnTitle(id: string, title: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("kanban_columns").update({ title }).eq("id", id)
    if (error) return { success: false, error: error.message }
    revalidatePath("/dashboard/kanban")
    return { success: true }
}

// Card Actions
export async function createCard(columnId: string, title: string, orderIndex: number, description?: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("kanban_cards")
        .insert({ column_id: columnId, title, order_index: orderIndex, description })

    if (error) return { success: false, error: error.message }
    revalidatePath("/dashboard/kanban")
    return { success: true }
}

export async function deleteCard(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("kanban_cards").delete().eq("id", id)
    if (error) return { success: false, error: error.message }
    revalidatePath("/dashboard/kanban")
    return { success: true }
}

export async function updateCardTitle(id: string, title: string, description?: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("kanban_cards").update({ title, description }).eq("id", id)
    if (error) return { success: false, error: error.message }
    revalidatePath("/dashboard/kanban")
    return { success: true }
}

export async function moveCard(cardId: string, toColumnId: string, toIndex: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("kanban_cards")
        .update({ column_id: toColumnId, order_index: toIndex, updated_at: new Date().toISOString() })
        .eq("id", cardId)

    if (error) return { success: false, error: error.message }
    // Note: in a real app would also need to update order_index of other cards in source and dest columns
    return { success: true }
}

export async function updateCardOrderBatch(updates: { id: string, column_id: string, order_index: number }[]) {
    const supabase = await createClient()

    // Simple loop for now, would be better as an RPC for many cards
    for (const update of updates) {
        await supabase
            .from("kanban_cards")
            .update({
                column_id: update.column_id,
                order_index: update.order_index,
                updated_at: new Date().toISOString()
            })
            .eq("id", update.id)
    }

    return { success: true }
}
