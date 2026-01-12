import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, BookOpen, User, FileText, ExternalLink, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function PublicationViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: publication, error } = await supabase
    .from('jusbrasil_publications')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !publication) {
    redirect('/dashboard/publications')
  }

  // Buscar processo relacionado se houver número
  let relatedProcess = null
  if (publication.process_number) {
    const { data: process } = await supabase
      .from('processes')
      .select('id, title, process_number')
      .eq('process_number', publication.process_number)
      .eq('user_id', user.id)
      .single()
    
    relatedProcess = process
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/publications">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Detalhes da Publicação</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">Visualize todas as informações da publicação</p>
        </div>
      </div>

      {/* Status e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Status da Publicação</CardTitle>
            <Badge
              className={
                publication.status === 'treated'
                  ? 'bg-green-100 text-green-700'
                  : publication.status === 'discarded'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700'
              }
            >
              {publication.status === 'treated'
                ? 'TRATADA'
                : publication.status === 'discarded'
                  ? 'DESCARTADA'
                  : 'NÃO TRATADA'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {publication.status === 'untreated' && (
              <>
                <Button
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  asChild
                >
                  <Link href={`/dashboard/publications/${id}/treat`}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como Tratada
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  asChild
                >
                  <Link href={`/dashboard/publications/${id}/discard`}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Descartar
                  </Link>
                </Button>
              </>
            )}
            {publication.pje_url && (
              <Button
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                asChild
              >
                <a href={publication.pje_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Acessar no PJe
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações Principais */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Processo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {publication.process_number && (
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4" />
                  Número do Processo
                </label>
                <p className="text-slate-900 font-mono">{publication.process_number}</p>
                {relatedProcess && (
                  <Link 
                    href={`/dashboard/processes/${relatedProcess.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block"
                  >
                    Ver processo cadastrado →
                  </Link>
                )}
              </div>
            )}

            {publication.process_title && (
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1">Título</label>
                <p className="text-slate-900">{publication.process_title}</p>
              </div>
            )}

            {publication.publication_type && (
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1">Tipo de Publicação</label>
                <Badge variant="outline">{publication.publication_type}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datas e Diário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {publication.publication_date && (
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  Data de Publicação
                </label>
                <p className="text-slate-900">
                  {format(new Date(publication.publication_date), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            )}

            {publication.diary_date && publication.diary_date !== publication.publication_date && (
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1">Data do Diário</label>
                <p className="text-slate-900">
                  {format(new Date(publication.diary_date), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            )}

            {publication.diary_name && (
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4" />
                  Diário Oficial
                </label>
                <p className="text-slate-900">{publication.diary_name}</p>
              </div>
            )}

            {publication.searched_name && (
              <div>
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />
                  Nome Pesquisado
                </label>
                <p className="text-slate-900">{publication.searched_name}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo */}
      {publication.content && (
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo da Publicação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {publication.content}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notas */}
      {publication.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 whitespace-pre-wrap">{publication.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações de Tratamento */}
      {publication.status !== 'untreated' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {publication.status === 'treated' ? 'Informações de Tratamento' : 'Informações de Descarte'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {publication.treated_at && (
              <div>
                <label className="text-sm font-medium text-slate-600">Tratada em</label>
                <p className="text-slate-900">
                  {format(new Date(publication.treated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            )}
            {publication.discarded_at && (
              <div>
                <label className="text-sm font-medium text-slate-600">Descartada em</label>
                <p className="text-slate-900">
                  {format(new Date(publication.discarded_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

