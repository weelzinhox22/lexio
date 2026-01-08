import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Mail, Phone, User, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatCPFCNPJ, formatPhone } from '@/lib/utils/masks'

export default async function ClientViewPage({
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

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !client) {
    redirect('/dashboard/clients')
  }

  // Buscar processos do cliente
  const { data: processes } = await supabase
    .from('processes')
    .select('id, title, process_number, status')
    .eq('client_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/dashboard/clients">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-3xl font-bold text-slate-900 truncate">{client.name}</h1>
            <p className="text-slate-600 mt-1 text-sm md:text-base">Detalhes do cliente</p>
          </div>
        </div>
        <Link href={`/dashboard/clients/${id}/edit`} className="flex-1 sm:flex-initial">
          <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-sm">
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
                <User className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">Tipo</label>
                  <p className="text-slate-900">
                    {client.client_type === 'person' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <div className="mt-1">
                    <Badge
                      variant={client.status === 'active' ? 'default' : 'secondary'}
                      className={
                        client.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }
                    >
                      {client.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                {client.email && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <p className="text-slate-900">{client.email}</p>
                  </div>
                )}
                {client.phone && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </label>
                    <p className="text-slate-900">{formatPhone(client.phone)}</p>
                  </div>
                )}
                {client.cpf_cnpj && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">CPF / CNPJ</label>
                    <p className="text-slate-900">{formatCPFCNPJ(client.cpf_cnpj)}</p>
                  </div>
                )}
              </div>
              {client.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Observações</label>
                  <p className="text-slate-700 whitespace-pre-wrap mt-1">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {processes && processes.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Processos Relacionados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {processes.map((process) => (
                    <Link
                      key={process.id}
                      href={`/dashboard/processes/${process.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{process.title}</p>
                        <p className="text-sm text-slate-600">{process.process_number}</p>
                      </div>
                      <Badge
                        variant={process.status === 'active' ? 'default' : 'secondary'}
                        className={
                          process.status === 'active'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }
                      >
                        {process.status === 'active' ? 'Ativo' : 'Arquivado'}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Data de Cadastro</label>
                <p className="text-slate-900">
                  {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Última Atualização</label>
                <p className="text-slate-900">
                  {new Date(client.updated_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

