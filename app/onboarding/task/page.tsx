import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRight, ListTodo, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function OnboardingTaskPage() {
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
            <span>2 de 5</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Adicionar uma Tarefa</h1>
          <p className="text-slate-600">Crie seu primeiro compromisso ou tarefa</p>
        </div>

        {/* Card principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-primary" />
              Nova Tarefa
            </CardTitle>
            <CardDescription>
              Organize seus compromissos e prazos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-6" action={async (formData) => {
              'use server'
              const title = formData.get('title') as string
              const description = formData.get('description') as string
              const priority = formData.get('priority') as string
              const deadline = formData.get('deadline') as string

              await supabase
                .from('deadlines')
                .insert({
                  user_id: user.id,
                  title,
                  description,
                  priority: priority || 'medium',
                  deadline_date: deadline || new Date().toISOString().split('T')[0],
                  status: 'pending',
                  created_at: new Date().toISOString(),
                })
            }}>
              <div className="space-y-2">
                <Label htmlFor="title">Título da Tarefa</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ex: Revisar contrato de serviços"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Detalhes da tarefa..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Data Limite</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Pular por Enquanto
                  </Button>
                </Link>
                <Link href="/onboarding/fee" className="flex-1">
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
              <p className="text-sm font-semibold text-slate-900">⏰ Dica:</p>
              <p className="text-xs text-slate-600 mt-1">
                Defina prazos realistas para suas tarefas
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 border-0">
            <CardContent className="pt-4">
              <p className="text-sm font-semibold text-slate-900">📋 Próximo:</p>
              <p className="text-xs text-slate-600 mt-1">
                Você registrará seu primeiro honorário
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
