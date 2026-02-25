export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_ROUTES !== '1') {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  return Response.json({ pong: true, env: process.env.NODE_ENV })
}
