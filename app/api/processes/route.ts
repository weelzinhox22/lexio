import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, hasSupabaseAuthCookies } from '@/lib/supabase/route-handler'
import {
  DataJudInputError,
  DataJudRateLimitError,
  DataJudUpstreamError,
  getProcessByNumber,
} from '@/lib/datajud/getProcessByNumber'
import { consumeUserSearch } from '@/lib/rate-limit/user-search-rate-limit'

export const runtime = 'nodejs'

function attachSupabaseCookies(resp: NextResponse, cookieResponse: NextResponse) {
  // Copia quaisquer cookies que o Supabase client pediu para setar (refresh/rotation de sessão)
  cookieResponse.cookies.getAll().forEach((c) => resp.cookies.set(c.name, c.value, c))
  return resp
}

/**
 * GET /api/processes?processNumber=00008323520184013202&tribunal=TRF1
 *
 * Server-side only:
 * - Keeps the DataJud API key off the frontend
 * - Requires Supabase-authenticated user (basic abuse prevention for MVP)
 */
export async function GET(request: NextRequest) {
  try {
    const hasAuthCookie = hasSupabaseAuthCookies(request)
    const { supabase, cookieResponse } = createRouteHandlerClient(request)

    // Importante: getUser() valida o JWT no Supabase e é o método recomendado para autenticação server-side.
    const { data, error: authError } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      // Diferenciar:
      // - 401: sem cookie de auth (usuário não autenticado)
      // - 403: cookie existe, mas sessão inválida/expirada
      const status = hasAuthCookie ? 403 : 401
      const message =
        status === 401 ? 'Unauthorized' : 'Sessão inválida/expirada. Faça login novamente.'

      console.warn('[GET /api/processes] Auth failed', {
        status,
        hasAuthCookie,
        authError: authError?.message,
      })

      const resp = NextResponse.json(
        { error: message },
        { status, headers: { 'Cache-Control': 'no-store' } }
      )

      // Propagar cookies eventualmente atualizados pelo Supabase client
      return attachSupabaseCookies(resp, cookieResponse)
    }

    // Per-user rate limit (MVP): max 5 searches/hour.
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

    const { searchParams } = new URL(request.url)
    const processNumber = searchParams.get('processNumber') || ''
    const tribunal = searchParams.get('tribunal') || ''
    const uf = searchParams.get('uf') || ''

    const effectiveTribunal = tribunal.trim() || (uf.trim() ? `TJ${uf.trim().toUpperCase()}` : '')

    if (!processNumber.trim() || !effectiveTribunal) {
      const resp = NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes: processNumber e (tribunal ou uf)' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
      return attachSupabaseCookies(resp, cookieResponse)
    }

    const processes = await getProcessByNumber({ processNumber, tribunal: effectiveTribunal })

    // Only basic metadata (no sensitive fields).
    const resp = NextResponse.json(
      processes,
      {
        headers: {
          // Do not allow browser/proxy caching; server-side cache is handled in the service layer.
          'Cache-Control': 'no-store',
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(Math.floor(rl.resetAt / 1000)),
        },
      }
    )
    return attachSupabaseCookies(resp, cookieResponse)
  } catch (error) {
    if (error instanceof DataJudInputError) {
      const resp = NextResponse.json(
        { error: error.message },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
      return resp
    }

    if (error instanceof DataJudRateLimitError) {
      const resp = NextResponse.json(
        {
          error: error.message || 'Rate limit do DataJud excedido. Tente novamente em instantes.',
          retryAfterSeconds: error.retryAfterSeconds,
        },
        { status: 429, headers: { 'Cache-Control': 'no-store' } }
      )
      return resp
    }

    if (error instanceof DataJudUpstreamError) {
      // Erro do DataJud → 503 (com logs e contexto)
      console.error('[DataJud Upstream Error]', {
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
      return resp
    }

    const msg = error instanceof Error ? error.message : 'Erro interno'
    console.error('[GET /api/processes] Error:', error)
    return NextResponse.json(
      { error: msg },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}


