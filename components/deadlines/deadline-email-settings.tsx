'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function DeadlineEmailSettings() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [loginEmail, setLoginEmail] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        setLoginEmail(user.email ?? null)

        const { data } = await supabase
          .from('notification_settings')
          .select('email_override, email_enabled')
          .eq('user_id', user.id)
          .maybeSingle()

        if (data?.email_override) {
          setEmail(data.email_override)
        }
      } catch (e) {
        console.error('[deadline email settings] load error', e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [supabase])

  const targetEmail = useMemo(() => {
    return email.trim() || loginEmail || ''
  }, [email, loginEmail])

  async function handleSave() {
    setSaving(true)
    setFeedback(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const cleanEmail = email.trim()

      // Validar e-mail se fornecido
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setFeedback({ type: 'error', message: 'Por favor, insira um e-mail válido.' })
        setSaving(false)
        return
      }

      const { error } = await supabase.from('notification_settings').upsert(
        {
          user_id: user.id,
          email_override: cleanEmail || null,
          email_enabled: true, // Garantir que está habilitado
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

      if (error) throw error

      setFeedback({
        type: 'success',
        message: 'E-mail salvo com sucesso! Você receberá alertas neste endereço.',
      })

      // Limpar feedback após 3 segundos
      setTimeout(() => setFeedback(null), 3000)
    } catch (e) {
      console.error('[deadline email settings] save error', e)
      setFeedback({
        type: 'error',
        message: e instanceof Error ? e.message : 'Erro ao salvar. Tente novamente.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="text-sm text-slate-600">Carregando...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2.5">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900">E-mail para Notificações</CardTitle>
            <CardDescription className="text-slate-600 mt-0.5">
              Seus alertas serão enviados para este endereço. Você receberá notificações em 7, 3, 1 dia e no dia do prazo.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback && (
          <Alert
            variant={feedback.type === 'error' ? 'destructive' : 'default'}
            className={feedback.type === 'success' ? 'border-green-200 bg-green-50' : ''}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className={feedback.type === 'success' ? 'text-green-900' : ''}>
              {feedback.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="deadline-email" className="text-sm font-medium text-slate-900">
            Endereço de e-mail
          </Label>
          <Input
            id="deadline-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={loginEmail || 'seu@email.com'}
            className="h-10"
          />
          <p className="text-xs text-slate-600 leading-relaxed">
            Você receberá alertas automáticos quando seus prazos estiverem se aproximando. Deixe em branco para usar o e-mail da sua conta.
          </p>
        </div>

        {targetEmail && (
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-xs">
                E-mail atual
              </Badge>
              <span className="font-medium text-slate-900">{targetEmail}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar e-mail'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


