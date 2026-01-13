import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  buildAlertPlan,
  computeAlertStatus,
  daysUntilUTC,
} from '@/lib/deadlines/alert-engine'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/dev/debug-deadline-cron?deadlineId=xxx
 * 
 * Modo DEBUG: Simula o fluxo completo do cron para um deadline específico.
 * Útil para testar sem esperar o cron rodar.
 * 
 * Segurança:
 * - Apenas em dev OU se ALLOW_DEV_ROUTES estiver habilitada
 * - Não requer CRON_SECRET (facilita testes locais)
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_DEV_ROUTES) {
    return NextResponse.json({ error: 'Dev route disabled' }, { status: 403 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Supabase env vars não configuradas.' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { searchParams } = new URL(request.url)
  const deadlineId = searchParams.get('deadlineId')?.trim()

  const now = new Date()
  const nowISO = now.toISOString()

  console.log('🔍 [DEBUG Deadline Cron] ============================================')
  console.log('🔍 [DEBUG Deadline Cron] Modo DEBUG - Simulação do cron')
  console.log('🔍 [DEBUG Deadline Cron] Timestamp UTC:', nowISO)
  console.log('🔍 [DEBUG Deadline Cron] Deadline ID:', deadlineId || 'N/A (buscará o primeiro)')
  console.log('🔍 [DEBUG Deadline Cron] ============================================')

  try {
    // Buscar deadline
    let deadlineQuery = supabase
      .from('deadlines')
      .select('id, user_id, process_id, title, description, deadline_date, status, acknowledged_at, alert_status')
      .neq('status', 'completed')

    if (deadlineId) {
      deadlineQuery = deadlineQuery.eq('id', deadlineId)
    }

    const { data: deadlines, error: dlError } = await deadlineQuery.limit(deadlineId ? 1 : 10)

    if (dlError) {
      console.error('🔍 [DEBUG] Erro ao buscar deadline:', dlError)
      return NextResponse.json({ error: dlError.message }, { status: 500 })
    }

    if (!deadlines || deadlines.length === 0) {
      return NextResponse.json({
        error: deadlineId ? 'Deadline não encontrado' : 'Nenhum deadline ativo encontrado',
      }, { status: 404 })
    }

    const results = []

    for (const d of deadlines as any[]) {
      const deadlineDate = new Date(d.deadline_date)
      const daysUntil = daysUntilUTC(d.deadline_date, now)
      const alertStatus = computeAlertStatus(d, now)
      const plans = buildAlertPlan(d, now)

      // Buscar settings
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('email_enabled, alert_days, email_override')
        .eq('user_id', d.user_id)
        .maybeSingle()

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', d.user_id)
        .maybeSingle()

      const emailEnabled = settings?.email_enabled ?? true
      const alertDays = (settings?.alert_days?.length ? settings.alert_days : [7, 3, 1, 0]) as number[]
      const toEmail = (settings?.email_override || profile?.email || '').trim()

      const analysis = {
        deadline: {
          id: d.id,
          title: d.title,
          deadline_date: d.deadline_date,
          deadline_date_utc: deadlineDate.toISOString(),
          status: d.status,
          alert_status: d.alert_status,
        },
        calculation: {
          now_utc: nowISO,
          days_until: daysUntil,
          computed_alert_status: alertStatus,
        },
        plans: plans.map((p) => ({
          rule: p.rule,
          days_remaining: p.daysRemaining,
          severity: p.severity,
          dedupe_key_email: p.dedupeKeyEmail,
          dedupe_key_inapp: p.dedupeKeyInApp,
        })),
        user_settings: {
          email_enabled: emailEnabled,
          alert_days: alertDays,
          email_override: settings?.email_override || null,
        },
        user_profile: {
          email: profile?.email || null,
          full_name: profile?.full_name || null,
        },
        email_analysis: {
          target_email: toEmail || null,
          would_send_email: plans.some((p) => {
            if (!emailEnabled) return false
            if (!toEmail) return false
            if (!alertDays.includes(p.daysRemaining)) return false
            if (p.daysRemaining < 0) return false
            return true
          }),
          eligible_plans: plans.filter((p) => {
            if (!emailEnabled) return false
            if (!toEmail) return false
            if (!alertDays.includes(p.daysRemaining)) return false
            if (p.daysRemaining < 0) return false
            return true
          }).map((p) => ({
            rule: p.rule,
            days_remaining: p.daysRemaining,
            reason_eligible: 'Todas as condições atendidas',
          })),
          skipped_plans: plans
            .filter((p) => {
              if (!emailEnabled) return { plan: p, reason: 'email desabilitado' }
              if (!toEmail) return { plan: p, reason: 'e-mail vazio' }
              if (!alertDays.includes(p.daysRemaining))
                return { plan: p, reason: `diasRemaining (${p.daysRemaining}) não está em alertDays` }
              if (p.daysRemaining < 0) return { plan: p, reason: 'OVERDUE não envia' }
              return null
            })
            .map(({ plan, reason }: any) => ({
              rule: plan.rule,
              days_remaining: plan.daysRemaining,
              reason_skipped: reason,
            })),
        },
      }

      results.push(analysis)
    }

    return NextResponse.json({
      debug_mode: true,
      timestamp_utc: nowISO,
      deadlines_analyzed: results.length,
      results,
    })
  } catch (error) {
    console.error('🔍 [DEBUG] Erro:', error)
    return NextResponse.json(
      {
        error: 'Internal error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}


