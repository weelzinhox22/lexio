import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Sparkles } from "lucide-react"
import { redirect } from "next/navigation"
import { CountdownTimer } from "@/components/subscription/countdown-timer"
import { SubscriptionPlans } from "@/components/subscription/subscription-plans"

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single()

  const isExpired =
    subscription?.status === "expired" ||
    (subscription?.current_period_end && new Date(subscription.current_period_end) < new Date())


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Assinatura</h1>
        <p className="text-slate-600 mt-1">Gerencie seu plano e pagamentos</p>
      </div>

      {isExpired && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Sua licença expirou</p>
              <p className="text-sm text-red-700">Renove sua assinatura para continuar usando o sistema</p>
            </div>
          </CardContent>
        </Card>
      )}

      {subscription && !isExpired && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-green-900">Assinatura Ativa</CardTitle>
                  <CardDescription className="text-green-700">
                    Plano: <span className="font-semibold capitalize">{subscription.plan}</span>
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-sm px-3 py-1">
                {subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
              <p className="text-sm text-slate-600 mb-2">Válido até:</p>
              <p className="text-lg font-semibold text-slate-900 mb-3">
                {new Date(subscription.current_period_end).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">Tempo restante:</p>
                <CountdownTimer targetDate={subscription.current_period_end} />
              </div>
            </div>
            {subscription.cancel_at_period_end && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-700 font-medium text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Cancelamento agendado para o fim do período
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <SubscriptionPlans currentPlan={subscription?.plan} />

      <Card className="border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-slate-900">Precisa de Ajuda?</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-700 space-y-2">
          <p>
            Entre em contato com nosso time de suporte para mais informações sobre planos corporativos ou condições
            especiais.
          </p>
          <p className="font-semibold">Email: suporte@seusistema.com.br | WhatsApp: (11) 99999-9999</p>
        </CardContent>
      </Card>
    </div>
  )
}

