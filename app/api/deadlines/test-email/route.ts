import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendEmailWithRetryAndFallback } from "@/lib/email/retry-with-fallback"
import { renderBaseEmail } from "@/lib/email/templates/base"

export async function POST() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check rate limit: max 3 test emails per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("notification_type", "test_email")
        .gte("created_at", oneHourAgo)

    if (countError) {
        return NextResponse.json({ error: "Failed to check rate limit" }, { status: 500 })
    }

    if (count !== null && count >= 3) {
        return NextResponse.json(
            { error: "Limite de 3 e-mails de teste por hora atingido. Tente novamente mais tarde." },
            { status: 429 }
        )
    }

    // Get user settings and profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single()

    const { data: settings } = await supabase
        .from("notification_settings")
        .select("email_override, email_fallback")
        .eq("user_id", user.id)
        .single()

    const toEmail = (settings?.email_override || profile?.email || user.email || "").trim()
    const fallbackEmail = (settings?.email_fallback || "").trim() || null

    if (!toEmail) {
        return NextResponse.json({ error: "E-mail de destino não configurado." }, { status: 400 })
    }

    // Prepare email content
    const timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    const html = renderBaseEmail({
        title: "Teste do Sistema de Notificações",
        preheader: "Simulação de alerta de prazo",
        body: `
      <p style="margin: 0 0 16px 0;">Olá ${profile?.full_name || "Usuário"},</p>
      <p style="margin: 0 0 16px 0;">Este é um e-mail de teste enviado para confirmar que o sistema de alertas do <strong>Themixa</strong> está configurado corretamente para a sua conta.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">Informações do Teste:</p>
        <p style="margin: 0; font-weight: 600; color: #0f172a;">Horário: ${timestamp}</p>
        <p style="margin: 4px 0 0 0; font-weight: 600; color: #0f172a;">Destino: ${toEmail}</p>
      </div>
      <p style="margin: 0 0 16px 0;">Se você recebeu este e-mail, suas notificações por e-mail estão funcionando perfeitamente.</p>
      <p style="margin: 0;">Atenciosamente,<br>Equipe Themixa</p>
    `,
    })

    // Create notification record
    const { data: notification, error: notifError } = await supabase
        .from("notifications")
        .insert({
            user_id: user.id,
            notification_type: "test_email",
            title: "Teste de E-mail Enviado",
            message: `E-mail de teste enviado para ${toEmail}`,
            channel: "email",
            notification_status: "pending",
            severity: "info",
            entity_type: "deadline", // Dummy entity type to satisfy schema if needed
            entity_id: user.id, // Using user ID as dummy entity ID
            dedupe_key: `test_email_${user.id}_${Date.now()}`,
        })
        .select()
        .single()

    if (notifError) {
        return NextResponse.json({ error: "Failed to record notification" }, { status: 500 })
    }

    // Send the email
    const sendResult = await sendEmailWithRetryAndFallback({
        to: toEmail,
        fallbackEmail,
        subject: `[Themixa] Teste do Sistema de Notificações — ${timestamp}`,
        html,
        alertId: notification.id,
        userId: user.id,
        processId: null,
        deadlineId: null,
    })

    if (sendResult.ok) {
        await supabase
            .from("notifications")
            .update({
                notification_status: "sent",
                sent_at: new Date().toISOString(),
            })
            .eq("id", notification.id)

        return NextResponse.json({ success: true, message: "E-mail de teste enviado com sucesso!" })
    } else {
        await supabase
            .from("notifications")
            .update({
                notification_status: "failed",
                error_message: sendResult.error,
            })
            .eq("id", notification.id)

        return NextResponse.json(
            { error: "Falha ao enviar e-mail. Verifique suas configurações ou tente novamente mais tarde." },
            { status: 500 }
        )
    }
}
