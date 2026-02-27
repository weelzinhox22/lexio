"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User, Shield, LogOut, Save, Mail, Phone, GraduationCap, Briefcase,
  Calendar, ArrowRight, Camera, Loader2, Key, Monitor, Smartphone, Clock
} from "lucide-react"
import { MaskedInput } from "@/components/ui/masked-input"
import { formatPhone } from "@/lib/utils/masks"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [oabState, setOabState] = useState('BA')
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false)
  const [connectingGoogleCalendar, setConnectingGoogleCalendar] = useState(false)

  // Avatar upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Password change
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Sessions
  const [sessions, setSessions] = useState<any[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)

  useEffect(() => {
    loadProfile()
    loadSessions()

    // Check URL for Google Calendar callback results
    const params = new URLSearchParams(window.location.search)
    const googleSuccess = params.get('google_calendar_success')
    const googleError = params.get('google_calendar_error')

    if (googleSuccess === 'true') {
      toast.success('Google Calendar conectado com sucesso!')
      // Clean up URL
      router.replace('/dashboard/settings')
    } else if (googleError) {
      toast.error(`Erro ao conectar com Google Calendar: ${googleError}`)
      // Clean up URL
      router.replace('/dashboard/settings')
    }
  }, [router])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (data) {
        setProfile(data)
        if (data.oab_number) {
          const match = data.oab_number.match(/OAB\/([A-Z]{2})/i)
          if (match) setOabState(match[1].toUpperCase())
        }
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("google_calendar_connected")
        .eq("id", user.id)
        .single()

      if (profileData) {
        setGoogleCalendarConnected(profileData.google_calendar_connected || false)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadSessions() {
    try {
      // Get current session info
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const userAgent = navigator.userAgent
        const isMobile = /Mobi|Android|iPhone|iPad/i.test(userAgent)
        const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)
        const browserName = browserMatch ? browserMatch[1] : 'Navegador'
        const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS|iPhone)/i)
        const osName = osMatch ? osMatch[1] : 'Sistema'

        setSessions([{
          id: 'current',
          browser: browserName,
          os: osName,
          isMobile,
          isCurrent: true,
          lastActive: new Date().toISOString(),
          createdAt: session.user?.created_at ? new Date(session.user.created_at).toISOString() : new Date().toISOString(),
        }])
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setLoadingSessions(false)
    }
  }

  async function handleSave(section: string) {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (section === "personal") {
        const { error } = await supabase.from("profiles").update(profile).eq("id", user.id)
        if (error) throw error
      }

      toast.success("Configurações salvas com sucesso!")
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Erro ao salvar configurações")
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem (JPG, PNG, etc.)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB')
      return
    }

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/storage/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro no upload')
      }

      const { avatarUrl } = await response.json()
      
      // Add cache-buster to URL
      const urlWithCache = `${avatarUrl}?t=${Date.now()}`

      setProfile({ ...profile, avatar_url: urlWithCache })
      toast.success("Foto de perfil atualizada!")
      router.refresh()
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error("Erro ao atualizar foto de perfil: " + (error as Error).message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handlePasswordChange() {
    setPasswordMessage(null)

    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'As senhas não coincidem' })
      return
    }

    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'Erro ao alterar senha' })
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  async function handleConnectGoogleCalendar() {
    setConnectingGoogleCalendar(true)
    window.location.href = '/api/google-calendar/auth'
  }

  async function handleDisconnectGoogleCalendar() {
    if (!confirm('Desconectar Google Calendar?')) return
    try {
      const response = await fetch('/api/google-calendar/disconnect', { method: 'POST' })
      if (response.ok) {
        setGoogleCalendarConnected(false)
        toast.success('Google Calendar desconectado!')
      }
    } catch (error) {
      toast.error('Erro ao desconectar')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  const handleOabChange = (value: string) => {
    setOabState(value)
    const currentNumber = profile?.oab_number || ''
    const numberOnly = currentNumber.replace(/OAB\/[A-Z]{2}\s*/i, '')
    setProfile({ ...profile, oab_number: numberOnly ? `OAB/${value} ${numberOnly}` : '' })
  }

  const handleOabNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
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

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : profile?.email?.substring(0, 2).toUpperCase() || "US"

  return (
    <div className="space-y-4 md:space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-600 mt-1 text-sm md:text-base">Gerencie suas preferências e informações pessoais</p>
      </div>

      {/* Perfil com foto */}
      <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-b border-slate-100/60 pb-5">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-xl">
            <div className="rounded-xl bg-blue-100/80 p-2.5 shadow-sm">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            Informações Pessoais
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium">
            Atualize seus dados pessoais, de contato e profissionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-20 w-20 ring-2 ring-slate-200 ring-offset-2">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="Avatar" />}
                <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Foto de Perfil</p>
              <p className="text-xs text-slate-500 mt-0.5">JPG, PNG ou GIF. Máximo 2MB.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs rounded-full shadow-sm font-semibold"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Camera className="h-3 w-3 mr-1.5" />
                    Alterar foto
                  </>
                )}
              </Button>
            </div>
          </div>

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
                className="rounded-full shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200"
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
                className="rounded-full shadow-sm bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500">Email não pode ser alterado</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700 font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone *
              </Label>
              <MaskedInput
                id="phone"
                mask="phone"
                value={profile?.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="(71) 99999-9999"
                className="rounded-full shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oab_state" className="text-slate-700 font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Estado da OAB
              </Label>
              <Select value={oabState} onValueChange={handleOabChange}>
                <SelectTrigger className="rounded-full shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200">
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
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-300 shadow-sm rounded-full text-slate-600 font-semibold text-sm">
                OAB/{oabState}
              </div>
              <Input
                id="oab_number"
                value={profile?.oab_number?.replace(`OAB/${oabState} `, '') || ""}
                onChange={handleOabNumberChange}
                placeholder="12345"
                className="rounded-full shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200"
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
                  specialties: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean),
                })
              }
              placeholder="Ex: Direito Civil, Direito Trabalhista, Direito de Família..."
              rows={3}
              className="rounded-2xl shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200"
            />
            <p className="text-xs text-slate-500">Separe por vírgula</p>
          </div>

          <Button
            onClick={() => handleSave("personal")}
            disabled={saving}
            className="rounded-full bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm hover:translate-y-0 transition-transform hover:-translate-y-0.5 text-white w-full sm:w-auto mt-4 px-6"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardContent>
      </Card>

      {/* Alertas de Prazo por E-mail */}
      <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-b border-slate-100/60 pb-5">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-xl">
            <div className="rounded-xl bg-purple-100/80 p-2.5 shadow-sm">
              <Mail className="h-5 w-5 text-purple-600" />
            </div>
            Alertas de Prazo por E-mail
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium">
            Configure lembretes automáticos para seus prazos processuais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">Configurar Alertas</p>
                <p className="text-sm text-slate-600 mt-1">
                  Defina lembretes 7/3/1/0 dias antes do prazo e o e-mail de destino.
                </p>
              </div>
              <Button asChild variant="outline" className="shrink-0 rounded-full font-semibold shadow-sm border-slate-200">
                <Link href="/dashboard/settings/notifications">
                  Configurar <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrações */}
      <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-b border-slate-100/60 pb-5">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-xl">
            <div className="rounded-xl bg-emerald-100/80 p-2.5 shadow-sm">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            Integrações
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium">
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
                    ? 'Seus prazos estão sendo sincronizados com o Google Calendar'
                    : 'Sincronize seus prazos com o Google Calendar'}
                </p>
                {googleCalendarConnected ? (
                  <Button
                    onClick={handleDisconnectGoogleCalendar}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50 rounded-full shadow-sm font-semibold"
                  >
                    Desconectar
                  </Button>
                ) : (
                  <Button
                    onClick={handleConnectGoogleCalendar}
                    disabled={connectingGoogleCalendar}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm font-semibold"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {connectingGoogleCalendar ? 'Conectando...' : 'Conectar Google Calendar'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ferramentas de Captação */}
      <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border-b border-slate-100/60 pb-5">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-xl">
            <div className="rounded-xl bg-indigo-100/80 p-2.5 shadow-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            </div>
            Ferramentas de Marketing
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium">
            Integrações exclusivas para o seu site ou Landing Page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
                  Captador Automático WhatsApp (Widget)
                </p>
                <p className="text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                  Gere um botão de WhatsApp para o seu site pessoal. Clientes que preencherem cairão automaticamente no seu CRM de Leads antes mesmo de abrir o aplicativo.
                </p>
              </div>
              <Button asChild className="shrink-0 rounded-full font-semibold shadow-sm w-full md:w-auto bg-[#25D366] hover:bg-[#20b858] text-white">
                <Link href="/dashboard/settings/whatsapp-widget">
                  Configurar Widget
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segurança — Alterar Senha */}
      <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-b border-slate-100/60 pb-5">
          <CardTitle className="flex items-center gap-3 text-slate-900 text-xl">
            <div className="rounded-xl bg-amber-100/80 p-2.5 shadow-sm">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            Segurança
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium">
            Gerencie sua senha e dispositivos conectados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Alterar Senha */}
          <div className="p-4 rounded-lg border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-slate-600" />
              <p className="font-semibold text-slate-900">Alterar Senha</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new_password" className="text-sm">Nova Senha</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="rounded-full shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-sm">Confirmar Nova Senha</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="rounded-full shadow-sm border-slate-300 focus:border-blue-400 focus:ring-blue-200"
                />
              </div>
            </div>
            {passwordMessage && (
              <div className={`rounded-lg p-3 text-sm ${passwordMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                {passwordMessage.text}
              </div>
            )}
            <Button
              onClick={handlePasswordChange}
              disabled={changingPassword || !newPassword}
              variant="outline"
              className="border-amber-300 hover:bg-amber-50 rounded-full shadow-sm font-semibold text-amber-700"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Alterar Senha
                </>
              )}
            </Button>
          </div>

          {/* Sessões Ativas */}
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-600" />
              <p className="font-semibold text-blue-900">Sessões Ativas</p>
            </div>
            {loadingSessions ? (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando sessões...
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      {session.isMobile ? (
                        <Smartphone className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Monitor className="h-5 w-5 text-blue-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {session.browser} — {session.os}
                          {session.isCurrent && (
                            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded">
                              ESTA SESSÃO
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Iniciada em {new Date(session.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-blue-600 mt-1">
                  {sessions.length} dispositivo{sessions.length > 1 ? 's' : ''} conectado{sessions.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sair */}
      <Card className="rounded-3xl border-red-200/60 bg-red-50/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-5">
          <CardTitle className="text-red-700 flex items-center gap-3 text-xl">
            <div className="rounded-xl bg-red-100/80 p-2.5 shadow-sm">
              <LogOut className="h-5 w-5" />
            </div>
            Sair da Conta
          </CardTitle>
          <CardDescription className="text-red-600/80 font-medium">
            Faça logout para encerrar sua sessão atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="rounded-full shadow-sm font-semibold border-red-300 text-red-700 hover:bg-red-100 hover:translate-y-0 transition-transform hover:-translate-y-0.5 bg-white px-6"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair do Sistema
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
