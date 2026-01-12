export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/dev/env-check
 * Endpoint de diagnóstico para validar env vars no runtime (Vercel).
 * - Não exige auth
 * - Não bloqueia por NODE_ENV
 * - Não expõe RESEND_API_KEY (apenas boolean)
 */
export async function GET() {
  return Response.json({
    NODE_ENV: process.env.NODE_ENV,
    ALLOW_DEV_ROUTES: process.env.ALLOW_DEV_ROUTES ?? null,
    RESEND_API_KEY_DEFINED: Boolean(process.env.RESEND_API_KEY),
    RESEND_FROM: process.env.RESEND_FROM ?? null,
  })
}


