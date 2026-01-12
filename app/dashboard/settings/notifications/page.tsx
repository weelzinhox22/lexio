"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, Mail, Save, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type NotificationSettings = {
  id: string
  user_id: string
  email_enabled: boolean
  alert_days: number[]
  email_override: string | null
}

const DEFAULT_ALERT_DAYS = [7, 3, 1, 0]

export default function NotificationSettingsPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loginEmail, setLoginEmail] = useState<string | null>(null)

  const [emailEnabled, setEmailEnabled] = useState(true)
  const [emailOverride, setEmailOverride] = useState("")
  const [alertDays, setAlertDays] = useState<number[]>(DEFAULT_ALERT_DAYS)

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null)

  const orderedDays = useMemo(() => [7, 3, 1, 0] as const, [])

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return
        setLoginEmail(user.email ?? null)

        const { data } = await supabase
          .from("notification_settings")
          .select("id, user_id, email_enabled, alert_days, email_override")
          .eq("user_id", user.id)
          .maybeSingle()

        const s = data as NotificationSettings | null
        if (s) {
          setEmailEnabled(Boolean(s.email_enabled))
          setAlertDays(Array.isArray(s.alert_days) && s.alert_days.length > 0 ? s.alert_days : DEFAULT_ALERT_DAYS)
          setEmailOverride(s.email_override ?? "")
        } else {
          // defaults (sem criar registro no DB automaticamente)
          setEmailEnabled(true)
          setAlertDays(DEFAULT_ALERT_DAYS)
          setEmailOverride("")
        }
      } catch (e) {
        console.error("[notifications settings] load error", e)
        setFeedback({
          type: "error",
          title: "Não foi possível carregar",
          message: "Tente novamente em instantes.",
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [supabase])

  const targetEmail = useMemo(() => {
    const override = emailOverride.trim()
    return override || loginEmail || ""
  }, [emailOverride, loginEmail])

  async function handleSave() {
    setSaving(true)
    setFeedback(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const cleanOverride = emailOverride.trim()
      const cleanDays = Array.from(new Set(alertDays)).sort((a, b) => b - a)

      const { error } = await supabase.from("notification_settings").upsert(
        {
          user_id: user.id,
          email_enabled: emailEnabled,
          alert_days: cleanDays.length ? cleanDays : DEFAULT_ALERT_DAYS,
          email_override: cleanOverride ? cleanOverride : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

      if (error) throw error

      setFeedback({
        type: "success",
        title: "Preferências salvas",
        message: "Os alertas por e-mail serão enviados conforme sua configuração.",
      })
    } catch (e) {
      console.error("[notifications settings] save error", e)
      setFeedback({
        type: "error",
        title: "Erro ao salvar",
        message: e instanceof Error ? e.message : "Tente novamente.",
      })
    } finally {
      setSaving(false)
    }
  }

  function toggleDay(day: number, checked: boolean) {
    setAlertDays((prev) => {
      const set = new Set(prev)
      if (checked) set.add(day)
      else set.delete(day)
      return Array.from(set)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notificações</h1>
          <p className="text-slate-600 text-base">
            Gerencie suas preferências de notificação e alertas por e-mail.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      {feedback && (
        <Alert variant={feedback.type === "error" ? "destructive" : "default"} className="border-l-4">
          <Bell className="h-4 w-4" />
          <AlertTitle className="font-semibold">{feedback.title}</AlertTitle>
          <AlertDescription className="text-sm">{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Card: Alertas de Prazos */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2.5">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-slate-900">Alertas de Prazos</CardTitle>
              <CardDescription className="text-slate-600 mt-0.5">
                Receba notificações por e-mail sobre seus prazos processuais
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle Principal */}
          <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-5 transition-all hover:bg-slate-50">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-slate-900">Ativar alertas por e-mail</div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receba lembretes automáticos antes dos prazos importantes. Você pode escolher quando ser avisado.
              </p>
            </div>
            <Switch 
              checked={emailEnabled} 
              onCheckedChange={setEmailEnabled}
              className="shrink-0"
            />
          </div>

          {/* Configuração de E-mail */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <Label htmlFor="email_override" className="text-sm font-medium text-slate-900">
                Endereço de e-mail
              </Label>
            </div>
            <Input
              id="email_override"
              type="email"
              value={emailOverride}
              onChange={(e) => setEmailOverride(e.target.value)}
              placeholder="seu@email.com"
              disabled={!emailEnabled}
              className="h-10"
            />
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0"></div>
              <p>
                {emailOverride.trim() ? (
                  <>
                    Alertas serão enviados para: <span className="font-medium text-slate-900">{emailOverride}</span>
                  </>
                ) : (
                  <>
                    Usaremos seu e-mail de login: <span className="font-medium text-slate-900">{loginEmail || '—'}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quando Avisar */}
          {emailEnabled && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-slate-900">Quando avisar</div>
                <Badge variant="outline" className="text-xs">
                  {alertDays.length} opções selecionadas
                </Badge>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {orderedDays.map((day) => {
                  const checked = alertDays.includes(day)
                  const label =
                    day === 0 ? "No dia do prazo" : day === 1 ? "1 dia antes" : `${day} dias antes`
                  const severity = day === 0 ? 'danger' : day === 1 ? 'warning' : 'info'
                  return (
                    <label
                      key={day}
                      className={`flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
                        checked
                          ? severity === 'danger'
                            ? 'border-red-200 bg-red-50/50'
                            : severity === 'warning'
                              ? 'border-yellow-200 bg-yellow-50/50'
                              : 'border-blue-200 bg-blue-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <Checkbox 
                        checked={checked} 
                        onCheckedChange={(v) => toggleDay(day, Boolean(v))}
                        className="h-4 w-4"
                      />
                      <span className={`text-sm font-medium ${
                        checked
                          ? severity === 'danger'
                            ? 'text-red-900'
                            : severity === 'warning'
                              ? 'text-yellow-900'
                              : 'text-blue-900'
                          : 'text-slate-700'
                      }`}>
                        {label}
                      </span>
                    </label>
                  )
                })}
              </div>
              <div className="rounded-md bg-amber-50/50 border border-amber-200/50 p-3">
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>Importante:</strong> Este alerta é auxiliar e não substitui a conferência nos autos do processo.
                </p>
              </div>
            </div>
          )}

          {/* Botão Salvar */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <Button
              onClick={handleSave}
              disabled={saving || !emailEnabled}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar preferências"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


