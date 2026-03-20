import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Sparkles } from "lucide-react"
import { redirect } from "next/navigation"
import { CountdownTimer } from "@/components/subscription/countdown-timer"
import { SubscriptionPlans } from "@/components/subscription/subscription-plans"
import { CancelSubscriptionButton } from "@/components/subscription/cancel-subscription-button"

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
        <Card className="rounded-2xl border-red-200/60 bg-red-50/50 shadow-sm">
          <CardContent className="flex items-center gap-3 p-5">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Sua licença expirou</p>
              <p className="text-sm text-red-700">Renove sua assinatura para continuar usando o sistema</p>
            </div>
          </CardContent>
        </Card>
      )}

      {subscription && !isExpired && (
        <Card className="rounded-2xl border-emerald-200/60 bg-gradient-to-br from-emerald-50/50 to-green-50/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 bg-emerald-50/30 border-b border-emerald-100/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 shrink-0">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-emerald-900 text-lg">Assinatura Ativa</CardTitle>
                  <CardDescription className="text-emerald-700 font-medium">
                    Plano: <span className="font-bold capitalize">{subscription.plan}</span>
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-100/80 text-emerald-700 border-emerald-300/60 text-xs px-3 py-1 font-semibold rounded-full shadow-sm w-fit">
                {subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <div className="bg-white rounded-xl p-5 border border-emerald-100/60 shadow-sm">
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
            {!subscription.cancel_at_period_end && subscription.plan !== "free" && (
              <div className="flex justify-end pt-2">
                <CancelSubscriptionButton />
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

        <Card className="rounded-2xl border-slate-200/60 bg-slate-50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-slate-200 p-2 shrink-0">
                <Sparkles className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Sem compromisso</h3>
                <p className="text-sm text-slate-600 font-medium">
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

