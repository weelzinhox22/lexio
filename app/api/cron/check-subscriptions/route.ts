import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    const expectedSecret = process.env.CRON_SECRET
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use Service Role Key
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const now = new Date()
    const nowIso = now.toISOString()
    const fiveDaysFuture = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
    const threeDaysFuture = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const oneDayFuture = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)

    // Formating helper for start/end of day
    const formatDayRage = (date: Date) => {
      const start = new Date(date)
      start.setUTCHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setUTCHours(23, 59, 59, 999)
      return { start: start.toISOString(), end: end.toISOString() }
    }

    // 1. Fetch EXPIRED subscriptions
    const { data: expiredSubscriptions, error: expErr } = await supabase
      .from("subscriptions")
      .select(`id, user_id, status, current_period_end, profiles (full_name, email, phone)`)
      .neq("status", "expired")
      .lt("current_period_end", nowIso)

    if (expErr) throw expErr

    console.log(`[v0] Found ${expiredSubscriptions?.length || 0} expired subscriptions`)

    // 2. Fetch EXPIRING subscriptions (in 5, 3 or 1 days)
    const { data: activeSubscriptions, error: actErr } = await supabase
      .from("subscriptions")
      .select(`id, user_id, status, current_period_end, profiles(full_name, email)`)
      .neq("status", "expired")
      .gt("current_period_end", nowIso)
      .lt("current_period_end", formatDayRage(fiveDaysFuture).end)

    if (actErr) throw actErr

    const results = []
    for (const sub of expiredSubscriptions || []) {
      // Update subscription status
      await supabase.from("subscriptions").update({ status: "expired" }).eq("id", sub.id)

      const profile = sub.profiles as any
      const message =
        `⚠️ *Licença Expirada*\n\n` +
        `Olá ${profile?.full_name || ""},\n\n` +
        `Sua licença do sistema jurídico expirou.\n` +
        `Para continuar usando todas as funcionalidades, renove sua assinatura.\n\n` +
        `Acesse: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`

      // Send WhatsApp notification if phone exists
      if (profile?.phone && process.env.WHATSAPP_API_URL) {
        try {
          await fetch(process.env.WHATSAPP_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
            },
            body: JSON.stringify({
              phone: profile.phone.replace(/\D/g, ""),
              message: message,
            }),
          })

          // Log notification (Whatsapp)
          await supabase.from("notifications").insert({
            user_id: sub.user_id,
            notification_type: "payment_reminder",
            title: "Licença Expirada",
            message: message,
            entity_type: "subscription",
            entity_id: sub.id,
            channel: "whatsapp",
            notification_status: "sent",
            sent_at: nowIso,
          })

          results.push({ user_id: sub.user_id, status: "notified" })
        } catch (error) {
          console.error(`[v0] Failed to send notification to ${profile.phone}:`, error)
          results.push({ user_id: sub.user_id, status: "failed" })
        }
      } else {
        // Fallback: Notify via in_app
        await supabase.from("notifications").insert({
          user_id: sub.user_id,
          notification_type: "payment_reminder",
          title: "Licença Expirada!",
          message: `Olá ${profile?.full_name || "Doutor(a)"}, sua licença expirou. Renove sua assinatura para manter o acesso às funcionalidades completas.`,
          entity_type: "subscription",
          entity_id: sub.id,
          channel: "in_app",
          notification_status: "pending",
          sent_at: nowIso,
        })
        results.push({ user_id: sub.user_id, status: "notified_in_app" })
      }
    }

    // Process expiring notifications
    for (const sub of activeSubscriptions || []) {
      const endDate = new Date(sub.current_period_end)
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // We only notify on exact 5, 3, or 1 days left
      if ([5, 3, 1].includes(daysLeft)) {
        const title = `Assinatura expira em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}`
        const message = `Atenção: Sua licença atual do sistema tem vencimento para daqui a ${daysLeft} dia${daysLeft > 1 ? 's' : ''} (${endDate.toLocaleDateString('pt-BR')}). Por favor, providencie a renovação na tela de Assinatura.`

        // We use dedupe_key so we don't send multiple times on the same day if the CRON runs multiple times
        const dedupeKey = `expiring_${sub.id}_${daysLeft}_days`

        // Try to insert (will fail silently or duplicate depending on table constraints, but we can do an upsert or check)
        const { count } = await supabase.from("notifications")
          .select("id", { count: 'exact', head: true })
          .eq("user_id", sub.user_id)
          .eq("title", title)
          .gte("created_at", formatDayRage(now).start) // Already sent today?

        if ((count || 0) === 0) {
          await supabase.from("notifications").insert({
            user_id: sub.user_id,
            notification_type: "payment_alert",
            title,
            message,
            entity_type: "subscription",
            entity_id: sub.id,
            channel: "in_app",
            notification_status: "pending",
            created_at: nowIso
          })
          results.push({ user_id: sub.user_id, status: `notified_expiring_${daysLeft}d` })
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked_at: nowIso,
      expired_count: expiredSubscriptions?.length || 0,
      expiring_count: activeSubscriptions?.length || 0,
      action_results: results,
    })
  } catch (error) {
    console.error("[v0] Subscription cron error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
