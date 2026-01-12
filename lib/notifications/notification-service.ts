import type { SupabaseClient } from '@supabase/supabase-js'
import type { DeadlineAlertRule, DeadlineAlertSeverity } from '@/lib/deadlines/alert-engine'

export type NotificationChannel = 'in_app' | 'email'

export type CreateNotificationParams = {
  userId: string
  processId: string | null
  deadlineId?: string | null
  daysRemaining?: number | null
  entityType: 'deadline'
  entityId: string
  channel: NotificationChannel
  notificationType: string
  severity: DeadlineAlertSeverity
  title: string
  message: string
  dedupeKey: string
  notificationStatus: 'pending' | 'sent' | 'failed' | 'read'
  sentAt?: string | null
  errorMessage?: string | null
  meta?: Record<string, unknown>
}

export async function createInAppNotification(
  supabase: SupabaseClient,
  params: Omit<CreateNotificationParams, 'channel' | 'notificationStatus'> & { notificationStatus?: 'pending' | 'read' }
): Promise<{ created: boolean }> {
  // Dedup is enforced by DB unique index on (user_id, channel, dedupe_key)
  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId,
    notification_type: params.notificationType,
    title: params.title,
    message: params.message,
    entity_type: params.entityType,
    entity_id: params.entityId,
    process_id: params.processId,
    channel: 'in_app',
    notification_status: params.notificationStatus ?? 'pending',
    severity: params.severity,
    dedupe_key: params.dedupeKey,
    meta: params.meta ?? null,
  })

  if (!error) return { created: true }

  // Postgres unique violation code
  // supabase-js error codes vary, but message includes 'duplicate key value'
  if (String((error as any).code) === '23505' || String(error.message).includes('duplicate key')) {
    return { created: false }
  }

  throw error
}

export async function createEmailNotificationRecord(
  supabase: SupabaseClient,
  params: Omit<CreateNotificationParams, 'channel'> & { channel?: 'email' }
): Promise<{ created: boolean; id?: string }> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
    user_id: params.userId,
    notification_type: params.notificationType,
    title: params.title,
    message: params.message,
    entity_type: params.entityType,
    entity_id: params.entityId,
    process_id: params.processId,
    deadline_id: params.deadlineId ?? null,
    days_remaining: params.daysRemaining ?? null,
    channel: 'email',
    notification_status: params.notificationStatus,
    severity: params.severity,
    dedupe_key: params.dedupeKey,
    sent_at: params.sentAt ?? null,
    error_message: params.errorMessage ?? null,
    meta: params.meta ?? null,
  })
    .select('id')
    .single()

  if (!error) return { created: true, id: (data as any)?.id }
  if (String((error as any).code) === '23505' || String(error.message).includes('duplicate key')) {
    return { created: false }
  }
  throw error
}

export function buildDeadlineNotificationType(rule: DeadlineAlertRule): string {
  switch (rule) {
    case 'DUE_IN_7_DAYS':
      return 'deadline_due_7d'
    case 'DUE_IN_3_DAYS':
      return 'deadline_due_3d'
    case 'DUE_IN_1_DAY':
      return 'deadline_due_1d'
    case 'DUE_TODAY':
      return 'deadline_due_today'
    case 'OVERDUE':
      return 'deadline_overdue'
  }
}


