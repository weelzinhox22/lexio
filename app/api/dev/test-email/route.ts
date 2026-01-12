import { NextResponse } from 'next/server'
import { sendTestEmail } from '@/lib/email/resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/dev/test-email?to=email@destino.com
 * Teste isolado do Resend (mínimo) para provar se envio funciona.
 *
 * Regras:
 * - Em produção: bloqueia por padrão (403) a menos que ALLOW_DEV_ROUTES esteja habilitada.
 * - Usa process.env.RESEND_API_KEY (backend-only)
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_DEV_ROUTES) {
    return NextResponse.json({ error: 'Dev route disabled' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const to = (searchParams.get('to') || '').trim()

  if (!to) {
    return NextResponse.json({ error: 'Missing ?to=' }, { status: 400 })
  }

  console.log('🧪 /api/dev/test-email iniciado', { at: new Date().toISOString(), to })

  try {
    const result = await sendTestEmail(to)
    console.log('✅ Resend test-email response', result)
    return NextResponse.json({ success: true, to, resend: result })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.log('❌ Resend test-email error', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}


