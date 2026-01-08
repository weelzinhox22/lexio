import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/google-calendar/disconnect
 * 
 * Desconecta o Google Calendar do usuário
 * Remove os tokens do banco de dados
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Deletar tokens do banco de dados
    const { error: deleteError } = await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Erro ao deletar tokens:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao desconectar Google Calendar' },
        { status: 500 }
      )
    }

    // Atualizar flag de conexão do usuário
    await supabase
      .from('users')
      .update({ google_calendar_connected: false })
      .eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao desconectar Google Calendar:', error)
    return NextResponse.json(
      { error: 'Erro ao desconectar Google Calendar' },
      { status: 500 }
    )
  }
}

