import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Scale } from 'lucide-react'

export default async function OnboardingSetupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verificar se já tem perfil preenchido — se sim, redirecionar para dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, oab_number, phone')
    .eq('id', user.id)
    .single()

  if (profile?.full_name && profile?.oab_number) {
    redirect('/dashboard')
  }

  async function saveProfile(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const fullName = formData.get('full_name') as string
    const oabNumber = formData.get('oab_number') as string
    const phone = formData.get('phone') as string

    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        oab_number: oabNumber,
        phone: phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white mb-2">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Bem-vindo ao Themixa!</h1>
          <p className="text-slate-600">
            Preencha seus dados básicos para começar. Você pode alterar depois nas configurações.
          </p>
        </div>

        {/* Form */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Seus Dados</CardTitle>
            <CardDescription>
              Informações essenciais para personalizar sua experiência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveProfile} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="Seu nome completo"
                  defaultValue={profile?.full_name || user.user_metadata?.full_name || ''}
                  required
                  className="border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oab_number">Número da OAB</Label>
                <Input
                  id="oab_number"
                  name="oab_number"
                  placeholder="Ex: 12345/SP"
                  defaultValue={profile?.oab_number || ''}
                  className="border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <p className="text-xs text-slate-500">
                  Formato: número/UF (opcional para secretárias e administradores)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 95582-1293"
                  defaultValue={profile?.phone || ''}
                  className="border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <form action={async () => {
                  'use server'
                  redirect('/dashboard')
                }} className="flex-1">
                  <Button variant="outline" type="submit" className="w-full">
                    Pular por enquanto
                  </Button>
                </form>
                <Button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 text-white group"
                >
                  Salvar e continuar
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
