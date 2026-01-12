import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, FileText, Filter, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

function statusLabel(status: string | null | undefined): { text: string; className: string } {
  if (status === 'treated') return { text: 'TRATADA', className: 'bg-green-100 text-green-700' }
  if (status === 'discarded') return { text: 'DESCARTADA', className: 'bg-red-100 text-red-700' }
  return { text: 'NÃO TRATADA', className: 'bg-orange-100 text-orange-700' }
}

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string }>
}) {
  const sp = (await searchParams) || {}
  const q = (sp.q || '').trim()
  const status = (sp.status || '').trim()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  let query = supabase
    .from('jusbrasil_publications')
    .select('id, process_title, process_number, publication_date, diary_name, status, deadline_detected, deadline_days')
    .eq('user_id', user.id)
    .order('publication_date', { ascending: false })
    .limit(60)

  if (status && ['untreated', 'treated', 'discarded'].includes(status)) {
    query = query.eq('status', status)
  }

  if (q.length >= 2) {
    const like = `%${q}%`
    query = query.or(`process_title.ilike.${like},process_number.ilike.${like}`)
  }

  const { data: publications, error } = await query

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Publicações</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">Acompanhe e trate publicações do seu escritório.</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Erro ao carregar</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-red-800">{error.message}</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Publicações</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">
            Visualize, trate e descarte publicações. Alertas de prazo são auxiliares — confira o teor.
          </p>
        </div>
      </div>

      {/* Filtros (mobile-first) */}
      <Card className="border-slate-200">
        <CardContent className="p-4 space-y-3">
          <form className="space-y-3" method="GET" action="/dashboard/publications">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-500" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Buscar por título ou número do processo…"
                className="border-slate-300"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input type="hidden" name="status" value={status} />
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white w-full sm:w-auto">
                Buscar
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/dashboard/publications">
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Link>
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-slate-300 text-slate-700">
              <FileText className="h-3.5 w-3.5 mr-1" />
              Status:
            </Badge>
            <Button asChild variant={status === '' ? 'default' : 'outline'} className="h-8 px-3">
              <Link href={`/dashboard/publications${q ? `?q=${encodeURIComponent(q)}` : ''}`}>Todas</Link>
            </Button>
            <Button asChild variant={status === 'untreated' ? 'default' : 'outline'} className="h-8 px-3">
              <Link
                href={`/dashboard/publications?status=untreated${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              >
                Não tratadas
              </Link>
            </Button>
            <Button asChild variant={status === 'treated' ? 'default' : 'outline'} className="h-8 px-3">
              <Link href={`/dashboard/publications?status=treated${q ? `&q=${encodeURIComponent(q)}` : ''}`}>
                Tratadas
              </Link>
            </Button>
            <Button asChild variant={status === 'discarded' ? 'default' : 'outline'} className="h-8 px-3">
              <Link
                href={`/dashboard/publications?status=discarded${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              >
                Descartadas
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {!publications || publications.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-6 text-center text-slate-600">
            Nenhuma publicação encontrada com os filtros atuais.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:gap-4">
          {publications.map((p: any) => {
            const st = statusLabel(p.status)
            const hasDeadline = Boolean(p.deadline_detected)
            const deadlineText =
              hasDeadline && p.deadline_days ? `Possível prazo: ${p.deadline_days} dia(s)` : hasDeadline ? 'Possível prazo detectado' : null

            return (
              <Card key={p.id} className="border-slate-200 hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {p.process_title || 'Publicação'}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 space-y-1">
                        {p.process_number && <div className="font-mono break-words">{p.process_number}</div>}
                        {p.publication_date && (
                          <div>
                            {format(new Date(p.publication_date), 'dd/MM/yyyy', { locale: ptBR })}
                            {p.diary_name ? ` • ${p.diary_name}` : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge className={st.className}>{st.text}</Badge>
                      {deadlineText && <Badge className="bg-yellow-100 text-yellow-800">{deadlineText}</Badge>}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                      <Link href={`/dashboard/publications/${p.id}`}>
                        Ver detalhes <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

