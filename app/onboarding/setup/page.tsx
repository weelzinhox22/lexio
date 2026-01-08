import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, User, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function OnboardingSetupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header com progresso */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <span>1 de 5</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Configuração Inicial</h1>
          <p className="text-slate-600">Defina as informações básicas da sua conta</p>
        </div>

        {/* Card principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Suas Informações
            </CardTitle>
            <CardDescription>
              Preencha os dados que aparecerão em suas publicações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-6" action={async (formData) => {
              'use server'
              const fullName = formData.get('full_name') as string
              const displayName = formData.get('display_name') as string
              const bio = formData.get('bio') as string

              await supabase
                .from('user_profiles')
                .update({
                  full_name: fullName,
                  display_name: displayName,
                  bio: bio,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id)
            }}>
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="Seu nome completo"
                  defaultValue={profile?.full_name || ''}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Nome para Publicações</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  placeholder="Como você quer ser creditado nas publicações"
                  defaultValue={profile?.display_name || ''}
                  required
                />
                <p className="text-xs text-slate-500">
                  Este nome aparecerá em todas as suas publicações
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Sobre você</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Uma breve descrição de você (opcional)"
                  defaultValue={profile?.bio || ''}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-6">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Pular por Enquanto
                  </Button>
                </Link>
                <Link href="/onboarding/task" className="flex-1">
                  <Button className="w-full" type="submit">
                    Próximo Passo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Cards auxiliares com dicas */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-50 border-0">
            <CardContent className="pt-4">
              <p className="text-sm font-semibold text-slate-900">💡 Dica:</p>
              <p className="text-xs text-slate-600 mt-1">
                Use um nome profissional para display name
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 border-0">
            <CardContent className="pt-4">
              <p className="text-sm font-semibold text-slate-900">📋 Próximo:</p>
              <p className="text-xs text-slate-600 mt-1">
                Você criará sua primeira tarefa
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
