import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function OnboardingPublicationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header com progresso */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <span>4 de 5</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Tratar uma Publicação</h1>
          <p className="text-slate-600">Mantenha seus processos em dia com publicações</p>
        </div>

        {/* Card principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Nova Publicação
            </CardTitle>
            <CardDescription>
              Registre um andamento ou atualização de processo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-6" action={async (formData) => {
              'use server'
              const processNumber = formData.get('process_number') as string
              const title = formData.get('title') as string
              const content = formData.get('content') as string
              const source = formData.get('source') as string || 'manual'

              await supabase
                .from('jusbrasil_publications')
                .insert({
                  user_id: user.id,
                  process_number: processNumber,
                  process_title: title,
                  content,
                  source,
                  diary_name: 'Manual',
                  publication_date: new Date().toISOString().split('T')[0],
                  created_at: new Date().toISOString(),
                })
            }}>
              <div className="space-y-2">
                <Label htmlFor="process_number">Número do Processo (opcional)</Label>
                <Input
                  id="process_number"
                  name="process_number"
                  placeholder="Ex: 0000000-00.0000.0.00.0000"
                />
                <p className="text-xs text-slate-500">
                  Se deixar em branco, você pode editá-lo depois
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título da Publicação</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ex: Decisão importante do tribunal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Descreva o andamento ou atualização do processo..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3 pt-6">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Pular por Enquanto
                  </Button>
                </Link>
                <Link href="/onboarding/invite" className="flex-1">
                  <Button className="w-full" type="submit">
                    Próximo Passo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Cards auxiliares */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-50 border-0">
            <CardContent className="pt-4">
              <p className="text-sm font-semibold text-slate-900">📝 Dica:</p>
              <p className="text-xs text-slate-600 mt-1">
                Mantenha registros bem documentados dos andamentos
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 border-0">
            <CardContent className="pt-4">
              <p className="text-sm font-semibold text-slate-900">👥 Próximo:</p>
              <p className="text-xs text-slate-600 mt-1">
                Você convidará membros da sua equipe
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
