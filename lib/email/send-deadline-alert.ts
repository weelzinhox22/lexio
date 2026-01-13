import { sendEmail } from './brevo'
import { deadlineAlertEmail, testEmailTemplate } from './templates/alerts'

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
  isTestEmail?: boolean
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
  
  // Se for e-mail de teste, usar template específico
  if (input.isTestEmail) {
    const { html, subject } = testEmailTemplate()
    
    const result = await sendEmail({
      to: input.to,
      subject: '✅ Alertas ativados com sucesso',
      html: html.replace(
        'Este é um e-mail de teste do sistema de notificações do Themixa.',
        `Parabéns! Você cadastrou seu primeiro prazo no Themixa.<br><br>O sistema está operacional e você receberá alertas automáticos por e-mail quando seus prazos estiverem se aproximando (7, 3, 1 dia e no dia do prazo).<br><br>Seu prazo cadastrado: <strong>${input.deadline.title}</strong><br>Data: ${new Date(input.deadline.deadline_date).toLocaleDateString('pt-BR')}`
      ),
    })
    
    return result
  }
  
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


