/**
 * Brevo (Sendinblue) Email Service
 * 
 * Server-only email sending via Brevo Transactional Email API (REST).
 * No SDK required - uses native fetch.
 */

export type SendEmailInput = {
  to: string
  subject: string
  html: string
}

export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string }

function getApiKey(): string {
  const key = (process.env.BREVO_API_KEY || '').trim()
  if (!key) {
    throw new Error('BREVO_API_KEY não configurada no backend.')
  }
  return key
}

function getFrom(): { email: string; name: string } {
  const email = (process.env.BREVO_FROM_EMAIL || '').trim()
  const name = (process.env.BREVO_FROM_NAME || 'Themixa').trim()

  if (!email) {
    throw new Error('BREVO_FROM_EMAIL não configurado no backend.')
  }

  return { email, name }
}

/**
 * Envia e-mail transacional via Brevo (API REST).
 * 
 * Endpoint: POST https://api.brevo.com/v3/smtp/email
 * Headers: api-key (minúsculas), Content-Type: application/json
 * 
 * IMPORTANTE:
 * - Header DEVE ser 'api-key' (não 'Authorization', não 'X-API-Key', não 'Bearer')
 * - API Key pode começar com 'xkeysib-' mas não é obrigatório
 * - Runtime DEVE ser 'nodejs', não 'edge'
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  try {
    const apiKey = getApiKey()
    const from = getFrom()

    // Logs de diagnóstico ANTES do fetch
    const keyType = typeof apiKey
    const keyLength = apiKey.length
    const keyPrefix = apiKey.substring(0, Math.min(10, keyLength))
    const keyStartsWithXkeysib = apiKey.startsWith('xkeysib-')

    console.log('🔍 Brevo sendEmail DEBUG (antes do fetch)', {
      endpoint: 'https://api.brevo.com/v3/smtp/email',
      keyType,
      keyLength,
      keyPrefix: keyPrefix + '...',
      keyStartsWithXkeysib,
      fromEmail: from.email,
      fromName: from.name,
      to: input.to,
      subject: input.subject,
    })

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          email: from.email,
          name: from.name,
        },
        to: [{ email: input.to }],
        subject: input.subject,
        htmlContent: input.html,
      }),
    })

    const responseText = await response.text().catch(() => '')
    let data: any = {}
    try {
      data = JSON.parse(responseText)
    } catch {
      // Se não for JSON, logar o texto
      console.error('❌ Brevo response não é JSON', { status: response.status, text: responseText.slice(0, 500) })
    }

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `Brevo retornou status ${response.status}`
      console.error('❌ Brevo sendEmail error', {
        status: response.status,
        statusText: response.statusText,
        error: errorMsg,
        responseBody: responseText.slice(0, 500),
        to: input.to,
      })
      return { ok: false, error: errorMsg }
    }

    const messageId = data?.messageId || ''
    console.log('✅ Brevo sendEmail OK', { messageId, to: input.to, from: from.email })
    return { ok: true, messageId }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('❌ Brevo sendEmail exception', { error: msg, stack: e instanceof Error ? e.stack : undefined, to: input.to })
    return { ok: false, error: msg }
  }
}

/**
 * Envio mínimo de teste (isolado do fluxo de prazos) para validar Brevo.
 */
export async function sendTestEmail(to: string): Promise<SendEmailResult> {
  const { testEmailTemplate } = await import('./templates/alerts')
  const { html, subject } = testEmailTemplate()

  return sendEmail({
    to,
    subject,
    html,
  })
}

