import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, Users, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function OnboardingInvitePage() {
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
            <span>5 de 5</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Convidar Usuários</h1>
          <p className="text-slate-600">Traga sua equipe para colaborar</p>
        </div>

        {/* Card principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Convidar Membros
            </CardTitle>
            <CardDescription>
              Invite colegas para trabalhar com você na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-6" action={async (formData) => {
              'use server'
              const email = formData.get('email') as string
              const role = formData.get('role') as string || 'member'

              // Aqui você implementaria a lógica de envio de convite
              // Por enquanto, apenas salvamos na base de dados
              try {
                await supabase
                  .from('team_invitations')
                  .insert({
                    invited_by: user.id,
                    email,
                    role,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                  })
              } catch (err) {
                // Table may not exist yet
                console.log('Team invitations table not available yet')
              }
            }}>
              <div className="space-y-2">
                <Label htmlFor="email">Email do Convidado</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu-colega@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Função na Equipe</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="role"
                      value="member"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium text-sm">Membro</p>
                      <p className="text-xs text-slate-500">Acesso básico aos processos</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium text-sm">Administrador</p>
                      <p className="text-xs text-slate-500">Controle total da equipe</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Nota:</strong> Você pode convidar mais membros depois. Este é apenas um exemplo de como funciona a colaboração em equipe.
                </p>
              </div>

              <div className="flex gap-3 pt-6">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Pular por Enquanto
                  </Button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full bg-green-600 hover:bg-green-700" type="submit">
                    ✓ Completar Onboarding
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Congratulations Card */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-2xl">🎉</p>
              <p className="font-semibold text-slate-900">Parabéns!</p>
              <p className="text-sm text-slate-600">
                Você completou a configuração inicial. Agora você está pronto para usar todas as funcionalidades da plataforma!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
