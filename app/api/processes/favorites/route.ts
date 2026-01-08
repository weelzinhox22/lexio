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

    const processNumber = request.nextUrl.searchParams.get('process_number')

    if (!processNumber) {
      return NextResponse.json({ error: 'Missing process_number' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('favorite_processes')
      .select('*')
      .eq('user_id', user.id)
      .eq('process_number', processNumber)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ isFavorited: !!data, favorite: data || null })
  } catch (error) {
    console.error('Error checking favorite:', error)
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
    const { process_number, tribunal, classe, assunto, notes } = body

    if (!process_number) {
      return NextResponse.json({ error: 'Missing process_number' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('favorite_processes')
      .upsert(
        {
          user_id: user.id,
          process_number,
          tribunal,
          classe,
          assunto,
          notes: notes || '',
        },
        {
          onConflict: 'user_id,process_number',
        }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating favorite:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { process_number, notes } = body

    if (!process_number) {
      return NextResponse.json({ error: 'Missing process_number' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('favorite_processes')
      .update({ notes })
      .eq('user_id', user.id)
      .eq('process_number', process_number)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating favorite notes:', error)
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

    const processNumber = request.nextUrl.searchParams.get('process_number')

    if (!processNumber) {
      return NextResponse.json({ error: 'Missing process_number' }, { status: 400 })
    }

    const { error } = await supabase
      .from('favorite_processes')
      .delete()
      .eq('user_id', user.id)
      .eq('process_number', processNumber)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting favorite:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
