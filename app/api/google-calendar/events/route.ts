import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listGoogleCalendarEvents } from '@/lib/google-calendar/client'

/**
 * GET /api/google-calendar/events
 * 
 * Busca os eventos do Google Calendar do usuário.
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const timeMin = searchParams.get('timeMin') || undefined
        const timeMax = searchParams.get('timeMax') || undefined

        const result = await listGoogleCalendarEvents(user.id, timeMin, timeMax)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Erro ao listar eventos' },
                { status: 400 } // Talvez 401 se der erro de token expirado sem renovação, mantendo 400 por garantia
            )
        }

        return NextResponse.json({ events: result.events })
    } catch (error) {
        console.error('Erro na rota GET Google Calendar Events:', error)
        return NextResponse.json(
            { error: 'Erro inesperado' },
            { status: 500 }
        )
    }
}
