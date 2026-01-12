import { sendEmail } from './brevo'
import { deadlineAlertEmail } from './templates/alerts'

export type EmailSeverity = 'info' | 'warning' | 'danger'

export type SendDeadlineAlertInput = {
  to: string
  userName: string | null
  deadline: {
    id: string
    title: string
    deadline_date: string
    process_id: string | null
    process_number?: string | null
    process_title?: string | null
  }
  daysRemaining: number
  severity: EmailSeverity
}

export type SendDeadlineAlertResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

function getAppUrl(): string {
  const url = (process.env.NEXT_PUBLIC_APP_URL || '').trim()
  if (!url) return 'http://localhost:3000'
  return url.replace(/\/$/, '')
}

export async function sendDeadlineAlertEmail(input: SendDeadlineAlertInput): Promise<SendDeadlineAlertResult> {
  const appUrl = getAppUrl()
  const processNumber = input.deadline.process_number || '—'
  const link = `${appUrl}/dashboard/deadlines/${input.deadline.id}`

  const { html, subject } = deadlineAlertEmail({
    processNumber,
    deadlineTitle: input.deadline.title,
    daysRemaining: input.daysRemaining,
    dueDate: input.deadline.deadline_date,
    link,
  })

  const result = await sendEmail({
    to: input.to,
    subject,
    html,
  })

  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  return { ok: true, id: result.messageId }
}


