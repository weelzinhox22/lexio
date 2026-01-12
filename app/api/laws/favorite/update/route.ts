import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { law_url, notes } = body

    if (!law_url) {
      return NextResponse.json(
        { error: 'URL da lei não fornecida' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('favorite_laws')
      .update({ notes: notes || null })
      .eq('user_id', user.id)
      .eq('law_url', law_url)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro ao atualizar notas:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar notas' },
      { status: 500 }
    )
  }
}









