import { Resend } from 'resend'

export const RESEND_TEST_FROM = 'Alertas <onboarding@resend.dev>'

function getResendClient(): Resend {
  const key = (process.env.RESEND_API_KEY || '').trim()
  if (!key) throw new Error('RESEND_API_KEY não configurada no backend.')
  return new Resend(key)
}

/**
 * Envio mínimo de teste (isolado do fluxo de prazos) para validar Resend.
 * Obs: usa remetente padrão do Resend (`onboarding@resend.dev`) conforme checklist de debug.
 */
export async function sendTestEmail(to: string) {
  const resend = getResendClient()
  return await resend.emails.send({
    from: RESEND_TEST_FROM,
    to,
    subject: 'Teste Resend',
    html: '<b>Email funcionando</b>',
  })
}


