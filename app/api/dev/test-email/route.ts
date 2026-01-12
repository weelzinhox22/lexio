import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createRouteHandlerClient, hasSupabaseAuthCookies } from '@/lib/supabase/route-handler'

export const runtime = 'nodejs'

function attachSupabaseCookies(resp: NextResponse, cookieResponse: NextResponse) {
  cookieResponse.cookies.getAll().forEach((c) => resp.cookies.set(c.name, c.value, c))
  return resp
}

/**
 * GET /api/dev/test-email?to=email@destino.com
 * Teste isolado do Resend (mínimo) para provar se envio funciona.
 *
 * Regras:
 * - Apenas dev (NODE_ENV !== 'production')
 * - Protegido por auth (Supabase cookies)
 * - Usa process.env.RESEND_API_KEY (backend-only)
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { supabase, cookieResponse } = createRouteHandlerClient(request)
  const hasAuthCookie = hasSupabaseAuthCookies(request)

  const { data, error: authError } = await supabase.auth.getUser()
  const user = data.user
  if (!user) {
    const status = hasAuthCookie ? 403 : 401
    const resp = NextResponse.json(
      { error: status === 401 ? 'Unauthorized' : 'Sessão inválida/expirada. Faça login novamente.' },
      { status, headers: { 'Cache-Control': 'no-store' } }
    )
    console.warn('[GET /api/dev/test-email] Auth failed', { status, hasAuthCookie, authError: authError?.message })
    return attachSupabaseCookies(resp, cookieResponse)
  }

  const to = request.nextUrl.searchParams.get('to')?.trim() || 'weelzinhox22@gmail.com'
  const apiKey = (process.env.RESEND_API_KEY || '').trim()

  console.log('🧪 /api/dev/test-email iniciado', { at: new Date().toISOString(), userId: user.id, to })

  if (!apiKey) {
    const resp = NextResponse.json({ error: 'RESEND_API_KEY não configurada no backend.' }, { status: 500 })
    return attachSupabaseCookies(resp, cookieResponse)
  }

  try {
    const resend = new Resend(apiKey)

    const result = await resend.emails.send({
      from: 'Alertas <onboarding@resend.dev>',
      to,
      subject: 'Teste Resend',
      html: '<b>Email funcionando</b>',
    })

    console.log('✅ Resend test-email response', result)

    const resp = NextResponse.json(
      { success: true, to, resend: result },
      { headers: { 'Cache-Control': 'no-store' } }
    )
    return attachSupabaseCookies(resp, cookieResponse)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.log('❌ Resend test-email error', msg)
    const resp = NextResponse.json({ error: msg }, { status: 502, headers: { 'Cache-Control': 'no-store' } })
    return attachSupabaseCookies(resp, cookieResponse)
  }
}


