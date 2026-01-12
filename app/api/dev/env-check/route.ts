export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/dev/env-check
 * Endpoint de diagnóstico para validar env vars no runtime (Vercel).
 * - Não exige auth
 * - Não bloqueia por NODE_ENV
 * - Não expõe BREVO_API_KEY (apenas boolean)
 */
export async function GET() {
  return Response.json({
    NODE_ENV: process.env.NODE_ENV,
    ALLOW_DEV_ROUTES: process.env.ALLOW_DEV_ROUTES ?? null,
    BREVO_API_KEY_DEFINED: Boolean(process.env.BREVO_API_KEY),
    BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL ?? null,
    BREVO_FROM_NAME: process.env.BREVO_FROM_NAME ?? null,
  })
}


