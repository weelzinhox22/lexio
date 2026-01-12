import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GOOGLE_CALENDAR_CONFIG, GOOGLE_OAUTH_URL } from '@/lib/google-calendar/config'

/**
 * GET /api/google-calendar/auth
 * 
 * Inicia o fluxo de autenticação OAuth2 com o Google Calendar
 * Redireciona o usuário para a página de consentimento do Google
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se as variáveis de ambiente estão configuradas
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
      return NextResponse.json(
        { error: 'Google Client ID não configurado' },
        { status: 500 }
      )
    }

    // Construir URL de autorização do Google
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: GOOGLE_CALENDAR_CONFIG.redirectUri,
      response_type: 'code',
      scope: GOOGLE_CALENDAR_CONFIG.scopes.join(' '),
      access_type: 'offline', // Para obter refresh token
      prompt: 'consent', // Sempre pedir consentimento para garantir refresh token
      state: user.id, // Passar o user_id no state para validar depois
    })

    const authUrl = `${GOOGLE_OAUTH_URL}?${params.toString()}`

    // Redirecionar para o Google
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Erro ao iniciar autenticação Google Calendar:', error)
    return NextResponse.json(
      { error: 'Erro ao iniciar autenticação' },
      { status: 500 }
    )
  }
}









