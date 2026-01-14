import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, hasSupabaseAuthCookies } from '@/lib/supabase/route-handler'
import { createClient } from '@supabase/supabase-js'

function attachSupabaseCookies(resp: NextResponse, cookieResponse: NextResponse) {
  cookieResponse.cookies.getAll().forEach((c) => resp.cookies.set(c.name, c.value, c))
  return resp
}

/**
 * POST /api/templates/[id]/duplicate
 * Cria uma cópia personalizada de um template do sistema
 */
export async function POST(
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

    // Buscar template original
    const { data: originalTemplate, error: fetchError } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !originalTemplate) {
      throw new Error('Template não encontrado')
    }

    // Verificar se o usuário já tem uma cópia deste template
    const { data: existingCopy } = await supabase
      .from('document_templates')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', originalTemplate.name)
      .eq('category', originalTemplate.category)
      .single()

    if (existingCopy) {
      // Já existe uma cópia, retornar o ID da cópia existente
      const resp = NextResponse.json(
        {
          success: true,
          template: { id: existingCopy.id },
          alreadyExists: true,
        },
        { headers: { 'Cache-Control': 'no-store' } }
      )
      return attachSupabaseCookies(resp, cookieResponse)
    }

    // Criar cópia personalizada (is_system = false, user_id = user.id)
    const { data: duplicatedTemplate, error: duplicateError } = await supabase
      .from('document_templates')
      .insert({
        user_id: user.id,
        name: originalTemplate.name,
        category: originalTemplate.category,
        subcategory: originalTemplate.subcategory,
        description: originalTemplate.description,
        content: originalTemplate.content,
        placeholders: originalTemplate.placeholders,
        is_system: false, // Cópia personalizada, não é do sistema
      })
      .select()
      .single()

    if (duplicateError) {
      throw duplicateError
    }

    const resp = NextResponse.json(
      {
        success: true,
        template: duplicatedTemplate,
        alreadyExists: false,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )

    return attachSupabaseCookies(resp, cookieResponse)
  } catch (error) {
    console.error('[POST /api/templates/[id]/duplicate] Erro:', error)
    const resp = NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao duplicar template' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
    return attachSupabaseCookies(resp, cookieResponse)
  }
}

