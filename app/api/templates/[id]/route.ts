/**
 * API Route: GET /api/templates/[id] e PUT /api/templates/[id]
 * 
 * Busca e atualiza templates (com versionamento)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, hasSupabaseAuthCookies } from '@/lib/supabase/route-handler'
import { createClient } from '@supabase/supabase-js'

function attachSupabaseCookies(resp: NextResponse, cookieResponse: NextResponse) {
  cookieResponse.cookies.getAll().forEach((c) => resp.cookies.set(c.name, c.value, c))
  return resp
}

/**
 * GET /api/templates/[id]
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

    // Buscar template
    const { data: template, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    if (!template) {
      const resp = NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })
      return attachSupabaseCookies(resp, cookieResponse)
    }

    const resp = NextResponse.json({ template }, { headers: { 'Cache-Control': 'no-store' } })
    return attachSupabaseCookies(resp, cookieResponse)
  } catch (error) {
    console.error('[GET /api/templates/[id]] Erro:', error)

    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar template'
    const resp = NextResponse.json({ error: errorMessage }, { status: 500 })

    return attachSupabaseCookies(resp, cookieResponse)
  }
}

/**
 * PUT /api/templates/[id]
 * Atualiza template e cria nova versão
 */
export async function PUT(
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
    const body = await request.json()
    const { name, category, subcategory, description, content, placeholders } = body

    // Buscar template atual
    const { data: currentTemplate, error: fetchError } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentTemplate) {
      throw new Error('Template não encontrado')
    }

    // Verificar permissão (dono ou admin)
    const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean)
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean).map((e) => e.trim().toLowerCase())
    const userEmail = user.email?.toLowerCase() || ''
    const isAdmin = ADMIN_USER_IDS.includes(user.id) || ADMIN_EMAILS.includes(userEmail) || userEmail.endsWith('@themixa.com')

    if (currentTemplate.user_id !== user.id && !isAdmin && currentTemplate.is_system) {
      const resp = NextResponse.json(
        { error: 'Sem permissão para editar este template' },
        { status: 403 }
      )
      return attachSupabaseCookies(resp, cookieResponse)
    }

    // Usar Service Role para criar versão (contorna RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Supabase credentials não configuradas')
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Buscar próxima versão
    const { data: versions } = await adminClient
      .from('document_template_versions')
      .select('version_number')
      .eq('template_id', id)
      .order('version_number', { ascending: false })
      .limit(1)

    const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1

    // Criar nova versão (salvar versão anterior)
    if (currentTemplate.content !== content) {
      await adminClient.from('document_template_versions').insert({
        template_id: id,
        version_number: nextVersion - 1,
        content: currentTemplate.content,
        placeholders: currentTemplate.placeholders || [],
        created_by: user.id,
      })
    }

    // Atualizar template
    const updateData: any = {
      name: name || currentTemplate.name,
      category: category || currentTemplate.category,
      subcategory: subcategory !== undefined ? subcategory : currentTemplate.subcategory,
      description: description !== undefined ? description : currentTemplate.description,
      content: content || currentTemplate.content,
      placeholders: placeholders || currentTemplate.placeholders || [],
      updated_at: new Date().toISOString(),
    }

    const { data: updatedTemplate, error: updateError } = await supabase
      .from('document_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    const resp = NextResponse.json(
      {
        success: true,
        template: updatedTemplate,
        versionCreated: currentTemplate.content !== content,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )

    return attachSupabaseCookies(resp, cookieResponse)
  } catch (error) {
    console.error('[PUT /api/templates/[id]] Erro:', error)

    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar template'
    const resp = NextResponse.json({ error: errorMessage }, { status: 500 })

    return attachSupabaseCookies(resp, cookieResponse)
  }
}

