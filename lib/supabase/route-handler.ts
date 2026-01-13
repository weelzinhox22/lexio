import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Supabase Route Handler client (App Router)
 *
 * - Lê tokens/sessão via cookies do NextRequest
 * - Permite refresh de sessão (set-cookie) ao retornar a resposta
 *
 * Observação:
 * - Isto é equivalente ao padrão do `createRouteHandlerClient`, mas sem depender
 *   de outra lib. Mantemos o contrato explícito pro projeto.
 */
export function createRouteHandlerClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env vars não configuradas (NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY).')
  }

  let cookieResponse = NextResponse.next()

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Mantém request cookies atualizados (padrão usado no middleware já existente)
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        cookiesToSet.forEach(({ name, value, options }) => cookieResponse.cookies.set(name, value, options))
      },
    },
  })

  return { supabase, cookieResponse }
}

export function hasSupabaseAuthCookies(request: NextRequest): boolean {
  // Cookies do Supabase SSR costumam começar com sb- e conter -auth-token (podendo ser chunked).
  return request.cookies.getAll().some((c) => /^sb-.*-auth-token/i.test(c.name))
}




