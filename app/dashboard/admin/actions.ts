"use server"

import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"

export async function broadcastNotification(title: string, message: string) {
    const supabaseServer = await createServerClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    if (!user) {
        return { success: false, error: "Unauthorized" }
    }

    // Verify Admin
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",")
    if (!user.email || !adminEmails.includes(user.email)) {
        return { success: false, error: "Apenas administradores podem fazer isto." }
    }

    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all active user IDs
    const { data: profiles, error: pError } = await adminSupabase
        .from("profiles")
        .select("id")

    if (pError || !profiles) {
        return { success: false, error: "Erro ao buscar usuários." }
    }

    // Insert notification for all users
    const notifications = profiles.map(p => ({
        user_id: p.id,
        notification_type: "system_announcement",
        title,
        message,
        channel: "in_app",
        notification_status: "pending", // or sent
        created_at: new Date().toISOString()
    }))

    // Chunk inserts if too many
    const CHUNK_SIZE = 500
    for (let i = 0; i < notifications.length; i += CHUNK_SIZE) {
        const chunk = notifications.slice(i, i + CHUNK_SIZE)
        const { error: insertError } = await adminSupabase
            .from("notifications")
            .insert(chunk)

        if (insertError) {
            console.error("Error inserting broadcast chunk:", insertError)
            return { success: false, error: "Erro ao enviar notificações." }
        }
    }

    return { success: true }
}
