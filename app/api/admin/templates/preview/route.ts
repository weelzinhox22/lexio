/**
 * API Route: POST /api/admin/templates/preview
 * 
 * Gera preview de template sem salvar no banco
 * Apenas para admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, hasSupabaseAuthCookies } from '@/lib/supabase/route-handler'
import { generateDocumentTemplate } from '@/lib/ai/groq'
import { isAdmin } from '@/lib/utils/admin'

function attachSupabaseCookies(resp: NextResponse, cookieResponse: NextResponse) {
  cookieResponse.cookies.getAll().forEach((c) => resp.cookies.set(c.name, c.value, c))
  return resp
}

/**
 * POST /api/admin/templates/preview
 * 
 * Gera preview de template usando Groq (NÃO salva)
 */
export async function POST(request: NextRequest) {
  const { supabase, cookieResponse } = createRouteHandlerClient(request)
  const hasAuthCookie = hasSupabaseAuthCookies(request)

  // Autenticação
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

  // Verificar se é admin
  if (!isAdmin(user.id, user.email)) {
    console.warn('[POST /api/admin/templates/preview] Acesso negado - usuário não é admin', {
      userId: user.id,
      email: user.email,
    })
    const resp = NextResponse.json(
      { error: 'Acesso negado. Apenas administradores podem gerar templates.' },
      { status: 403 }
    )
    return attachSupabaseCookies(resp, cookieResponse)
  }

  try {
    const body = await request.json()
    const { type, category, subcategory, context, model } = body

    // Validação
    if (!type || !category) {
      const resp = NextResponse.json(
        { error: 'Parâmetros obrigatórios: type, category' },
        { status: 400 }
      )
      return attachSupabaseCookies(resp, cookieResponse)
    }

    console.log('[POST /api/admin/templates/preview] Gerando preview...', {
      type,
      category,
      subcategory,
      adminId: user.id,
    })

    // Gerar template usando Groq (NÃO salva)
    const generated = await generateDocumentTemplate(
      {
        type,
        category,
        subcategory,
        context,
      },
      { model }
    )

    const resp = NextResponse.json(
      {
        success: true,
        content: generated.content,
        placeholders: generated.placeholders,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )

    return attachSupabaseCookies(resp, cookieResponse)
  } catch (error) {
    console.error('[POST /api/admin/templates/preview] Erro:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Erro ao gerar preview'
    const resp = NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )

    return attachSupabaseCookies(resp, cookieResponse)
  }
}

