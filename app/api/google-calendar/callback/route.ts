import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GOOGLE_CALENDAR_CONFIG, GOOGLE_TOKEN_URL } from '@/lib/google-calendar/config'

/**
 * GET /api/google-calendar/callback
 * 
 * Callback do OAuth2 do Google Calendar
 * Recebe o código de autorização e troca por tokens de acesso
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // user_id
    const error = searchParams.get('error')

    // Verificar se houve erro na autenticação
    if (error) {
      console.error('Erro na autenticação Google:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_calendar_error=${error}`
      )
    }

    // Verificar se recebemos o código
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_calendar_error=missing_code`
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Verificar se o usuário está autenticado e se o state corresponde
    if (!user || user.id !== state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_calendar_error=invalid_state`
      )
    }

    // Trocar código por tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: GOOGLE_CALENDAR_CONFIG.redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Erro ao trocar código por tokens:', errorData)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_calendar_error=token_exchange_failed`
      )
    }

    const tokens = await tokenResponse.json()

    // Calcular data de expiração
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in)

    // Salvar tokens no banco de dados
    const { error: dbError } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expires_at: expiresAt.toISOString(),
        scope: tokens.scope,
      })

    if (dbError) {
      console.error('Erro ao salvar tokens:', dbError)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_calendar_error=database_error`
      )
    }

    // Atualizar flag de conexão do usuário
    await supabase
      .from('users')
      .update({ google_calendar_connected: true })
      .eq('id', user.id)

    // Redirecionar para as configurações com sucesso
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_calendar_success=true`
    )
  } catch (error) {
    console.error('Erro no callback do Google Calendar:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?google_calendar_error=unexpected_error`
    )
  }
}

