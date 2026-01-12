import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use Service Role Key
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const now = new Date().toISOString()

    const { data: expiredSubscriptions, error } = await supabase
      .from("subscriptions")
      .select(
        `
        id,
        user_id,
        status,
        current_period_end,
        profiles (
          full_name,
          email,
          phone
        )
      `,
      )
      .neq("status", "expired")
      .lt("current_period_end", now)

    if (error) {
      console.error("[v0] Error fetching subscriptions:", error)
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    console.log(`[v0] Found ${expiredSubscriptions?.length || 0} expired subscriptions`)

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

          // Log notification
          await supabase.from("notifications").insert({
            user_id: sub.user_id,
            notification_type: "payment_reminder",
            title: "Licença Expirada",
            message: message,
            entity_type: "subscription",
            entity_id: sub.id,
            channel: "whatsapp",
            notification_status: "sent",
            sent_at: now,
          })

          results.push({ user_id: sub.user_id, status: "notified" })
        } catch (error) {
          console.error(`[v0] Failed to send notification to ${profile.phone}:`, error)
          results.push({ user_id: sub.user_id, status: "failed" })
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked_at: now,
      expired_count: expiredSubscriptions?.length || 0,
      notified_count: results.filter((r) => r.status === "notified").length,
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
