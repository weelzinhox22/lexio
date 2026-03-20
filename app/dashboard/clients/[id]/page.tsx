import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Mail, Phone, User, FileText, MapPin, Briefcase, GraduationCap, Download, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatCPFCNPJ, formatPhone } from '@/lib/utils/masks'
import { ClientPortalManager } from '@/components/clients/client-portal-manager'

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

  // Buscar token de onboarding
  const { data: onboardingLink } = await supabase
    .from('onboarding_links')
    .select('token, status, completed_at')
    .eq('client_id', id)
    .maybeSingle()

  // Buscar documentos do cliente
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  const hasPortalActive = !!(client.portal_access_code && client.portal_password)

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
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                  <p className="text-slate-900 font-medium">
                    {client.client_type === 'person' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CPF / CNPJ</label>
                  <p className="text-slate-900 font-medium">{formatCPFCNPJ(client.cpf_cnpj)}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RG / Registro</label>
                  <p className="text-slate-900 font-medium">{client.document_rg || '—'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                  <p className="text-slate-900 font-medium flex items-center gap-2">
                    <Mail className="h-3 w-3 text-slate-400" />
                    {client.email || '—'}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telefone</label>
                  <p className="text-slate-900 font-medium flex items-center gap-2">
                    <Phone className="h-3 w-3 text-slate-400" />
                    {client.phone ? formatPhone(client.phone) : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profissão</label>
                  <p className="text-slate-900 font-medium flex items-center gap-2">
                    <Briefcase className="h-3 w-3 text-slate-400" />
                    {client.profession || '—'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Endereço Completo
                  </label>
                  <p className="text-sm text-slate-700">
                    {client.address_cep ? (
                      <>
                        {client.address_neighborhood}, {client.address_number} <br />
                        {client.address_city} - {client.address_state} <br />
                        CEP: {client.address_cep}
                      </>
                    ) : 'Endereço não informado'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado Civil</label>
                  <p className="text-sm text-slate-700 capitalize">{client.marital_status || '—'}</p>
                </div>
              </div>

              {client.notes && (
                <div className="pt-4 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notas Internas</label>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                    {client.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documentos de Onboarding */}
          <Card className="border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Arquivos e Documentos
                </div>
                <Badge variant="secondary" className="text-[10px]">{documents?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!documents || documents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm italic">
                  Nenhum documento anexado ou enviado pelo cliente ainda.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{doc.title || doc.file_name}</p>
                          <p className="text-[10px] text-slate-400 uppercase mt-0.5">
                            {doc.category?.replace('_', ' ') || 'Geral'} • {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                        </a>
                      </Button>
                    </div>
                  ))}
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
          <ClientPortalManager
            clientId={client.id}
            hasPortalActive={hasPortalActive}
            initialAccessCode={client.portal_access_code}
            initialPassword={client.portal_password}
            initialToken={onboardingLink?.token}
          />

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

