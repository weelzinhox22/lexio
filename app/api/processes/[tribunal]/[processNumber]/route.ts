import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, hasSupabaseAuthCookies } from '@/lib/supabase/route-handler'
import { consumeUserSearch } from '@/lib/rate-limit/user-search-rate-limit'
import {
  DataJudInputError,
  DataJudRateLimitError,
  DataJudUpstreamError,
  getProcessDetailsByNumber,
} from '@/lib/datajud/process-by-number'

export const runtime = 'nodejs'

function attachSupabaseCookies(resp: NextResponse, cookieResponse: NextResponse) {
  cookieResponse.cookies.getAll().forEach((c) => resp.cookies.set(c.name, c.value, c))
  return resp
}

/**
 * GET /api/processes/[tribunal]/[processNumber]
 *
 * Exemplos:
 * - /api/processes/TRF1/00008323520184013202
 * - /api/processes/TJBA/0001234-56.2023.8.05.0001
 *
 * Segurança:
 * - valida sessão Supabase via cookies
 * - chama DataJud no backend (APIKey em env)
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ tribunal: string; processNumber: string }> }
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
    console.warn('[GET /api/processes/:tribunal/:processNumber] Auth failed', {
      status,
      hasAuthCookie,
      authError: authError?.message,
    })
    return attachSupabaseCookies(resp, cookieResponse)
  }

  // Rate limit por usuário (reuso do mesmo mecanismo do /api/processes)
  const rl = consumeUserSearch(user.id)
  if (!rl.allowed) {
    const resp = NextResponse.json(
      {
        error: 'Limite de buscas excedido. Tente novamente mais tarde.',
        limit: rl.limit,
        remaining: rl.remaining,
        resetAt: new Date(rl.resetAt).toISOString(),
      },
      {
        status: 429,
        headers: {
          'Cache-Control': 'no-store',
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(Math.floor(rl.resetAt / 1000)),
        },
      }
    )
    return attachSupabaseCookies(resp, cookieResponse)
  }

  const { tribunal, processNumber } = await ctx.params

  try {
    const details = await getProcessDetailsByNumber({ tribunal, processNumber })
    if (!details) {
      const resp = NextResponse.json(
        { error: 'Processo não encontrado.' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      )
      return attachSupabaseCookies(resp, cookieResponse)
    }

    const resp = NextResponse.json(details, {
      headers: {
        'Cache-Control': 'no-store',
        'X-RateLimit-Limit': String(rl.limit),
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(Math.floor(rl.resetAt / 1000)),
      },
    })
    return attachSupabaseCookies(resp, cookieResponse)
  } catch (error) {
    if (error instanceof DataJudInputError) {
      const resp = NextResponse.json(
        { error: error.message },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
      return attachSupabaseCookies(resp, cookieResponse)
    }

    if (error instanceof DataJudRateLimitError) {
      const resp = NextResponse.json(
        {
          error: error.message,
          retryAfterSeconds: error.retryAfterSeconds,
        },
        { status: 429, headers: { 'Cache-Control': 'no-store' } }
      )
      return attachSupabaseCookies(resp, cookieResponse)
    }

    if (error instanceof DataJudUpstreamError) {
      console.error('[DataJud Upstream Error - details]', {
        status: error.status,
        endpoint: error.endpoint,
        body: error.responseBody,
        message: error.message,
      })
      const resp = NextResponse.json(
        {
          error: 'O serviço do DataJud está indisponível no momento. Tente novamente mais tarde.',
          upstreamStatus: error.status,
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
      return attachSupabaseCookies(resp, cookieResponse)
    }

    const msg = error instanceof Error ? error.message : 'Erro interno'
    console.error('[GET /api/processes/:tribunal/:processNumber] Error:', error)
    const resp = NextResponse.json({ error: msg }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
    return attachSupabaseCookies(resp, cookieResponse)
  }
}


