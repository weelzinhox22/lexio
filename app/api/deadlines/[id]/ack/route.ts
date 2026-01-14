import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, hasSupabaseAuthCookies } from '@/lib/supabase/route-handler'

export const runtime = 'nodejs'

function attachSupabaseCookies(resp: NextResponse, cookieResponse: NextResponse) {
  cookieResponse.cookies.getAll().forEach((c) => resp.cookies.set(c.name, c.value, c))
  return resp
}

/**
 * POST /api/deadlines/[id]/ack
 * Marca "ciência" do advogado para um prazo (sem auto-dispensar alertas).
 */
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { supabase, cookieResponse } = createRouteHandlerClient(request)
  const hasAuthCookie = hasSupabaseAuthCookies(request)

  const { data, error: authError } = await supabase.auth.getUser()
  const user = data.user
  if (!user) {
    const status = hasAuthCookie ? 403 : 401
    const resp = NextResponse.json(
      { error: status === 401 ? 'Unauthorized' : 'Sessão inválida/expirada. Faça login novamente.' },
      { status, headers: { 'Cache-Control': 'no-store' } }
    )
    console.warn('[POST /api/deadlines/:id/ack] Auth failed', {
      status,
      hasAuthCookie,
      authError: authError?.message,
    })
    return attachSupabaseCookies(resp, cookieResponse)
  }

  const { id } = await ctx.params
  const now = new Date().toISOString()

  const { data: updated, error } = await supabase
    .from('deadlines')
    .update({ acknowledged_at: now, updated_at: now })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, acknowledged_at')
    .single()

  if (error || !updated) {
    const resp = NextResponse.json(
      { error: 'Prazo não encontrado.' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    )
    return attachSupabaseCookies(resp, cookieResponse)
  }

  const resp = NextResponse.json(
    { success: true, deadline: updated },
    { headers: { 'Cache-Control': 'no-store' } }
  )
  return attachSupabaseCookies(resp, cookieResponse)
}





