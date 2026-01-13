/**
 * API Route: POST /api/admin/templates/generate
 * 
 * Gera templates de documentos jurídicos usando Groq AI
 * 
 * IMPORTANTE:
 * - Apenas para admin/system
 * - NÃO deve ser usado no fluxo normal do usuário
 * - Usado apenas para gerar templates-base e bootstrap do sistema
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, hasSupabaseAuthCookies } from '@/lib/supabase/route-handler'
import { generateDocumentTemplate } from '@/lib/ai/groq'
import { createClient } from '@supabase/supabase-js'

// Lista de admin IDs e e-mails (configurar via env)
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .filter(Boolean)
  .map((e) => e.trim().toLowerCase())

/**
 * Verifica se o usuário é admin
 */
function isAdmin(userId: string, userEmail: string | undefined): boolean {
  const email = userEmail?.toLowerCase() || ''
  return (
    ADMIN_USER_IDS.includes(userId) ||
    ADMIN_EMAILS.includes(email) ||
    email.endsWith('@themixa.com')
  )
}

function attachSupabaseCookies(resp: NextResponse, cookieResponse: NextResponse) {
  cookieResponse.cookies.getAll().forEach((c) => resp.cookies.set(c.name, c.value, c))
  return resp
}

/**
 * POST /api/admin/templates/generate
 * 
 * Gera um template usando Groq e salva no Supabase
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
    console.warn('[POST /api/admin/templates/generate] Acesso negado - usuário não é admin', {
      userId: user.id,
      email: user.email,
    })
    const resp = NextResponse.json({ error: 'Acesso negado. Apenas administradores podem gerar templates.' }, { status: 403 })
    return attachSupabaseCookies(resp, cookieResponse)
  }

  try {
    const body = await request.json()
    const { type, category, subcategory, context, name, description, model } = body

    // Validação
    if (!type || !category) {
      const resp = NextResponse.json(
        { error: 'Parâmetros obrigatórios: type, category' },
        { status: 400 }
      )
      return attachSupabaseCookies(resp, cookieResponse)
    }

    console.log('[POST /api/admin/templates/generate] Gerando template...', {
      type,
      category,
      subcategory,
      adminId: user.id,
    })

    // Gerar template usando Groq
    const generated = await generateDocumentTemplate(
      {
        type,
        category,
        subcategory,
        context,
      },
      { model }
    )

    // Salvar no Supabase usando Service Role Key (para contornar RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Supabase credentials não configuradas')
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Inserir template no banco
    const templateData = {
      user_id: null, // Templates do sistema não têm user_id
      name: name || `${type} - ${category}`,
      category,
      subcategory: subcategory || null,
      description: description || `Template gerado por IA para ${category}`,
      content: generated.content,
      placeholders: generated.placeholders,
      is_system: true, // Templates gerados por IA são do sistema
    }

    const { data: insertedTemplate, error: insertError } = await adminClient
      .from('document_templates')
      .insert(templateData)
      .select()
      .single()

    if (insertError) {
      console.error('[POST /api/admin/templates/generate] Erro ao salvar template:', insertError)
      throw insertError
    }

    console.log('[POST /api/admin/templates/generate] Template gerado e salvo com sucesso', {
      templateId: insertedTemplate.id,
    })

    const resp = NextResponse.json(
      {
        success: true,
        template: insertedTemplate,
        generated: {
          content: generated.content,
          placeholders: generated.placeholders,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )

    return attachSupabaseCookies(resp, cookieResponse)
  } catch (error) {
    console.error('[POST /api/admin/templates/generate] Erro:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Erro ao gerar template'
    const resp = NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )

    return attachSupabaseCookies(resp, cookieResponse)
  }
}

