import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  buildAlertPlan,
  computeAlertStatus,
  updateDeadlineAlertStatus,
  daysUntilUTC,
} from '@/lib/deadlines/alert-engine'
import {
  buildDeadlineNotificationType,
  createEmailNotificationRecord,
  createInAppNotification,
} from '@/lib/notifications/notification-service'
import { sendDeadlineAlertEmail } from '@/lib/email/send-deadline-alert'
import { isEligibleForDeadlineEmail } from '@/lib/email/deadline-email-eligibility'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type NotificationSettingsRow = {
  user_id: string
  email_enabled: boolean
  alert_days: number[]
  email_override: string | null
}

/**
 * Valida autenticação do cron (à prova de erro).
 * 
 * Aceita:
 * - Authorization: Bearer <token>
 * - x-cron-secret: <token>
 * 
 * Em development: NÃO bloqueia (permite testes locais)
 * Em production: Auth OBRIGATÓRIO
 */
function validateCronAuth(request: Request): { valid: boolean; reason?: string } {
  const isDev = process.env.NODE_ENV === 'development'
  const expectedSecret = (process.env.CRON_SECRET || '').trim()

  // Em dev: permitir sem auth
  if (isDev) {
    if (!expectedSecret) {
      console.log('🔓 [DeadlineAlerts Cron] DEV MODE - CRON_SECRET não configurado, permitindo acesso')
      return { valid: true }
    }
  }

  // Em prod: auth obrigatório
  if (!expectedSecret) {
    console.error('❌ [DeadlineAlerts Cron] CRON_SECRET não configurado em produção')
    return { valid: false, reason: 'CRON_SECRET não configurado' }
  }

  // Tentar pegar token do header Authorization
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || ''
  const cronSecretHeader = request.headers.get('x-cron-secret') || request.headers.get('X-Cron-Secret') || ''

  // Normalizar: remover espaços, considerar Bearer <token> ou apenas <token>
  const authToken = authHeader
    .trim()
    .replace(/^bearer\s+/i, '')
    .trim()
  
  const secretToken = cronSecretHeader.trim()

  const receivedToken = authToken || secretToken
  const receivedTokenDisplay = receivedToken ? `${receivedToken.substring(0, 8)}...` : '[vazio]'

  // Log apenas em dev (não expor secret em logs de produção)
  if (isDev) {
    console.log('🔐 [DeadlineAlerts Cron] Validando auth:')
    console.log(`   └─ Authorization header: ${authHeader ? 'presente' : 'ausente'}`)
    console.log(`   └─ x-cron-secret header: ${cronSecretHeader ? 'presente' : 'ausente'}`)
    console.log(`   └─ Token recebido: ${receivedTokenDisplay}`)
    console.log(`   └─ Token esperado: ${expectedSecret.substring(0, 8)}...`)
  }

  // Comparação segura (case-sensitive)
  if (!receivedToken) {
    const reason = isDev ? 'Nenhum token fornecido (DEV: permitido)' : 'Nenhum token fornecido'
    if (isDev) {
      console.log(`🔓 [DeadlineAlerts Cron] ${reason}`)
      return { valid: true } // Em dev, permitir sem token
    }
    return { valid: false, reason }
  }

  // Comparação exata (sem trimming adicional, case-sensitive)
  const isValid = receivedToken === expectedSecret

  if (isValid) {
    if (isDev) {
      console.log('✅ [DeadlineAlerts Cron] Auth válido (token bateu)')
    }
    return { valid: true }
  }

  const reason = `Token inválido (recebido: ${receivedTokenDisplay}, esperado: ${expectedSecret.substring(0, 8)}...)`
  if (isDev) {
    console.warn(`⚠️ [DeadlineAlerts Cron] ${reason}`)
    // Em dev, ainda permitir se não tiver secret configurado
    if (!expectedSecret) {
      console.log('🔓 [DeadlineAlerts Cron] DEV MODE - Permitindo apesar de token inválido')
      return { valid: true }
    }
  }

  return { valid: false, reason }
}

