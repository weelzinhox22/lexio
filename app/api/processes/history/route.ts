import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = request.nextUrl.searchParams.get('limit') || '50'
    const filterType = request.nextUrl.searchParams.get('filter') || 'all' // all, today, week, unique

    let query = supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .limit(parseInt(limit))

    if (filterType === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      query = query.gte('searched_at', today.toISOString())
    } else if (filterType === 'week') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      query = query.gte('searched_at', sevenDaysAgo.toISOString())
    }

    const { data, error } = await query

    if (error) throw error

    // If unique filter, remove duplicates keeping only latest
    let result = data || []
    if (filterType === 'unique') {
      const seen = new Set<string>()
      result = result.filter((item) => {
        if (seen.has(item.process_number)) {
          return false
        }
        seen.add(item.process_number)
        return true
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching search history:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { process_number, tribunal, search_query, results_count } = body

    if (!process_number) {
      return NextResponse.json({ error: 'Missing process_number' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('search_history')
      .insert([
        {
          user_id: user.id,
          process_number,
          tribunal,
          search_query: search_query || process_number,
          results_count: results_count || 0,
          found_at: (results_count || 0) > 0,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error adding search history:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchId = request.nextUrl.searchParams.get('id')
    const clearAll = request.nextUrl.searchParams.get('clearAll') === 'true'

    if (clearAll) {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      return NextResponse.json({ success: true })
    } else if (searchId) {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', searchId)
        .eq('user_id', user.id)

      if (error) throw error
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Missing id or clearAll parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error deleting search history:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
