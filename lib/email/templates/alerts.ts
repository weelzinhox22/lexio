/**
 * Templates de E-mail - Alertas
 * 
 * Templates específicos para diferentes tipos de notificação.
 */

import { renderBaseEmail, EmailTemplateProps } from './base'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDaysLabel(daysRemaining: number): string {
  if (daysRemaining < 0) return 'VENCIDO'
  if (daysRemaining === 0) return 'HOJE'
  if (daysRemaining === 1) return 'AMANHÃ'
  return `${daysRemaining} dias`
}

function getSeverity(daysRemaining: number): 'info' | 'warning' | 'danger' {
  if (daysRemaining < 0) return 'danger'
  if (daysRemaining === 0) return 'danger'
  if (daysRemaining === 1) return 'warning'
  return 'info'
}

function getSubject(daysRemaining: number, processNumber: string): string {
  const label = getDaysLabel(daysRemaining)
  if (daysRemaining < 0) {
    return `[Themixa] Prazo vencido — ${processNumber}`
  }
  if (daysRemaining === 0) {
    return `[Themixa] Prazo HOJE — ${processNumber}`
  }
  if (daysRemaining === 1) {
    return `[Themixa] Prazo amanhã — ${processNumber}`
  }
  return `[Themixa] Prazo em ${daysRemaining} dias — ${processNumber}`
}

/**
 * Template de e-mail para alerta de prazo processual.
 */
export function deadlineAlertEmail(data: {
  processNumber: string
  deadlineTitle: string
  daysRemaining: number
  dueDate: string
  link: string
}): { html: string; subject: string } {
  const severity = getSeverity(data.daysRemaining)
  const label = getDaysLabel(data.daysRemaining)
  const formattedDate = formatDate(data.dueDate)
  const subject = getSubject(data.daysRemaining, data.processNumber)

  const bodyHtml = `
    <p style="margin: 0 0 24px 0;">Olá,</p>
    
    <div style="background-color: ${severity === 'danger' ? '#fef2f2' : severity === 'warning' ? '#fffbeb' : '#eff6ff'}; border-left: 4px solid ${severity === 'danger' ? '#dc2626' : severity === 'warning' ? '#d97706' : '#2563eb'}; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td>
            <div style="font-weight: bold; font-size: 18px; color: #0f172a; margin-bottom: 12px;">
              ${escapeHtml(data.deadlineTitle)}
            </div>
            <div style="font-size: 14px; color: #475569; margin-bottom: 8px;">
              <strong>Processo:</strong> ${escapeHtml(data.processNumber)}
            </div>
            <div style="font-size: 14px; color: #475569; margin-bottom: 12px;">
              <strong>Data do prazo:</strong> ${escapeHtml(formattedDate)}
            </div>
            <div style="display: inline-block; background-color: #ffffff; padding: 8px 16px; border-radius: 6px; border: 1px solid ${severity === 'danger' ? '#dc2626' : severity === 'warning' ? '#d97706' : '#2563eb'};">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Dias restantes</div>
              <div style="font-size: 24px; font-weight: bold; color: ${severity === 'danger' ? '#dc2626' : severity === 'warning' ? '#d97706' : '#2563eb'};">
                ${escapeHtml(label)}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 16px 0;">Este prazo foi cadastrado por você no Themixa.</p>
    <p style="margin: 0;">Confira os detalhes e tome as providências necessárias.</p>
  `

  const html = renderBaseEmail({
    title: `Alerta de Prazo — ${label}`,
    preheader: `Prazo processual: ${data.processNumber} — ${label}`,
    body: bodyHtml,
    ctaLabel: 'Ver prazo no Themixa',
    ctaUrl: data.link,
    severity,
  })

  return { html, subject }
}

/**
 * Template de e-mail de teste.
 */
export function testEmailTemplate(): { html: string; subject: string } {
  const subject = '[Themixa] Teste de e-mail realizado com sucesso'

  const bodyHtml = `
    <p style="margin: 0 0 16px 0;">Olá,</p>
    <p style="margin: 0 0 16px 0;">Este é um e-mail de teste do sistema de notificações do Themixa.</p>
    <p style="margin: 0;">Se você recebeu este e-mail, significa que a integração está funcionando corretamente.</p>
  `

  const html = renderBaseEmail({
    title: 'Teste de E-mail',
    preheader: 'Integração de e-mail do Themixa funcionando',
    body: bodyHtml,
  })

  return { html, subject }
}