/**
 * Cron diário: Deadline Alert Engine
 *
 * - Atualiza deadlines.alert_status (active/urgent/overdue/done)
 * - Dispara notificações in-app e email (via Brevo)
 * - Registra histórico e evita duplicatas via dedupe_key
 *
 * Segurança:
 * - Em dev: Auth opcional (permite testes locais)
 * - Em prod: Auth obrigatório (CRON_SECRET via Authorization ou x-cron-secret)
 * - Usa SUPABASE_SERVICE_ROLE_KEY para acessar dados de todos usuários
 * - Runtime: nodejs (obrigatório para Brevo API)
 */
export async function GET(request: Request) {
  const startTime = Date.now()
  const nowUTC = new Date()
  const nowISO = nowUTC.toISOString()

  try {
    // Validar autenticação
    const authResult = validateCronAuth(request)
    if (!authResult.valid) {
      console.error('[DeadlineAlerts Cron] ❌ UNAUTHORIZED:', authResult.reason)
      return NextResponse.json({ error: 'Unauthorized', reason: authResult.reason }, { status: 401 })
    }

    console.log('⏰ [DeadlineAlerts Cron] ============================================')
    console.log('⏰ [DeadlineAlerts Cron] INÍCIO DA EXECUÇÃO')
    console.log('⏰ [DeadlineAlerts Cron] Timestamp UTC:', nowISO)
    console.log('⏰ [DeadlineAlerts Cron] Ambiente:', process.env.NODE_ENV || 'unknown')
    console.log('⏰ [DeadlineAlerts Cron] User-Agent:', request.headers.get('user-agent') || 'N/A')
    console.log('⏰ [DeadlineAlerts Cron] ============================================')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl) {
      console.error('[DeadlineAlerts Cron] ❌ ENV VAR MISSING: NEXT_PUBLIC_SUPABASE_URL')
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SUPABASE_URL não configurada' },
        { status: 500 }
      )
    }
    
    if (!serviceKey) {
      console.error('[DeadlineAlerts Cron] ❌ ENV VAR MISSING: SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY não configurada. Configure no Vercel → Settings → Environment Variables' },
        { status: 500 }
      )
    }
    
    // Validar formato básico da Service Role Key (deve ser um JWT)
    if (!serviceKey.startsWith('eyJ')) {
      console.error('[DeadlineAlerts Cron] ❌ SERVICE KEY FORMATO INVÁLIDO')
      console.error('[DeadlineAlerts Cron] Service Key deve começar com "eyJ" (JWT)')
      console.error('[DeadlineAlerts Cron] Service Key recebida começa com:', serviceKey.substring(0, 10))
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY formato inválido. Deve ser um JWT válido começando com "eyJ"' },
        { status: 500 }
      )
    }

    console.log('🔐 [DeadlineAlerts Cron] Validando conexão Supabase...')
    console.log('🔐 [DeadlineAlerts Cron] Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NÃO CONFIGURADA')
    console.log('🔐 [DeadlineAlerts Cron] Service Key presente:', serviceKey ? `SIM (${serviceKey.substring(0, 20)}...)` : 'NÃO')
    console.log('🔐 [DeadlineAlerts Cron] Service Key formato:', serviceKey.startsWith('eyJ') ? 'JWT válido' : 'INVÁLIDO')

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const now = nowUTC

    // Testar conexão Supabase primeiro (query simples)
    console.log('🔐 [DeadlineAlerts Cron] Testando conexão Supabase...')
    const { data: testData, error: testError } = await supabase.from('profiles').select('count').limit(1)
    if (testError) {
      console.error('[DeadlineAlerts Cron] ❌ Erro ao testar conexão Supabase:')
      console.error('[DeadlineAlerts Cron] ❌ Erro code:', testError.code)
      console.error('[DeadlineAlerts Cron] ❌ Erro message:', testError.message)
      console.error('[DeadlineAlerts Cron] ❌ Erro details:', testError.details)
      console.error('[DeadlineAlerts Cron] ❌ Erro hint:', testError.hint)
      
      // Mensagem mais clara para erro de API key
      if (testError.message?.includes('Invalid API key') || testError.message?.includes('JWT')) {
        return NextResponse.json(
          { 
            error: 'SUPABASE_SERVICE_ROLE_KEY inválida',
            details: 'A Service Role Key configurada no Vercel está incorreta ou expirada. Verifique em: Vercel → Settings → Environment Variables → SUPABASE_SERVICE_ROLE_KEY',
            code: testError.code,
            hint: 'Obtenha a Service Role Key correta em: Supabase Dashboard → Settings → API → service_role key',
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Erro ao conectar ao Supabase',
          details: testError.message,
          code: testError.code,
          hint: testError.hint,
        },
        { status: 500 }
      )
    }
    
    console.log('✅ [DeadlineAlerts Cron] Conexão Supabase OK')

    // Buscar deadlines ativos (não concluídos)
    console.log('📋 [DeadlineAlerts Cron] Buscando deadlines ativos...')
    const { data: deadlines, error: dlError } = await supabase
      .from('deadlines')
      .select('id, user_id, process_id, title, description, deadline_date, status, acknowledged_at, alert_status')
      .neq('status', 'completed')

    if (dlError) {
      console.error('[DeadlineAlerts Cron] ❌ Erro ao buscar deadlines:')
      console.error('[DeadlineAlerts Cron] ❌ Erro code:', dlError.code)
      console.error('[DeadlineAlerts Cron] ❌ Erro message:', dlError.message)
      console.error('[DeadlineAlerts Cron] ❌ Erro details:', dlError.details)
      console.error('[DeadlineAlerts Cron] ❌ Erro hint:', dlError.hint)
      
      // Mensagem mais clara para erro de API key
      if (dlError.message?.includes('Invalid API key') || dlError.message?.includes('JWT')) {
        return NextResponse.json(
          { 
            error: 'SUPABASE_SERVICE_ROLE_KEY inválida',
            details: 'A Service Role Key configurada no Vercel está incorreta ou expirada. Verifique em: Vercel → Settings → Environment Variables → SUPABASE_SERVICE_ROLE_KEY',
            code: dlError.code,
            hint: 'Obtenha a Service Role Key correta em: Supabase Dashboard → Settings → API → service_role key',
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch deadlines',
          details: dlError.message,
          code: dlError.code,
          hint: dlError.hint,
        },
        { status: 500 }
      )
    }

    if (!deadlines || deadlines.length === 0) {
      console.log('📋 [DeadlineAlerts Cron] Nenhum deadline ativo encontrado')
      return NextResponse.json({ success: true, checked_at: nowISO, deadlines_checked: 0 })
    }

    console.log(`📋 [DeadlineAlerts Cron] Encontrados ${deadlines.length} deadline(s) ativo(s)`)

    const userIds = Array.from(new Set(deadlines.map((d: any) => d.user_id)))
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds)

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    const { data: settingsRows } = await supabase
      .from('notification_settings')
      .select('user_id, email_enabled, alert_days, email_override')
      .in('user_id', userIds)

    const settingsMap = new Map((settingsRows || []).map((s: any) => [s.user_id, s as NotificationSettingsRow]))

    let statusUpdates = 0
    let inAppCreated = 0
    let emailSent = 0
    let emailFailed = 0
    let emailSkipped = 0

    for (const d of deadlines as any[]) {
      const deadlineDate = new Date(d.deadline_date)
      const daysUntil = daysUntilUTC(d.deadline_date, now)

      console.log(`\n📅 [DeadlineAlerts Cron] Processando deadline: ${d.id}`)
      console.log(`   └─ Título: ${d.title}`)
      console.log(`   └─ Data do prazo (UTC): ${deadlineDate.toISOString()}`)
      console.log(`   └─ Dias até o prazo: ${daysUntil}`)
      console.log(`   └─ Status atual: ${d.status}`)
      console.log(`   └─ Alert status atual: ${d.alert_status || 'null'}`)

      const alertStatus = computeAlertStatus(d, now)

      if ((d.alert_status || null) !== alertStatus) {
        console.log(`   └─ ⚠️  Alert status mudou: ${d.alert_status || 'null'} → ${alertStatus}`)
        await updateDeadlineAlertStatus(supabase as any, d.id, d.user_id, alertStatus)
        statusUpdates++
      }

      const plans = buildAlertPlan(d, now)
      if (plans.length === 0) {
        console.log(`   └─ ⏭️  Sem planos de alerta (prazo muito distante ou concluído)`)
        continue
      }

      console.log(`   └─ ✅ ${plans.length} plano(s) de alerta gerado(s)`)

      const profile = profileMap.get(d.user_id) as any | undefined
      const settings = settingsMap.get(d.user_id)

      const emailEnabled = settings?.email_enabled ?? true
      const alertDays = (settings?.alert_days?.length ? settings.alert_days : [7, 3, 1, 0]) as number[]
      const toEmail = (settings?.email_override || profile?.email || '').trim()
      const userName = profile?.full_name ?? null

      console.log(`   └─ Usuário: ${userName || 'N/A'} (${d.user_id})`)
      console.log(`   └─ E-mail: ${toEmail || '[VAZIO]'}`)
      console.log(`   └─ E-mail habilitado: ${emailEnabled}`)
      console.log(`   └─ Dias configurados: [${alertDays.join(', ')}]`)

      for (const plan of plans) {
        console.log(`\n   📬 [Plano] ${plan.rule} (${plan.daysRemaining} dias restantes)`)

        const notificationType = buildDeadlineNotificationType(plan.rule)

        // In-app notification (dedup)
        const inApp = await createInAppNotification(supabase as any, {
          userId: plan.userId,
          processId: plan.processId,
          entityType: 'deadline',
          entityId: plan.deadlineId,
          notificationType,
          severity: plan.severity,
          title: plan.title,
          message: plan.message,
          dedupeKey: plan.dedupeKeyInApp,
          meta: {
            rule: plan.rule,
            days_remaining: plan.daysRemaining,
            deadline_date: d.deadline_date,
            acknowledged_at: d.acknowledged_at,
          },
        })
        if (inApp.created) inAppCreated++

        // Email notification (Brevo) — respeita settings do usuário e dedupe por deadline_id + days_remaining
        const eligibleForEmail = isEligibleForDeadlineEmail({
          emailEnabled,
          alertDays,
          daysRemaining: plan.daysRemaining,
          toEmail,
        })

        if (!eligibleForEmail) {
          const reason = !emailEnabled 
            ? 'email desabilitado nas configurações'
            : !toEmail
            ? 'e-mail de destino vazio'
            : !alertDays.includes(plan.daysRemaining)
            ? `diasRemaining (${plan.daysRemaining}) não está em alertDays [${alertDays.join(', ')}]`
            : plan.daysRemaining < 0
            ? 'OVERDUE não envia por padrão (evita spam)'
            : 'razão desconhecida'
          
          console.log(`      ⛔ Email SKIP: ${reason}`)
          emailSkipped++
          continue
        }

        console.log(`      ✅ Email ELIGÍVEL para envio`)

        // Claim record first (dedupe hard). If it already exists, skip sending.
        const record = await createEmailNotificationRecord(supabase as any, {
          userId: plan.userId,
          processId: plan.processId,
          deadlineId: plan.deadlineId,
          daysRemaining: plan.daysRemaining,
          entityType: 'deadline',
          entityId: plan.deadlineId,
          notificationType,
          severity: plan.severity,
          title: plan.title,
          message: plan.message,
          dedupeKey: plan.dedupeKeyEmail ?? plan.dedupeKeyInApp,
          notificationStatus: 'pending',
          meta: {
            rule: plan.rule,
            days_remaining: plan.daysRemaining,
            deadline_date: d.deadline_date,
            acknowledged_at: d.acknowledged_at,
            to: toEmail,
          },
        })

        if (!record.created || !record.id) {
          console.log(`      🧯 DEDUPE: Alerta já registrado (não reenviar)`)
          console.log(`         └─ dedupeKey: ${plan.dedupeKeyEmail || plan.dedupeKeyInApp}`)
          continue
        }

        console.log(`      📨 ENVIANDO E-MAIL via Brevo...`)
        console.log(`         └─ Notification ID: ${record.id}`)
        console.log(`         └─ Para: ${toEmail}`)
        console.log(`         └─ Assunto: [Themixa] Prazo ${plan.daysRemaining === 0 ? 'HOJE' : `em ${plan.daysRemaining} dias`} — ${d.title}`)
        console.log(`         └─ Severity: ${plan.severity}`)

        const send = await sendDeadlineAlertEmail({
          to: toEmail,
          userName,
          deadline: {
            id: plan.deadlineId,
            title: d.title,
            deadline_date: d.deadline_date,
            process_id: d.process_id,
          },
          daysRemaining: plan.daysRemaining,
          severity: plan.severity,
        })

        if (send.ok) {
          console.log(`      ✅ BREVO OK - E-mail enviado com sucesso`)
          console.log(`         └─ Brevo Message ID: ${send.id}`)
          await supabase
            .from('notifications')
            .update({ notification_status: 'sent', sent_at: new Date().toISOString(), error_message: null })
            .eq('id', record.id)
          emailSent++
        } else {
          console.log(`      ❌ BREVO FAIL - Erro ao enviar e-mail`)
          console.log(`         └─ Erro: ${send.error}`)
          // Para permitir retry no próximo cron sem spam, "liberamos" o dedupe hard
          await supabase
            .from('notifications')
            .update({
              notification_status: 'failed',
              error_message: send.error,
              deadline_id: null,
              days_remaining: null,
            })
            .eq('id', record.id)
          emailFailed++
        }
      }
    }

    const duration = Date.now() - startTime
    const summary = {
      success: true,
      checked_at: nowISO,
      execution_duration_ms: duration,
      deadlines_checked: deadlines.length,
      status_updates: statusUpdates,
      in_app_created: inAppCreated,
      email_sent: emailSent,
      email_failed: emailFailed,
      email_skipped: emailSkipped,
      notes: {
        consent_default_email_enabled: true,
        overdue_email_default: 'disabled',
      },
    }

    console.log('\n⏰ [DeadlineAlerts Cron] ============================================')
    console.log('⏰ [DeadlineAlerts Cron] RESUMO DA EXECUÇÃO')
    console.log('⏰ [DeadlineAlerts Cron]', JSON.stringify(summary, null, 2))
    console.log('⏰ [DeadlineAlerts Cron] ============================================')

    return NextResponse.json(summary)
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('\n❌ [DeadlineAlerts Cron] ============================================')
    console.error('❌ [DeadlineAlerts Cron] ERRO NA EXECUÇÃO')
    console.error('❌ [DeadlineAlerts Cron] Duration:', duration, 'ms')
    console.error('❌ [DeadlineAlerts Cron] Error:', error)
    if (error instanceof Error) {
      console.error('❌ [DeadlineAlerts Cron] Stack:', error.stack)
    }
    console.error('❌ [DeadlineAlerts Cron] ============================================')

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Permite execução manual (mesma lógica do GET), útil para testar com curl/insomnia.
export async function POST(request: Request) {
  return GET(request)
}
