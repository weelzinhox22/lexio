import type { SupabaseClient } from '@supabase/supabase-js'

export type DeadlineAlertSeverity = 'info' | 'warning' | 'danger'

export type DeadlineAlertRule =
  | 'DUE_IN_7_DAYS'
  | 'DUE_IN_3_DAYS'
  | 'DUE_IN_1_DAY'
  | 'DUE_TODAY'
  | 'OVERDUE'

export type DeadlineRow = {
  id: string
  user_id: string
  process_id: string | null
  title: string
  description: string | null
  deadline_date: string
  status: string
  acknowledged_at: string | null
  alert_status: string | null
}

export type ProfileRow = {
  id: string
  full_name: string | null
  email: string
}

export type AlertPlan = {
  deadlineId: string
  userId: string
  processId: string | null
  rule: DeadlineAlertRule
  severity: DeadlineAlertSeverity
  daysRemaining: number
  title: string
  message: string
  dedupeKeyInApp: string
  dedupeKeyEmail: string | null
  shouldOpenModal: boolean
  persistent: boolean
}

export function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0))
}

export function daysUntilUTC(deadlineIso: string, now: Date): number {
  const deadline = new Date(deadlineIso)
  const a = startOfDayUTC(now).getTime()
  const b = startOfDayUTC(deadline).getTime()
  return Math.round((b - a) / (24 * 60 * 60 * 1000))
}

export function computeAlertStatus(deadline: DeadlineRow, now: Date): 'done' | 'overdue' | 'urgent' | 'active' {
  if (deadline.status === 'completed') return 'done'
  const d = daysUntilUTC(deadline.deadline_date, now)
  if (d < 0) return 'overdue'
  if (d <= 2) return 'urgent'
  return 'active'
}

export function buildAlertPlan(deadline: DeadlineRow, now: Date): AlertPlan[] {
  // Only for not-done deadlines
  if (deadline.status === 'completed') return []

  const d = daysUntilUTC(deadline.deadline_date, now)

  // Nothing to alert for far deadlines (but status should still be updated)
  const rule: DeadlineAlertRule | null =
    d === 7 ? 'DUE_IN_7_DAYS' :
    d === 3 ? 'DUE_IN_3_DAYS' :
    d === 1 ? 'DUE_IN_1_DAY' :
    d === 0 ? 'DUE_TODAY' :
    d < 0 ? 'OVERDUE' :
    null

  if (!rule) return []

  const severity: DeadlineAlertSeverity =
    rule === 'DUE_IN_7_DAYS' ? 'info' :
    rule === 'DUE_IN_3_DAYS' ? 'warning' :
    'danger'

  const baseTitle =
    rule === 'DUE_IN_7_DAYS' ? 'Prazo se aproximando (7 dias)' :
    rule === 'DUE_IN_3_DAYS' ? 'Prazo se aproximando (3 dias)' :
    rule === 'DUE_IN_1_DAY' ? 'Prazo amanhã' :
    rule === 'DUE_TODAY' ? 'Prazo vence hoje' :
    'Prazo vencido'

  const disclaimer = 'Alerta auxiliar — confira o prazo no teor da publicação/andamento.'

  const message =
    rule === 'OVERDUE'
      ? `⚠️ ${deadline.title} está vencido. ${disclaimer}`
      : `⚠️ ${deadline.title}. ${disclaimer}`

  // Dedupe strategy:
  // - One-shot rules: unique per deadline + rule + due-date (YYYY-MM-DD)
  // - Overdue: in-app persistent (single key), email daily (key includes today)
  const dueDateKey = startOfDayUTC(new Date(deadline.deadline_date)).toISOString().slice(0, 10)
  const todayKey = startOfDayUTC(now).toISOString().slice(0, 10)

  const dedupeKeyInApp =
    rule === 'OVERDUE'
      ? `deadline:${deadline.id}:OVERDUE`
      : `deadline:${deadline.id}:${rule}:${dueDateKey}`

  const dedupeKeyEmail =
    rule === 'OVERDUE'
      ? `deadline:${deadline.id}:OVERDUE:${todayKey}`
      : `deadline:${deadline.id}:${rule}:${dueDateKey}`

  return [
    {
      deadlineId: deadline.id,
      userId: deadline.user_id,
      processId: deadline.process_id,
      rule,
      severity,
      daysRemaining: d,
      title: baseTitle,
      message,
      dedupeKeyInApp,
      dedupeKeyEmail,
      shouldOpenModal: rule === 'DUE_TODAY' || rule === 'OVERDUE',
      persistent: rule === 'OVERDUE',
    },
  ]
}

export async function updateDeadlineAlertStatus(
  supabase: SupabaseClient,
  deadlineId: string,
  userId: string,
  alertStatus: 'done' | 'overdue' | 'urgent' | 'active'
) {
  // Engine-managed field; keep workflow status untouched.
  await supabase
    .from('deadlines')
    .update({ alert_status: alertStatus, updated_at: new Date().toISOString() })
    .eq('id', deadlineId)
    .eq('user_id', userId)
}




