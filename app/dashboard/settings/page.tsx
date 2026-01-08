"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { User, Bell, Shield, LogOut, Save, Mail, Phone, GraduationCap, Briefcase, Calendar } from "lucide-react"
import { MaskedInput } from "@/components/ui/masked-input"
import { formatPhone } from "@/lib/utils/masks"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState({
    whatsapp: true,
    email: true,
    payment_alerts: true,
  })
  const [oabState, setOabState] = useState('BA')
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false)
  const [connectingGoogleCalendar, setConnectingGoogleCalendar] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (data) {
        setProfile(data)
        // Extrair estado da OAB se existir (ex: "OAB/BA 12345")
        if (data.oab_number) {
          const match = data.oab_number.match(/OAB\/([A-Z]{2})/i)
          if (match) {
            setOabState(match[1].toUpperCase())
          }
        }
      }

      // Verificar se Google Calendar está conectado
      const { data: profileData } = await supabase
        .from("profiles")
        .select("google_calendar_connected")
        .eq("id", user.id)
        .single()
      
      if (profileData) {
        setGoogleCalendarConnected(profileData.google_calendar_connected || false)
      }
    } catch (error) {
      console.error("[v0] Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(section: string) {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      if (section === "personal") {
        const { error } = await supabase.from("profiles").update(profile).eq("id", user.id)
        if (error) throw error
      } else if (section === "notifications") {
        // Salvar preferências de notificações (pode criar uma tabela separada ou campo JSON)
        const { error } = await supabase
          .from("profiles")
          .update({ notification_preferences: notifications })
          .eq("id", user.id)
        if (error) throw error
      }

      alert("Configurações salvas com sucesso!")
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      alert("Erro ao salvar configurações")
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  async function handleConnectGoogleCalendar() {
    setConnectingGoogleCalendar(true)
    // Redirecionar para a rota de autenticação do Google
    window.location.href = '/api/google-calendar/auth'
  }

  async function handleDisconnectGoogleCalendar() {
    if (!confirm('Tem certeza que deseja desconectar o Google Calendar? Os eventos já criados não serão removidos.')) {
      return
    }

    try {
      const response = await fetch('/api/google-calendar/disconnect', {
        method: 'POST',
      })

      if (response.ok) {
        setGoogleCalendarConnected(false)
        alert('Google Calendar desconectado com sucesso!')
      } else {
        throw new Error('Erro ao desconectar')
      }
    } catch (error) {
      console.error('Erro ao desconectar Google Calendar:', error)
      alert('Erro ao desconectar Google Calendar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Carregando...</div>
      </div>
    )
  }

  const handleOabChange = (value: string) => {
    setOabState(value)
    const currentNumber = profile?.oab_number || ''
    // Se já tem número, mantém; se não, usa o formato
    const numberOnly = currentNumber.replace(/OAB\/[A-Z]{2}\s*/i, '')
    setProfile({ ...profile, oab_number: numberOnly ? `OAB/${value} ${numberOnly}` : '' })
  }

  const handleOabNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Apenas números
    setProfile({ ...profile, oab_number: value ? `OAB/${oabState} ${value}` : '' })
  }

  const oabStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  function getStateName(state: string): string {
    const states: Record<string, string> = {
      AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas',
      BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
      GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
      MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
      PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
      RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina',
      SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins'
    }
    return states[state] || state
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-600 mt-1">Gerencie suas preferências e informações pessoais</p>
      </div>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
          <CardTitle className="flex items-center gap-3 text-slate-900">
            <div className="rounded-lg bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            Informações Pessoais
          </CardTitle>
          <CardDescription className="text-slate-600">
            Atualize seus dados pessoais, de contato e profissionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-slate-700 font-medium">
                Nome Completo *
              </Label>
              <Input
                id="full_name"
                value={profile?.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Seu nome completo"
                className="border-slate-300 focus:border-blue-400 focus:ring-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={profile?.email || ""} 
                disabled 
                className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed" 
              />
              <p className="text-xs text-slate-500">Email não pode ser alterado</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700 font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone/WhatsApp *
              </Label>
              <MaskedInput
                id="phone"
                mask="phone"
                value={profile?.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="(71) 99999-9999"
                className="border-slate-300 focus:border-blue-400 focus:ring-blue-200"
              />
              <p className="text-xs text-slate-500">Usado para notificações WhatsApp</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="oab_state" className="text-slate-700 font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Estado da OAB
              </Label>
              <Select value={oabState} onValueChange={handleOabChange}>
                <SelectTrigger className="border-slate-300 focus:border-blue-400 focus:ring-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {oabStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state} - {getStateName(state)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="oab_number" className="text-slate-700 font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Número da OAB
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-600 font-medium">
                OAB/{oabState}
              </div>
              <Input
                id="oab_number"
                value={profile?.oab_number?.replace(`OAB/${oabState} `, '') || ""}
                onChange={handleOabNumberChange}
                placeholder="12345"
                className="border-slate-300 focus:border-blue-400 focus:ring-blue-200"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-slate-500">Exemplo: OAB/BA 12345</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialties" className="text-slate-700 font-medium">
              Áreas de Atuação
            </Label>
            <Textarea
              id="specialties"
              value={profile?.specialties?.join(", ") || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  specialties: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="Ex: Direito Civil, Direito Trabalhista, Direito de Família..."
              rows={3}
              className="border-slate-300 focus:border-blue-400 focus:ring-blue-200"
            />
            <p className="text-xs text-slate-500">Separe por vírgula</p>
          </div>

          <Button 
            onClick={() => handleSave("personal")} 
            disabled={saving} 
            className="bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-300 text-white w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
          <CardTitle className="flex items-center gap-3 text-slate-900">
            <div className="rounded-lg bg-purple-100 p-2">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            Notificações
          </CardTitle>
          <CardDescription className="text-slate-600">
            Configure como deseja receber notificações e alertas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex-1">
              <p className="font-semibold text-slate-900 mb-1">Notificações WhatsApp</p>
              <p className="text-sm text-slate-600">Receba alertas de prazos e compromissos via WhatsApp</p>
            </div>
            <Switch
              checked={notifications.whatsapp}
              onCheckedChange={(checked) => setNotifications({ ...notifications, whatsapp: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex-1">
              <p className="font-semibold text-slate-900 mb-1">Notificações Email</p>
              <p className="text-sm text-slate-600">Receba resumos diários e atualizações por email</p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex-1">
              <p className="font-semibold text-slate-900 mb-1">Alertas de Pagamento</p>
              <p className="text-sm text-slate-600">Notificações sobre vencimento de licença e renovações</p>
            </div>
            <Switch
              checked={notifications.payment_alerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, payment_alerts: checked })}
            />
          </div>
          <Button 
            onClick={() => handleSave("notifications")} 
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 hover:scale-105 hover:shadow-lg transition-all duration-300 text-white w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Preferências"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
          <CardTitle className="flex items-center gap-3 text-slate-900">
            <div className="rounded-lg bg-green-100 p-2">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            Integrações
          </CardTitle>
          <CardDescription className="text-slate-600">
            Conecte o Themixa com outras ferramentas que você usa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-slate-900">Google Calendar</p>
                  {googleCalendarConnected && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      Conectado
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  {googleCalendarConnected 
                    ? 'Seus prazos estão sendo sincronizados automaticamente com o Google Calendar'
                    : 'Sincronize automaticamente seus prazos com o Google Calendar para nunca perder um compromisso'
                  }
                </p>
                {googleCalendarConnected ? (
                  <Button
                    onClick={handleDisconnectGoogleCalendar}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Desconectar
                  </Button>
                ) : (
                  <Button
                    onClick={handleConnectGoogleCalendar}
                    disabled={connectingGoogleCalendar}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {connectingGoogleCalendar ? 'Conectando...' : 'Conectar Google Calendar'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 mb-1">Notificações por E-mail</p>
                <p className="text-sm text-slate-600 mb-2">
                  Em breve: Receba alertas de prazos diretamente no seu e-mail
                </p>
                <span className="px-2 py-1 text-xs font-medium bg-slate-200 text-slate-600 rounded">
                  Em desenvolvimento
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-200">
          <CardTitle className="flex items-center gap-3 text-slate-900">
            <div className="rounded-lg bg-amber-100 p-2">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            Segurança
          </CardTitle>
          <CardDescription className="text-slate-600">
            Gerencie sua senha e configurações de segurança da conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
            <p className="font-semibold text-slate-900 mb-2">Alterar Senha</p>
            <p className="text-sm text-slate-600 mb-4">
              Para alterar sua senha, faça logout e use a opção "Esqueci minha senha" na tela de login
            </p>
            <Button variant="outline" className="border-slate-300 hover:bg-slate-100">
              Ir para Login
            </Button>
          </div>
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
            <p className="font-semibold text-blue-900 mb-2">Sessões Ativas</p>
            <p className="text-sm text-blue-700">
              Você está logado em 1 dispositivo. Para segurança, faça logout quando terminar.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <LogOut className="h-5 w-5" />
            </div>
            Sair da Conta
          </CardTitle>
          <CardDescription className="text-red-600">
            Faça logout para encerrar sua sessão atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100 hover:scale-105 transition-all duration-300 bg-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair do Sistema
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
