import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Download, FileText, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { DocumentDownloadButton } from '@/components/documents/document-download-button'
import { DocumentViewerButton } from '@/components/documents/document-viewer-button'

export default async function DocumentViewPage({
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

  const { data: document, error } = await supabase
    .from('documents')
    .select(
      `
      *,
      clients (
        id,
        name
      ),
      processes (
        id,
        title,
        process_number
      )
    `,
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !document) {
    redirect('/dashboard/documents')
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      contrato: 'bg-blue-100 text-blue-700',
      peticao: 'bg-purple-100 text-purple-700',
      certidao: 'bg-green-100 text-green-700',
      procuracao: 'bg-amber-100 text-amber-700',
      sentenca: 'bg-red-100 text-red-700',
    }
    return colors[category || ''] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{document.title}</h1>
            <p className="text-slate-600 mt-1">Detalhes do documento</p>
          </div>
        </div>
        <div className="flex gap-2">
          <DocumentViewerButton document={document} />
          <DocumentDownloadButton document={document} />
          <Link href={`/dashboard/documents/${id}/edit`}>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações do Documento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Título</label>
                <p className="text-lg font-semibold text-slate-900">{document.title}</p>
              </div>
              {document.description && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Descrição</label>
                  <p className="text-slate-700 whitespace-pre-wrap">{document.description}</p>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {document.category && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Categoria</label>
                    <div className="mt-1">
                      <Badge className={getCategoryColor(document.category)}>
                        {document.category}
                      </Badge>
                    </div>
                  </div>
                )}
                {document.file_name && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Nome do Arquivo</label>
                    <p className="text-slate-900">{document.file_name}</p>
                  </div>
                )}
                {document.file_size && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Tamanho</label>
                    <p className="text-slate-900">{formatSize(document.file_size)}</p>
                  </div>
                )}
                {document.file_type && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Tipo</label>
                    <p className="text-slate-900">{document.file_type}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Relacionamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.clients && (
                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente
                  </label>
                  <Link href={`/dashboard/clients/${document.clients.id}`}>
                    <p className="text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
                      {document.clients.name}
                    </p>
                  </Link>
                </div>
              )}
              {document.processes && (
                <div>
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Processo
                  </label>
                  <Link href={`/dashboard/processes/${document.processes.id}`}>
                    <p className="text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">
                      {document.processes.title}
                    </p>
                    <p className="text-sm text-slate-600">{document.processes.process_number}</p>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Data de Upload</label>
                <p className="text-slate-900">
                  {new Date(document.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {document.updated_at && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Última Atualização</label>
                  <p className="text-slate-900">
                    {new Date(document.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

