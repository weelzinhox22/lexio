/**
 * API Route: POST /api/templates/[id]/versions/restore
 * 
 * Restaura uma versão antiga (cria nova versão com conteúdo antigo)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, hasSupabaseAuthCookies } from '@/lib/supabase/route-handler'
import { createClient } from '@supabase/supabase-js'

function attachSupabaseCookies(resp: NextResponse, cookieResponse: NextResponse) {
  cookieResponse.cookies.getAll().forEach((c) => resp.cookies.set(c.name, c.value, c))
  return resp
}

/**
 * POST /api/templates/[id]/versions/restore
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
    const body = await request.json()
    const { version_number } = body

    if (!version_number) {
      const resp = NextResponse.json({ error: 'version_number é obrigatório' }, { status: 400 })
      return attachSupabaseCookies(resp, cookieResponse)
    }

    // Buscar versão
    const { data: version, error: versionError } = await supabase
      .from('document_template_versions')
      .select('*')
      .eq('template_id', id)
      .eq('version_number', version_number)
      .single()

    if (versionError || !version) {
      const resp = NextResponse.json({ error: 'Versão não encontrada' }, { status: 404 })
      return attachSupabaseCookies(resp, cookieResponse)
    }

    // Verificar permissão
    const { data: template } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (!template) {
      const resp = NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })
      return attachSupabaseCookies(resp, cookieResponse)
    }

    const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean)
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean).map((e) => e.trim().toLowerCase())
    const userEmail = user.email?.toLowerCase() || ''
    const isAdmin = ADMIN_USER_IDS.includes(user.id) || ADMIN_EMAILS.includes(userEmail) || userEmail.endsWith('@themixa.com')

    if (template.user_id !== user.id && !isAdmin && template.is_system) {
      const resp = NextResponse.json(
        { error: 'Sem permissão para restaurar versão' },
        { status: 403 }
      )
      return attachSupabaseCookies(resp, cookieResponse)
    }

    // Usar Service Role para criar versão
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

    // Salvar versão atual antes de restaurar
    await adminClient.from('document_template_versions').insert({
      template_id: id,
      version_number: nextVersion - 1,
      content: template.content,
      placeholders: template.placeholders || [],
      created_by: user.id,
    })

    // Restaurar conteúdo da versão antiga
    const { data: restoredTemplate, error: updateError } = await supabase
      .from('document_templates')
      .update({
        content: version.content,
        placeholders: version.placeholders,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    const resp = NextResponse.json(
      {
        success: true,
        template: restoredTemplate,
        restoredFromVersion: version_number,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )

    return attachSupabaseCookies(resp, cookieResponse)
  } catch (error) {
    console.error('[POST /api/templates/[id]/versions/restore] Erro:', error)

    const errorMessage = error instanceof Error ? error.message : 'Erro ao restaurar versão'
    const resp = NextResponse.json({ error: errorMessage }, { status: 500 })

    return attachSupabaseCookies(resp, cookieResponse)
  }
}

