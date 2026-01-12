import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  buildAlertPlan,
  computeAlertStatus,
  updateDeadlineAlertStatus,
} from '@/lib/deadlines/alert-engine'
import {
  buildDeadlineNotificationType,
  createEmailNotificationRecord,
  createInAppNotification,
} from '@/lib/notifications/notification-service'
import { sendDeadlineAlertEmail } from '@/lib/email/send-deadline-alert'
import { isEligibleForDeadlineEmail } from '@/lib/email/deadline-email-eligibility'

type NotificationSettingsRow = {
  user_id: string
  email_enabled: boolean
  alert_days: number[]
  email_override: string | null
}

/**
 * Cron diário: Deadline Alert Engine
 *
 * - Atualiza deadlines.alert_status (active/urgent/overdue/done)
 * - Dispara notificações in-app e email (se SMTP configurado)
 * - Registra histórico e evita duplicatas via dedupe_key
 *
 * Segurança:
 * - Protegido por CRON_SECRET
 * - Usa SUPABASE_SERVICE_ROLE_KEY para acessar dados de todos usuários
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('⏰ Cron executado', new Date().toISOString())

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

    const now = new Date()

    // Buscar deadlines ativos (não concluídos)
    const { data: deadlines, error: dlError } = await supabase
      .from('deadlines')
      .select('id, user_id, process_id, title, description, deadline_date, status, acknowledged_at, alert_status')
      .neq('status', 'completed')

    if (dlError) {
      console.error('[DeadlineAlerts Cron] Error fetching deadlines:', dlError)
      return NextResponse.json({ error: 'Failed to fetch deadlines' }, { status: 500 })
    }

    if (!deadlines || deadlines.length === 0) {
      return NextResponse.json({ success: true, checked_at: now.toISOString(), deadlines_checked: 0 })
    }

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
      const alertStatus = computeAlertStatus(d, now)

      if ((d.alert_status || null) !== alertStatus) {
        await updateDeadlineAlertStatus(supabase as any, d.id, d.user_id, alertStatus)
        statusUpdates++
      }

      const plans = buildAlertPlan(d, now)
      if (plans.length === 0) continue

      const profile = profileMap.get(d.user_id) as any | undefined
      const settings = settingsMap.get(d.user_id)

      const emailEnabled = settings?.email_enabled ?? true
      const alertDays = (settings?.alert_days?.length ? settings.alert_days : [7, 3, 1, 0]) as number[]
      const toEmail = (settings?.email_override || profile?.email || '').trim()
      const userName = profile?.full_name ?? null

      for (const plan of plans) {
        console.log('📅 Prazo', d.id, 'daysDiff:', plan.daysRemaining, 'rule:', plan.rule)

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

        // Email notification (Resend) — respeita settings do usuário e dedupe por deadline_id + days_remaining
        const eligibleForEmail = isEligibleForDeadlineEmail({
          emailEnabled,
          alertDays,
          daysRemaining: plan.daysRemaining,
          toEmail,
        })

        if (!eligibleForEmail) {
          console.log('⛔ Email skip (regra/consentimento)', {
            deadlineId: d.id,
            userId: d.user_id,
            toEmail: toEmail ? '[ok]' : '[vazio]',
            emailEnabled,
            alertDays,
            daysRemaining: plan.daysRemaining,
            rule: plan.rule,
            note: plan.daysRemaining < 0 ? 'OVERDUE não envia por padrão (evita spam)' : undefined,
          })
          emailSkipped++
          continue
        }

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
          console.log('🧯 Dedupe: alerta já registrado, não reenviar', {
            deadlineId: d.id,
            userId: d.user_id,
            daysRemaining: plan.daysRemaining,
            rule: plan.rule,
          })
          continue
        }

        console.log('📨 Enviando e-mail (Resend)', {
          notificationId: record.id,
          deadlineId: d.id,
          userId: d.user_id,
          toEmail,
          severity: plan.severity,
          daysRemaining: plan.daysRemaining,
          rule: plan.rule,
        })

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
          console.log('✅ Resend OK', { notificationId: record.id, resendId: send.id })
          await supabase
            .from('notifications')
            .update({ notification_status: 'sent', sent_at: new Date().toISOString(), error_message: null })
            .eq('id', record.id)
          emailSent++
        } else {
          console.log('❌ Resend FAIL', { notificationId: record.id, error: send.error })
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

    return NextResponse.json({
      success: true,
      checked_at: now.toISOString(),
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
    })
  } catch (error) {
    console.error('[DeadlineAlerts Cron] Error:', error)
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


