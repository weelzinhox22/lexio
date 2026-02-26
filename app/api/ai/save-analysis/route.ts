import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { text, analysis } = body

        if (!text || !analysis || !analysis.matchedRules || analysis.matchedRules.length === 0) {
            return NextResponse.json({ error: 'Dados em branco ou inválidos' }, { status: 400 })
        }

        const topRule = analysis.matchedRules[0]

        // Prepare data to insert
        const docPreview = text.length > 400 ? text.substring(0, 400) + '...' : text

        const { data, error } = await supabase.from('saved_jurimetrics').insert({
            user_id: user.id,
            document_preview: docPreview,
            rule_category: topRule.category,
            risk_level: topRule.risk_level,
            probability_score: topRule.probability_score,
            suggested_action: topRule.suggested_action,
            suggested_petition: topRule.suggested_petition,
            deadline_days: topRule.deadline_days,
            financial_impact: topRule.financial_impact,
            full_analysis_json: analysis
        }).select('id').single()

        if (error) {
            console.error('Supabase error saving analysis:', error)
            return NextResponse.json({ error: 'Erro ao salvar histórico offline no banco de dados' }, { status: 500 })
        }

        return NextResponse.json({ success: true, id: data.id })

    } catch (error) {
        console.error('Save analysis error:', error)
        return NextResponse.json({ error: 'Falha interna ao comunicar com o servidor' }, { status: 500 })
    }
}
