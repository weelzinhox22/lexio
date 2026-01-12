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
    <div className="space-y-4 md:space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Alertas por e-mail</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">
            Configure quando e para qual e-mail o Themixa deve avisar sobre prazos.
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
        <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
          <Bell className="h-4 w-4" />
          <AlertTitle>{feedback.title}</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
          <CardTitle className="flex items-center gap-3 text-slate-900">
            <div className="rounded-lg bg-blue-100 p-2">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            Preferências de alertas
          </CardTitle>
          <CardDescription className="text-slate-600">
            Enviaremos alertas somente para prazos cadastrados por você no Themixa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div className="space-y-1">
              <div className="font-semibold text-slate-900">Receber alertas por e-mail</div>
              <div className="text-sm text-slate-600">Lembretes automáticos 7/3/1/0 dias antes do prazo.</div>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_override" className="text-slate-700 font-medium">
              E-mail para receber alertas (opcional)
            </Label>
            <Input
              id="email_override"
              value={emailOverride}
              onChange={(e) => setEmailOverride(e.target.value)}
              placeholder="Se vazio, usaremos o e-mail do seu login"
              className="border-slate-300 focus:border-blue-400 focus:ring-blue-200"
            />
            <p className="text-xs text-slate-500">
              Enviaremos para: <span className="font-medium">{targetEmail || "—"}</span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-slate-700 font-medium">Quando avisar</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {orderedDays.map((day) => {
                const checked = alertDays.includes(day)
                const label =
                  day === 0 ? "No dia do prazo" : day === 1 ? "1 dia antes" : `${day} dias antes`
                return (
                  <label
                    key={day}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <Checkbox checked={checked} onCheckedChange={(v) => toggleDay(day, Boolean(v))} />
                    <span className="text-sm text-slate-900">{label}</span>
                  </label>
                )
              })}
            </div>
            <p className="text-xs text-slate-600">
              Importante: este alerta é <strong>auxiliar</strong> e não substitui a conferência nos autos.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar preferências"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


