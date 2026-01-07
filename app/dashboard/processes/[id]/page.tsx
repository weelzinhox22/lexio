import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Calendar, Scale, User, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatProcessNumber } from '@/lib/utils/masks'

export default async function ProcessViewPage({
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

  const { data: process, error } = await supabase
    .from('processes')
    .select(
      `
      *,
      clients (
        id,
        name,
        email,
        phone,
        cpf_cnpj
      )
    `,
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !process) {
    redirect('/dashboard/processes')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/processes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{process.title}</h1>
            <p className="text-slate-600 mt-1">Detalhes do processo</p>
          </div>
        </div>
        <Link href={`/dashboard/processes/${id}/edit`}>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações do Processo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Número do Processo</label>
                <p className="text-lg font-semibold text-slate-900">
                  {formatProcessNumber(process.process_number)}
                </p>
              </div>
              {process.description && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Descrição</label>
                  <p className="text-slate-700 whitespace-pre-wrap">{process.description}</p>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {process.process_type && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Tipo</label>
                    <p className="text-slate-900 capitalize">{process.process_type}</p>
                  </div>
                )}
                {process.matter && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Matéria</label>
                    <p className="text-slate-900">{process.matter}</p>
                  </div>
                )}
                {process.court && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Tribunal/Fórum</label>
                    <p className="text-slate-900">{process.court}</p>
                  </div>
                )}
                {process.vara && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Vara</label>
                    <p className="text-slate-900">{process.vara}</p>
                  </div>
                )}
                {process.judge && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Juiz</label>
                    <p className="text-slate-900">{process.judge}</p>
                  </div>
                )}
                {process.value && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Valor</label>
                    <p className="text-slate-900">
                      R$ {Number(process.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="mt-2">
                  <Badge
                    variant={
                      process.status === 'active'
                        ? 'default'
                        : process.status === 'won'
                          ? 'default'
                          : process.status === 'lost'
                            ? 'destructive'
                            : 'secondary'
                    }
                    className={
                      process.status === 'active'
                        ? 'bg-blue-100 text-blue-700'
                        : process.status === 'won'
                          ? 'bg-green-100 text-green-700'
                          : ''
                    }
                  >
                    {process.status === 'active'
                      ? 'Ativo'
                      : process.status === 'won'
                        ? 'Ganho'
                        : process.status === 'lost'
                          ? 'Perdido'
                          : 'Arquivado'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Prioridade</label>
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={
                      process.priority === 'urgent'
                        ? 'border-red-200 text-red-700'
                        : process.priority === 'high'
                          ? 'border-orange-200 text-orange-700'
                          : 'border-slate-200 text-slate-700'
                    }
                  >
                    {process.priority === 'urgent'
                      ? 'Urgente'
                      : process.priority === 'high'
                        ? 'Alta'
                        : process.priority === 'medium'
                          ? 'Média'
                          : 'Baixa'}
                  </Badge>
                </div>
              </div>
              {process.start_date && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Data de Início</label>
                  <p className="text-slate-900">
                    {new Date(process.start_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              {process.estimated_end_date && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Previsão de Término</label>
                  <p className="text-slate-900">
                    {new Date(process.estimated_end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {process.clients && (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">{process.clients.name}</p>
                  {process.clients.email && (
                    <p className="text-sm text-slate-600">{process.clients.email}</p>
                  )}
                  {process.clients.phone && (
                    <p className="text-sm text-slate-600">{process.clients.phone}</p>
                  )}
                  <Link href={`/dashboard/clients/${process.clients.id}`}>
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Ver Cliente
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

