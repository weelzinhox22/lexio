/**
 * API Route: GET /api/templates/[id]/versions
 * 
 * Lista versões de um template
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, hasSupabaseAuthCookies } from '@/lib/supabase/route-handler'

function attachSupabaseCookies(resp: NextResponse, cookieResponse: NextResponse) {
  cookieResponse.cookies.getAll().forEach((c) => resp.cookies.set(c.name, c.value, c))
  return resp
}

/**
 * GET /api/templates/[id]/versions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    return attachSupabaseCookies(resp, cookieResponse)
  }

  try {
    const { id } = await params

    // Buscar versões do template
    const { data: versions, error } = await supabase
      .from('document_template_versions')
      .select('*')
      .eq('template_id', id)
      .order('version_number', { ascending: false })

    if (error) {
      throw error
    }

    const resp = NextResponse.json(
      { versions: versions || [] },
      { headers: { 'Cache-Control': 'no-store' } }
    )

    return attachSupabaseCookies(resp, cookieResponse)
  } catch (error) {
    console.error('[GET /api/templates/[id]/versions] Erro:', error)

    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar versões'
    const resp = NextResponse.json({ error: errorMessage }, { status: 500 })

    return attachSupabaseCookies(resp, cookieResponse)
  }
}

