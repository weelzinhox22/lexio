import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, hasSupabaseAuthCookies } from '@/lib/supabase/route-handler'
import { daysUntilUTC } from '@/lib/deadlines/alert-engine'
import { sendDeadlineAlertEmail } from '@/lib/email/send-deadline-alert'

export const runtime = 'nodejs'

function attachSupabaseCookies(resp: NextResponse, cookieResponse: NextResponse) {
  cookieResponse.cookies.getAll().forEach((c) => resp.cookies.set(c.name, c.value, c))
  return resp
}

function severityFromDays(days: number): 'info' | 'warning' | 'danger' {
  if (days === 7) return 'info'
  if (days === 3) return 'warning'
  return 'danger'
}

/**
 * POST /api/test/email-alert
 * Envia um e-mail de teste via Resend.
 *
 * Regras:
 * - Apenas dev (NODE_ENV !== 'production')
 * - Protegido por auth (Supabase cookies)
 * - Não usa dados fake: precisa existir um deadline do usuário
 */
export async function POST(request: NextRequest) {
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
    console.warn('[POST /api/test/email-alert] Auth failed', { status, hasAuthCookie, authError: authError?.message })
    return attachSupabaseCookies(resp, cookieResponse)
  }

  let body: { deadlineId?: string; daysRemaining?: number } = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const { data: settings } = await supabase
    .from('notification_settings')
    .select('email_enabled, email_override')
    .eq('user_id', user.id)
    .maybeSingle()

  if (settings && settings.email_enabled === false) {
    const resp = NextResponse.json({ error: 'Alertas por e-mail estão desativados nas configurações.' }, { status: 400 })
    return attachSupabaseCookies(resp, cookieResponse)
  }

  const toEmail = String((settings as any)?.email_override || user.email || '').trim()
  if (!toEmail) {
    const resp = NextResponse.json({ error: 'Não foi possível determinar o e-mail de destino.' }, { status: 400 })
    return attachSupabaseCookies(resp, cookieResponse)
  }

  // Buscar deadline real do usuário
  const deadlineQuery = supabase
    .from('deadlines')
    .select('id, title, deadline_date, process_id')
    .eq('user_id', user.id)
    .neq('status', 'completed')

  const { data: deadline } = body.deadlineId
    ? await deadlineQuery.eq('id', body.deadlineId).maybeSingle()
    : await deadlineQuery.order('deadline_date', { ascending: true }).limit(1).maybeSingle()

  if (!deadline) {
    const resp = NextResponse.json(
      { error: 'Crie um prazo (deadline) antes de enviar e-mail de teste.' },
      { status: 400 }
    )
    return attachSupabaseCookies(resp, cookieResponse)
  }

  const computedDays = daysUntilUTC(deadline.deadline_date, new Date())
  const daysRemaining = Number.isFinite(body.daysRemaining as any) ? Number(body.daysRemaining) : computedDays

  const send = await sendDeadlineAlertEmail({
    to: toEmail,
    userName: null,
    deadline: {
      id: deadline.id,
      title: deadline.title,
      deadline_date: deadline.deadline_date,
      process_id: deadline.process_id ?? null,
    },
    daysRemaining,
    severity: severityFromDays(daysRemaining),
  })

  const resp = send.ok
    ? NextResponse.json({ success: true, resend_id: send.id }, { headers: { 'Cache-Control': 'no-store' } })
    : NextResponse.json({ error: send.error }, { status: 502, headers: { 'Cache-Control': 'no-store' } })

  return attachSupabaseCookies(resp, cookieResponse)
}


