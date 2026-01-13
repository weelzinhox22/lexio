import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmailWithRetryAndFallback } from '@/lib/email/retry-with-fallback'
import { renderBaseEmail } from '@/lib/email/templates/base'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Cron para enviar alertas de audiências
 * Executa a cada hora e verifica audiências nos próximos 7 dias, 1 dia e no dia
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
  const oneDayLater = new Date(today)
  oneDayLater.setDate(oneDayLater.getDate() + 1)

  console.log(`\n📅 [AudienceAlerts Cron] Iniciando verificação de audiências`)
  console.log(`   └─ Data atual: ${now.toISOString()}`)

  // Buscar audiências agendadas
  const { data: audiences, error: audiencesError } = await supabase
    .from('audiences')
    .select(`
      id,
      user_id,
      title,
      audience_date,
      location,
      location_type,
      meeting_link,
      processes (
        process_number,
        title
      ),
      clients (
        name
      )
    `)
    .eq('status', 'scheduled')
    .gte('audience_date', today.toISOString())
    .lte('audience_date', sevenDaysLater.toISOString())

  if (audiencesError) {
    console.error('❌ Erro ao buscar audiências:', audiencesError)
    return NextResponse.json({ error: audiencesError.message }, { status: 500 })
  }

  if (!audiences || audiences.length === 0) {
    console.log('   └─ ⏭️  Nenhuma audiência encontrada para alertar')
    return NextResponse.json({ message: 'No audiences to alert', count: 0 })
  }

  console.log(`   └─ ✅ ${audiences.length} audiência(s) encontrada(s)`)

  // Buscar perfis e configurações de notificação
  const userIds = [...new Set(audiences.map(a => a.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)

  const { data: settingsRows } = await supabase
    .from('notification_settings')
    .select('user_id, email_enabled, email_override, email_fallback')
    .in('user_id', userIds)

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))
  const settingsMap = new Map((settingsRows || []).map((s: any) => [s.user_id, s]))

  let alertsSent = 0
  let alertsFailed = 0

  for (const audience of audiences) {
    const audienceDate = new Date(audience.audience_date)
    const daysUntil = Math.ceil((audienceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Alertar em: 7 dias antes, 1 dia antes, e no dia
    if (![7, 1, 0].includes(daysUntil)) {
      continue
    }

    const profile = profileMap.get(audience.user_id)
    const settings = settingsMap.get(audience.user_id)

    if (!profile || !settings?.email_enabled) {
      continue
    }

    const toEmail = (settings?.email_override || profile.email || '').trim()
    const fallbackEmail = (settings?.email_fallback || '').trim() || null

    if (!toEmail) {
      continue
    }

    // Verificar se já foi enviado (dedupe)
    const dedupeKey = `audience:${audience.id}:${daysUntil}`
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', audience.user_id)
      .eq('dedupe_key', dedupeKey)
      .limit(1)

    if (existing && existing.length > 0) {
      console.log(`   └─ 🧯 DEDUPE: Alerta já enviado para audiência ${audience.id} (${daysUntil} dias)`)
      continue
    }

    // Criar registro de notificação
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: audience.user_id,
        entity_type: 'audience',
        entity_id: audience.id,
        notification_type: daysUntil === 0 ? 'audience_today' : daysUntil === 1 ? 'audience_tomorrow' : 'audience_week',
        severity: daysUntil === 0 ? 'danger' : daysUntil === 1 ? 'warning' : 'info',
        title: daysUntil === 0 
          ? `Audiência hoje: ${audience.title}`
          : daysUntil === 1
          ? `Audiência amanhã: ${audience.title}`
          : `Audiência em 7 dias: ${audience.title}`,
        message: `Lembrete: ${audience.title}`,
        dedupe_key: dedupeKey,
        notification_status: 'pending',
        channel: 'email',
      })
      .select()
      .single()

    if (notifError || !notification) {
      console.error(`   └─ ❌ Erro ao criar notificação: ${notifError?.message}`)
      continue
    }

    // Preparar conteúdo do e-mail
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
    const processInfo = audience.processes 
      ? `${audience.processes.process_number} - ${audience.processes.title}`
      : 'Não vinculado a processo'
    const clientInfo = audience.clients ? `Cliente: ${audience.clients.name}` : ''
    const locationInfo = audience.location_type === 'virtual' && audience.meeting_link
      ? `Link: ${audience.meeting_link}`
      : audience.location || 'Local a confirmar'

    const dateStr = audienceDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const bodyHtml = `
      <p style="margin: 0 0 16px 0;">Olá ${profile.full_name || 'Advogado(a)'},</p>
      <p style="margin: 0 0 16px 0;">
        <strong>Lembrete de Audiência</strong>
      </p>
      <p style="margin: 0 0 16px 0;">
        <strong>${audience.title}</strong>
      </p>
      <p style="margin: 0 0 8px 0;"><strong>Data e Hora:</strong> ${dateStr}</p>
      <p style="margin: 0 0 8px 0;"><strong>Processo:</strong> ${processInfo}</p>
      ${clientInfo ? `<p style="margin: 0 0 8px 0;"><strong>${clientInfo}</strong></p>` : ''}
      <p style="margin: 0 0 8px 0;"><strong>Local:</strong> ${locationInfo}</p>
      <p style="margin: 16px 0 0 0;">
        <a href="${appUrl}/dashboard/audiences/${audience.id}" style="color: #2563eb; text-decoration: underline;">
          Ver detalhes da audiência
        </a>
      </p>
    `

    const html = renderBaseEmail({
      title: daysUntil === 0 
        ? 'Audiência Hoje'
        : daysUntil === 1
        ? 'Audiência Amanhã'
        : 'Audiência em 7 Dias',
      preheader: audience.title,
      body: bodyHtml,
    })

    const subject = `[Themixa] ${daysUntil === 0 ? 'Audiência HOJE' : daysUntil === 1 ? 'Audiência amanhã' : 'Audiência em 7 dias'}: ${audience.title}`

    // Enviar e-mail com retry e fallback
    const sendResult = await sendEmailWithRetryAndFallback({
      to: toEmail,
      fallbackEmail,
      subject,
      html,
      alertId: notification.id,
      userId: audience.user_id,
      deadlineId: null,
    })

    if (sendResult.ok) {
      await supabase
        .from('notifications')
        .update({
          notification_status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', notification.id)
      alertsSent++
      console.log(`   └─ ✅ Alerta enviado: ${audience.title} (${daysUntil} dias)`)
    } else {
      await supabase
        .from('notifications')
        .update({
          notification_status: 'failed',
          error_message: sendResult.error,
        })
        .eq('id', notification.id)
      alertsFailed++
      console.log(`   └─ ❌ Falha ao enviar: ${audience.title} (${daysUntil} dias)`)
    }
  }

  console.log(`\n📊 [AudienceAlerts Cron] Resumo:`)
  console.log(`   └─ ✅ Enviados: ${alertsSent}`)
  console.log(`   └─ ❌ Falhas: ${alertsFailed}`)

  return NextResponse.json({
    message: 'Audience alerts processed',
    sent: alertsSent,
    failed: alertsFailed,
  })
}

