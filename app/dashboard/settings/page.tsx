"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { User, Bell, Shield, LogOut } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)

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

      setProfile(data)
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

      const { error } = await supabase.from("profiles").update(profile).eq("id", user.id)

      if (error) throw error

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-600 mt-1">Gerencie suas preferências e informações</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>Atualize seus dados pessoais e de contato</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={profile?.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile?.email || ""} disabled className="bg-slate-50" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone/WhatsApp</Label>
              <Input
                id="phone"
                value={profile?.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oab_number">Número da OAB</Label>
              <Input
                id="oab_number"
                value={profile?.oab_number || ""}
                onChange={(e) => setProfile({ ...profile, oab_number: e.target.value })}
                placeholder="OAB/SP 123456"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialties">Áreas de Atuação</Label>
            <Textarea
              id="specialties"
              value={profile?.specialties?.join(", ") || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  specialties: e.target.value.split(",").map((s) => s.trim()),
                })
              }
              placeholder="Civil, Trabalhista, Família..."
              rows={2}
            />
          </div>
          <Button onClick={() => handleSave("personal")} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>Configure como deseja receber notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Notificações WhatsApp</p>
              <p className="text-sm text-slate-600">Receba alertas de prazos via WhatsApp</p>
            </div>
            <input type="checkbox" className="h-5 w-5" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Notificações Email</p>
              <p className="text-sm text-slate-600">Receba resumos diários por email</p>
            </div>
            <input type="checkbox" className="h-5 w-5" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Alertas de Pagamento</p>
              <p className="text-sm text-slate-600">Notificações sobre vencimento de licença</p>
            </div>
            <input type="checkbox" className="h-5 w-5" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Shield className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>Gerencie sua senha e segurança da conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="border-slate-300 bg-transparent">
            Alterar Senha
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Sair da Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
          >
            Sair do Sistema
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
