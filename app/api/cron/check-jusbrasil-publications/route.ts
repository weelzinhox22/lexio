import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Cron job para buscar publicações do Jusbrasil automaticamente
 * Executa diariamente às 10h
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Buscar usuários com OAB configurada e busca automática ativada
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, oab_number, oab_state, full_name, jusbrasil_auto_search")
      .not("oab_number", "is", null)
      .eq("jusbrasil_auto_search", true)

    if (profilesError) {
      console.error("[Jusbrasil Cron] Error fetching profiles:", profilesError)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No users with auto-search enabled",
        checked: 0,
      })
    }

    console.log(`[Jusbrasil Cron] Found ${profiles.length} users with auto-search enabled`)

    const results = []
    for (const profile of profiles) {
      try {
        const oabMatch = profile.oab_number?.match(/OAB\/([A-Z]{2})\s*(\d+)/i)
        const oabNumber = oabMatch ? oabMatch[2] : profile.oab_number?.replace(/OAB\/[A-Z]{2}\s*/i, "") || ""
        const oabState = profile.oab_state || oabMatch?.[1] || "BA"

        // Chamar a API de busca
        const searchResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/jusbrasil/search`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CRON_SECRET}`,
            },
            body: JSON.stringify({
              userId: profile.id,
              oabNumber,
              oabState,
            }),
          }
        )

        const searchData = await searchResponse.json()
        results.push({
          user_id: profile.id,
          success: searchData.success,
          publications_found: searchData.publications_found || 0,
        })
      } catch (error) {
        console.error(`[Jusbrasil Cron] Error searching for user ${profile.id}:`, error)
        results.push({
          user_id: profile.id,
          success: false,
          error: String(error),
        })
      }
    }

    return NextResponse.json({
      success: true,
      checked_at: new Date().toISOString(),
      users_checked: profiles.length,
      results,
    })
  } catch (error) {
    console.error("[Jusbrasil Cron] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

