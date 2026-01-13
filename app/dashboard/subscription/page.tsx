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
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Assinatura</h1>
        <p className="text-slate-600 mt-1 text-sm md:text-base">Gerencie seu plano e pagamentos</p>
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

      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Escolha o plano ideal para você</h2>
          <p className="text-slate-600">
            Todos os planos incluem alertas automáticos e gestão completa. Upgrade quando precisar de mais recursos.
          </p>
        </div>

        <SubscriptionPlans currentPlan={subscription?.plan} />

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Sem compromisso</h3>
                <p className="text-sm text-slate-700">
                  Cancele sua assinatura a qualquer momento. Sem taxas de cancelamento, sem perguntas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

