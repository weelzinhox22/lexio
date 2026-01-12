import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Mail, Phone, User } from 'lucide-react'
import Link from 'next/link'

export default async function LeadViewPage({
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

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !lead) {
    redirect('/dashboard/leads')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; class: string }> = {
      new: { label: 'Novo', class: 'bg-blue-100 text-blue-700' },
      contacted: { label: 'Contatado', class: 'bg-purple-100 text-purple-700' },
      qualified: { label: 'Qualificado', class: 'bg-indigo-100 text-indigo-700' },
      converted: { label: 'Convertido', class: 'bg-green-100 text-green-700' },
      lost: { label: 'Perdido', class: 'bg-red-100 text-red-700' },
    }
    const config = statusConfig[status] || statusConfig.new
    return <Badge className={config.class}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{lead.name}</h1>
            <p className="text-slate-600 mt-1">Detalhes do lead</p>
          </div>
        </div>
        <Link href={`/dashboard/leads/${id}/edit`}>
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
                <User className="h-5 w-5" />
                Informações do Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <div className="mt-1">{getStatusBadge(lead.status)}</div>
                </div>
                {lead.score > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Score</label>
                    <p className="text-slate-900">{lead.score}</p>
                  </div>
                )}
                {lead.email && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <p className="text-slate-900">{lead.email}</p>
                  </div>
                )}
                {lead.phone && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </label>
                    <p className="text-slate-900">{lead.phone}</p>
                  </div>
                )}
                {lead.source && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Origem</label>
                    <p className="text-slate-900">{lead.source}</p>
                  </div>
                )}
                {lead.company && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Empresa</label>
                    <p className="text-slate-900">{lead.company}</p>
                  </div>
                )}
              </div>
              {lead.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Observações</label>
                  <p className="text-slate-700 whitespace-pre-wrap mt-1">{lead.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
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
                  {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {lead.updated_at && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Última Atualização</label>
                  <p className="text-slate-900">
                    {new Date(lead.updated_at).toLocaleDateString('pt-BR')}
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







