import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchQuery = `%${query}%`

    // Buscar em processos
    const { data: processes } = await supabase
      .from('processes')
      .select('id, title, process_number')
      .eq('user_id', user.id)
      .or(`title.ilike.${searchQuery},process_number.ilike.${searchQuery}`)
      .limit(5)

    // Buscar em contatos/clientes
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('user_id', user.id)
      .or(`name.ilike.${searchQuery},email.ilike.${searchQuery}`)
      .limit(5)

    // Buscar em tarefas/deadlines
    const { data: deadlines } = await supabase
      .from('deadlines')
      .select('id, title, deadline_date')
      .eq('user_id', user.id)
      .ilike('title', searchQuery)
      .limit(5)

    // Buscar em publicações
    const { data: publications } = await supabase
      .from('jusbrasil_publications')
      .select('id, process_title, process_number')
      .eq('user_id', user.id)
      .or(`process_title.ilike.${searchQuery},process_number.ilike.${searchQuery}`)
      .limit(5)

    // Formatar resultados
    const results = [
      ...(processes || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        subtitle: p.process_number,
        type: 'process' as const,
        href: `/dashboard/processes/${p.id}`,
      })),
      ...(clients || []).map((c: any) => ({
        id: c.id,
        title: c.name,
        subtitle: c.email,
        type: 'contact' as const,
        href: `/dashboard/clients/${c.id}`,
      })),
      ...(deadlines || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        subtitle: new Date(d.deadline_date).toLocaleDateString('pt-BR'),
        type: 'task' as const,
        href: `/dashboard/deadlines/${d.id}`,
      })),
      ...(publications || []).map((p: any) => ({
        id: p.id,
        title: p.process_title,
        subtitle: p.process_number,
        type: 'publication' as const,
        href: `/dashboard/publications/${p.id}`,
      })),
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
