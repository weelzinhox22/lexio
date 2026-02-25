export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/dev/env-check
 * Endpoint de diagnóstico para validar env vars no runtime.
 * Protegido em produção.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_ROUTES !== '1') {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json({
    NODE_ENV: process.env.NODE_ENV,
    BREVO_API_KEY_DEFINED: Boolean(process.env.BREVO_API_KEY),
    BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL ?? null,
    BREVO_FROM_NAME: process.env.BREVO_FROM_NAME ?? null,
    SUPABASE_URL_DEFINED: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    STRIPE_KEY_DEFINED: Boolean(process.env.STRIPE_SECRET_KEY),
  })
}
