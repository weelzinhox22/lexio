import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const today = new Date()
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString()

    const { data: deadlines, error: deadlinesError } = await supabase
      .from("deadlines")
      .select(
        `
        id,
        title,
        description,
        deadline_date,
        user_id,
        process_id,
        processes (
          title,
          process_number
        )
      `,
      )
      .eq("status", "pending")
      .gte("deadline_date", todayStart)
      .lte("deadline_date", todayEnd)

    if (deadlinesError) {
      console.error("[v0] Error fetching deadlines:", deadlinesError)
      return NextResponse.json({ error: "Failed to fetch deadlines" }, { status: 500 })
    }

    console.log(`[v0] Found ${deadlines?.length || 0} deadlines for today`)

    const userIds = [...new Set(deadlines?.map((d) => d.user_id) || [])]
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone").in("id", userIds)

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

    const notifications = []
    for (const deadline of deadlines || []) {
      const profile = profileMap.get(deadline.user_id)
      if (!profile?.phone) {
        console.log(`[v0] Skipping deadline ${deadline.id} - no phone number`)
        continue
      }

      const processInfo = deadline.processes as any
      const message =
        `🔔 *Prazo Vencendo Hoje!*\n\n` +
        `📋 *Prazo:* ${deadline.title}\n` +
        `⚖️ *Processo:* ${processInfo?.title || "N/A"} (${processInfo?.process_number || "N/A"})\n` +
        `📅 *Data:* ${new Date(deadline.deadline_date).toLocaleDateString("pt-BR")}\n\n` +
        `${deadline.description ? `📝 *Detalhes:* ${deadline.description}\n\n` : ""}` +
        `Acesse o sistema para mais informações.`

      try {
        const whatsappResponse = await fetch(process.env.WHATSAPP_API_URL!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
          },
          body: JSON.stringify({
            phone: profile.phone.replace(/\D/g, ""), // Remove formatting
            message: message,
          }),
        })

        const whatsappData = await whatsappResponse.json()
        const success = whatsappResponse.ok

        await supabase.from("notifications").insert({
          user_id: deadline.user_id,
          type: "deadline_reminder",
          title: "Prazo Vencendo Hoje",
          message: message,
          entity_type: "deadline",
          entity_id: deadline.id,
          channel: "whatsapp",
          status: success ? "sent" : "failed",
          sent_at: success ? new Date().toISOString() : null,
          error_message: success ? null : JSON.stringify(whatsappData),
        })

        notifications.push({
          deadline_id: deadline.id,
          user_name: profile.full_name,
          phone: profile.phone,
          status: success ? "sent" : "failed",
          error: success ? null : whatsappData,
        })

        console.log(`[v0] Notification ${success ? "sent" : "failed"} to ${profile.full_name}`)
      } catch (error) {
        console.error(`[v0] Error sending WhatsApp to ${profile.phone}:`, error)

        await supabase.from("notifications").insert({
          user_id: deadline.user_id,
          type: "deadline_reminder",
          title: "Prazo Vencendo Hoje",
          message: message,
          entity_type: "deadline",
          entity_id: deadline.id,
          channel: "whatsapp",
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        })

        notifications.push({
          deadline_id: deadline.id,
          user_name: profile.full_name,
          phone: profile.phone,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      checked_at: new Date().toISOString(),
      deadlines_found: deadlines?.length || 0,
      notifications_sent: notifications.filter((n) => n.status === "sent").length,
      notifications_failed: notifications.filter((n) => n.status === "failed").length,
      details: notifications,
    })
  } catch (error) {
    console.error("[v0] Cron job error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
