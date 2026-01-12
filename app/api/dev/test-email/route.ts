import { NextResponse } from 'next/server'
import { sendTestEmail } from '@/lib/email/brevo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/dev/test-email?to=email@destino.com
 * Teste isolado do Brevo (mínimo) para provar se envio funciona.
 *
 * Regras:
 * - Em produção: bloqueia por padrão (403) a menos que ALLOW_DEV_ROUTES esteja habilitada.
 * - Usa process.env.BREVO_API_KEY (backend-only)
 */
export async function GET(req: Request) {
  if (process.env.ALLOW_DEV_ROUTES !== '1') {
    return NextResponse.json({ error: 'Dev route disabled' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const to = (searchParams.get('to') || '').trim()

  if (!to) {
    return NextResponse.json({ error: 'Missing ?to=' }, { status: 400 })
  }

  console.log('🧪 /api/dev/test-email iniciado', { at: new Date().toISOString(), to, provider: 'brevo' })

  try {
    const fromEmail = process.env.BREVO_FROM_EMAIL || ''
    console.log('📨 Brevo test-email send', { from: fromEmail, to })
    const result = await sendTestEmail(to)
    
    if (result.ok) {
      console.log('✅ Brevo test-email response', { messageId: result.messageId, to, template: 'test' })
      return NextResponse.json({ success: true, to, provider: 'brevo', template: 'test', brevo: { messageId: result.messageId } })
    } else {
      console.log('❌ Brevo test-email error', { error: result.error, to })
      return NextResponse.json({ error: result.error, provider: 'brevo' }, { status: 502 })
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.log('❌ Brevo test-email exception', { message: msg, to })
    return NextResponse.json({ error: msg, provider: 'brevo' }, { status: 502 })
  }
}


