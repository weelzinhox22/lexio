"use server"

import { createClient as createServerClient } from "@/lib/supabase/server"

export async function getWhatsappWidgetConfig() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, data: null }

    const { data, error } = await supabase
        .from("whatsapp_widgets")
        .select("*")
        .eq("user_id", user.id)
        .single()

    // If perfectly found:
    if (data) return { success: true, data }

    // If empty, return success but null data so the client knows it doesn't exist yet
    if (error && error.code === 'PGRST116') {
        return { success: true, data: null }
    }

    console.error("Error fetching widget:", error)
    return { success: false, error: "Erro ao buscar configuração." }
}

export async function saveWhatsappWidgetConfig(payload: { phone_number: string, default_message: string, button_color: string, call_to_action: string, is_active: boolean }) {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    const { data: existing } = await supabase
        .from("whatsapp_widgets")
        .select("id")
        .eq("user_id", user.id)
        .single()

    if (existing) {
        // Update
        const { error } = await supabase
            .from("whatsapp_widgets")
            .update({
                phone_number: payload.phone_number,
                default_message: payload.default_message,
                button_color: payload.button_color,
                call_to_action: payload.call_to_action,
                is_active: payload.is_active,
                updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id)

        if (error) return { success: false, error: "Erro ao atualizar widget." }
    } else {
        // Insert
        const { error } = await supabase
            .from("whatsapp_widgets")
            .insert({
                user_id: user.id,
                phone_number: payload.phone_number,
                default_message: payload.default_message,
                button_color: payload.button_color,
                call_to_action: payload.call_to_action,
                is_active: payload.is_active
            })

        if (error) return { success: false, error: "Erro ao criar widget." }
    }

    return { success: true }
}
