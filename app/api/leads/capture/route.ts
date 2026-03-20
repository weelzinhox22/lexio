import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// We must bypass CORS for this API, as it gets called from any Landing Page
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { user_id, name, phone, source } = body

        if (!user_id || !name || !phone) {
            return NextResponse.json({ error: "Missing fields" }, {
                status: 400,
                headers: { 'Access-Control-Allow-Origin': '*' }
            })
        }

        // We use service role to insert into the leads table publicly
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error } = await supabase
            .from("leads")
            .insert({
                user_id: user_id,
                name: name,
                phone: phone,
                source: `Widget WhatsApp (${source || 'Desconhecida'})`,
                status: 'novo',
            })

        if (error) {
            console.error("Error capturing lead from widget:", error)
            return NextResponse.json({ error: "Failed to capture" }, {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': '*' }
            })
        }

        return NextResponse.json({ success: true }, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        })

    } catch (error) {
        console.error("Capture API Error:", error)
        return NextResponse.json({ error: "Internal error" }, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        })
    }
}
