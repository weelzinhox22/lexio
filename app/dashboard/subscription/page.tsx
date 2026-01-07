import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, AlertCircle, CreditCard } from "lucide-react"
import { redirect } from "next/navigation"

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

  const plans = [
    {
      name: "Básico",
      price: "R$ 97",
      period: "/mês",
      description: "Ideal para advogados autônomos",
      features: [
        "Até 50 processos ativos",
        "Gestão de clientes",
        "Controle de prazos",
        "Gestão financeira básica",
        "2GB de armazenamento",
        "Suporte por email",
      ],
      popular: false,
      planId: "basic",
    },
    {
      name: "Premium",
      price: "R$ 197",
      period: "/mês",
      description: "Para escritórios em crescimento",
      features: [
        "Processos ilimitados",
        "Gestão completa de clientes",
        "Controle avançado de prazos",
        "Gestão financeira completa",
        "CRM e pipeline de leads",
        "50GB de armazenamento",
        "Notificações WhatsApp",
        "Relatórios e analytics",
        "Suporte prioritário",
      ],
      popular: true,
      planId: "premium",
    },
    {
      name: "Enterprise",
      price: "R$ 397",
      period: "/mês",
      description: "Para grandes escritórios",
      features: [
        "Tudo do Premium +",
        "Usuários ilimitados",
        "Armazenamento ilimitado",
        "API de integração",
        "Suporte dedicado 24/7",
        "Treinamento personalizado",
        "White label",
        "SLA garantido",
      ],
      popular: false,
      planId: "enterprise",
    },
  ]

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
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-green-900">Assinatura Ativa</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                {subscription.status}
              </Badge>
            </CardTitle>
            <CardDescription className="text-green-700">
              Plano: <span className="font-semibold capitalize">{subscription.plan}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-green-800">
            <p>
              Válido até:{" "}
              <span className="font-semibold">
                {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
              </span>
            </p>
            {subscription.cancel_at_period_end && (
              <p className="text-orange-700 font-medium">Cancelamento agendado para o fim do período</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn("relative border-slate-200", plan.popular && "border-2 border-blue-500 shadow-lg")}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4">Mais Popular</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-slate-900">{plan.name}</CardTitle>
              <CardDescription className="text-slate-600">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-600">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={cn(
                  "w-full",
                  plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-900 hover:bg-slate-800",
                )}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {subscription?.plan === plan.planId ? "Plano Atual" : "Assinar Agora"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

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

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
