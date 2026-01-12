import { Resend } from 'resend'

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

function getResendClient(): Resend {
  const key = (process.env.RESEND_API_KEY || '').trim()
  if (!key) {
    throw new Error('RESEND_API_KEY não configurada no backend.')
  }
  return new Resend(key)
}

function getFrom(): string {
  const from = (process.env.RESEND_FROM || '').trim()
  if (!from) throw new Error('RESEND_FROM não configurado no backend.')
  return from
}

function getAppUrl(): string {
  const url = (process.env.NEXT_PUBLIC_APP_URL || '').trim()
  if (!url) return 'http://localhost:3000'
  return url.replace(/\/$/, '')
}

function subjectFor(daysRemaining: number, title: string): string {
  if (daysRemaining < 0) return `[Themixa] Prazo vencido — ${title}`
  if (daysRemaining === 0) return `[Themixa] Prazo HOJE — ${title}`
  if (daysRemaining === 1) return `[Themixa] Prazo amanhã — ${title}`
  return `[Themixa] Prazo em ${daysRemaining} dias — ${title}`
}

function labelFor(daysRemaining: number): string {
  if (daysRemaining < 0) return 'VENCIDO'
  if (daysRemaining === 0) return 'HOJE'
  if (daysRemaining === 1) return 'AMANHÃ'
  return `${daysRemaining} dias`
}

function colorFor(severity: EmailSeverity): string {
  if (severity === 'danger') return '#b91c1c'
  if (severity === 'warning') return '#b45309'
  return '#1d4ed8'
}

function renderHtml(input: SendDeadlineAlertInput): string {
  const appUrl = getAppUrl()
  const due = new Date(input.deadline.deadline_date).toLocaleString('pt-BR')
  const label = labelFor(input.daysRemaining)
  const color = colorFor(input.severity)
  const userName = input.userName || 'Doutor(a)'
  const processLine = input.deadline.process_number
    ? `${input.deadline.process_number}${input.deadline.process_title ? ` — ${input.deadline.process_title}` : ''}`
    : '—'

  const ctaUrl = `${appUrl}/dashboard/deadlines/${input.deadline.id}`

  return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; background:#f8fafc; padding:24px;">
    <div style="max-width: 640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
      <div style="padding:18px 20px; border-bottom:1px solid #e2e8f0; display:flex; align-items:center; justify-content:space-between;">
        <div style="font-weight:700; color:#0f172a;">Themixa</div>
        <div style="font-size:12px; color:#64748b;">Alerta de prazo</div>
      </div>

      <div style="padding:20px;">
        <div style="font-size:14px; color:#0f172a; margin-bottom:12px;">Olá, ${escapeHtml(userName)}.</div>

        <div style="padding:14px 14px; border:1px solid #e2e8f0; border-radius:10px; background:#f8fafc;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
            <div>
              <div style="font-weight:700; color:#0f172a; margin-bottom:4px;">${escapeHtml(input.deadline.title)}</div>
              <div style="font-size:12px; color:#475569;">Processo: ${escapeHtml(processLine)}</div>
              <div style="font-size:12px; color:#475569;">Data do prazo: ${escapeHtml(due)}</div>
            </div>
            <div style="min-width:120px; text-align:center; border-radius:10px; padding:10px 12px; background:#fff; border:1px solid #e2e8f0;">
              <div style="font-size:11px; color:#64748b;">Dias restantes</div>
              <div style="font-weight:800; font-size:18px; color:${color}; margin-top:2px;">${escapeHtml(label)}</div>
            </div>
          </div>
        </div>

        <div style="margin-top:16px; font-size:13px; color:#334155;">
          Este prazo foi cadastrado por você no Themixa.
        </div>

        <div style="margin-top:18px;">
          <a href="${ctaUrl}" style="display:inline-block; background:${color}; color:#fff; text-decoration:none; padding:12px 16px; border-radius:10px; font-weight:700;">
            Ver prazo no Themixa
          </a>
        </div>

        <div style="margin-top:18px; font-size:12px; color:#64748b;">
          <strong>Disclaimer:</strong> Este alerta é auxiliar e não substitui a conferência nos autos.
        </div>
      </div>

      <div style="padding:14px 20px; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8;">
        Você está recebendo este e-mail porque habilitou alertas de prazo no Themixa.
      </div>
    </div>
  </div>
  `
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function sendDeadlineAlertEmail(input: SendDeadlineAlertInput): Promise<SendDeadlineAlertResult> {
  try {
    const resend = getResendClient()
    const from = getFrom()
    const subject = subjectFor(input.daysRemaining, input.deadline.title)

    const res = await resend.emails.send({
      from,
      to: [input.to],
      subject,
      html: renderHtml(input),
    })

    const id = (res as any)?.data?.id
    if (!id) return { ok: false, error: 'Resend: resposta sem id' }
    return { ok: true, id }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: msg }
  }
}


