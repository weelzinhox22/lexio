import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { law_name, law_number, law_url, law_category, notes } = body

    if (!law_name || !law_number || !law_url || !law_category) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('favorite_laws')
      .select('id')
      .eq('user_id', user.id)
      .eq('law_url', law_url)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Lei já está nos favoritos' },
        { status: 400 }
      )
    }

    // Adicionar aos favoritos
    const { data, error } = await supabase
      .from('favorite_laws')
      .insert({
        user_id: user.id,
        law_name,
        law_number,
        law_url,
        law_category,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro ao favoritar lei:', error)
    return NextResponse.json(
      { error: 'Erro ao favoritar lei' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const law_url = searchParams.get('law_url')

    if (!law_url) {
      return NextResponse.json(
        { error: 'URL da lei não fornecida' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('favorite_laws')
      .delete()
      .eq('user_id', user.id)
      .eq('law_url', law_url)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover favorito:', error)
    return NextResponse.json(
      { error: 'Erro ao remover favorito' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const law_url = searchParams.get('law_url')

    if (law_url) {
      // Verificar se uma lei específica está favoritada
      const { data, error } = await supabase
        .from('favorite_laws')
        .select('*')
        .eq('user_id', user.id)
        .eq('law_url', law_url)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return NextResponse.json({ isFavorite: !!data, favorite: data })
    }

    // Retornar todos os favoritos
    const { data, error } = await supabase
      .from('favorite_laws')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ favorites: data || [] })
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar favoritos' },
      { status: 500 }
    )
  }
}









