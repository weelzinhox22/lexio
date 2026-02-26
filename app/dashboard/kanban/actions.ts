"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateKanbanItem(
    type: "leads" | "processes",
    id: string,
    status: string,
    newOrder: number
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from(type)
        .update({
            status,
            kanban_order: newOrder,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)

    if (error) {
        console.error(`Error updating ${type} in kanban:`, error)
        return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/kanban")
    return { success: true }
}

export async function updateColumnOrders(
    type: "leads" | "processes",
    items: { id: string; kanban_order: number }[]
) {
    const supabase = await createClient()

    // Batch updates in Supabase can be tricky with different values per row
    // For simplicity, we'll do sequential updates as it's usually just a few items
    // In a high-traffic app, we'd use a single RPC call
    for (const item of items) {
        await supabase
            .from(type)
            .update({ kanban_order: item.kanban_order })
            .eq("id", item.id)
    }

    revalidatePath("/dashboard/kanban")
    return { success: true }
}
