import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/jusbrasil/publications
 * Busca publicações do Jusbrasil do usuário
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const publicationType = searchParams.get('type')
    const processNumber = searchParams.get('process')
    const diaryName = searchParams.get('diary')
    const searchedName = searchParams.get('searched_name')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    let query = supabase
      .from('jusbrasil_publications')
      .select('*')
      .eq('user_id', user.id)
      .order('publication_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (publicationType) {
      query = query.eq('publication_type', publicationType)
    }

    if (processNumber) {
      query = query.ilike('process_number', `%${processNumber}%`)
    }

    if (diaryName) {
      query = query.ilike('diary_name', `%${diaryName}%`)
    }

    if (searchedName) {
      query = query.ilike('searched_name', `%${searchedName}%`)
    }

    if (dateFrom) {
      query = query.gte('publication_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('publication_date', dateTo)
    }

    const { data: publications, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ publications: publications || [] })
  } catch (error) {
    console.error('[Jusbrasil Publications Error]:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar publicações' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/jusbrasil/publications
 * Atualiza status de uma publicação (tratada, descartada)
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { publicationId, status, notes } = await request.json()

    if (!publicationId || !status) {
      return NextResponse.json(
        { error: 'Publication ID and status are required' },
        { status: 400 }
      )
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'treated') {
      updateData.treated_at = new Date().toISOString()
      updateData.treated_by = user.id
    } else if (status === 'discarded') {
      updateData.discarded_at = new Date().toISOString()
    }

    if (notes) {
      updateData.notes = notes
    }

    const { data, error } = await supabase
      .from('jusbrasil_publications')
      .update(updateData)
      .eq('id', publicationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ publication: data })
  } catch (error) {
    console.error('[Jusbrasil Update Publication Error]:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar publicação' },
      { status: 500 }
    )
  }
}










