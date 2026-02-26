import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeTextOffline } from '@/lib/ai/offline-analyzer'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { text, type } = await req.json()

        if (!text || !type) {
            return NextResponse.json({ error: 'Text and type are required' }, { status: 400 })
        }

        // Usar nossa biblioteca offline que roda SOMENTE no servidor de banco de dados
        const analysis = await analyzeTextOffline(supabase, text, type)

        return NextResponse.json({
            success: true,
            analysis
        })
    } catch (error) {
        console.error('[OFFLINE_ANALYZE_ERROR]', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
