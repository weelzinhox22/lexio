import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendDeadlineAlertEmail } from '@/lib/email/send-deadline-alert'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/dev/test-deadline-alert
 *
 * Teste manual do cron: força envio de e-mail usando 1 deadline ativo qualquer.
 * - Ignora datas reais: envia como se fosse "HOJE" (daysRemaining=0)
 * - Loga tudo: deadline encontrado, usuário, e-mail alvo, resposta do Resend
 *
 * Segurança:
 * - Em produção: bloqueia por padrão (403) a menos que ALLOW_DEV_ROUTES esteja habilitada.
 * - Protegido por CRON_SECRET (Authorization: Bearer <CRON_SECRET>)
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_DEV_ROUTES) {
    return NextResponse.json({ error: 'Dev route disabled' }, { status: 403 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase env vars não configuradas (NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const body = await request.json().catch(() => ({} as any))
  const forcedTo = String(body?.to || '').trim() || 'weelzinhox22@gmail.com'

  console.log('🧪 /api/dev/test-deadline-alert iniciado', { at: new Date().toISOString(), forcedTo })

  const { data: deadline, error: dlErr } = await supabase
    .from('deadlines')
    .select('id, user_id, process_id, title, deadline_date, status')
    .neq('status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (dlErr) {
    console.log('❌ Erro buscando deadline', dlErr)
    return NextResponse.json({ error: dlErr.message }, { status: 500 })
  }
  if (!deadline) {
    return NextResponse.json({ error: 'Nenhum deadline ativo encontrado.' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', (deadline as any).user_id)
    .maybeSingle()

  const userEmail = String((profile as any)?.email || '').trim()
  const targetEmail = forcedTo || userEmail

  console.log('📌 Deadline encontrado', {
    id: (deadline as any).id,
    user_id: (deadline as any).user_id,
    title: (deadline as any).title,
    deadline_date: (deadline as any).deadline_date,
    status: (deadline as any).status,
  })
  console.log('👤 Usuário', { id: (profile as any)?.id, email: userEmail, full_name: (profile as any)?.full_name })
  console.log('📨 E-mail alvo', { targetEmail })

  const send = await sendDeadlineAlertEmail({
    to: targetEmail,
    userName: (profile as any)?.full_name ?? null,
    deadline: {
      id: (deadline as any).id,
      title: (deadline as any).title,
      deadline_date: (deadline as any).deadline_date,
      process_id: (deadline as any).process_id ?? null,
    },
    daysRemaining: 0,
    severity: 'danger',
  })

  console.log('📬 Resposta Resend', send)

  if (!send.ok) {
    return NextResponse.json({ success: false, error: send.error }, { status: 502 })
  }

  return NextResponse.json({ success: true, resend_id: send.id })
}


