'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubscriptionPlansProps {
  currentPlan?: string
}

const plans = [
  {
    name: 'Básico',
    price: 'R$ 89',
    period: '/mês',
    description: 'Ideal para advogados autônomos',
    features: [
      'Até 50 processos ativos',
      'Gestão de clientes',
      'Controle de prazos',
      'Gestão financeira básica',
      '2GB de armazenamento',
      'Suporte por email',
    ],
    popular: false,
    planId: 'basic',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || 'price_basic',
  },
  {
    name: 'Premium',
    price: 'R$ 174,99',
    period: '/mês',
    description: 'Para escritórios em crescimento',
    features: [
      'Processos ilimitados',
      'Gestão completa de clientes',
      'Controle avançado de prazos',
      'Gestão financeira completa',
      'CRM e pipeline de leads',
      '50GB de armazenamento',
      'Notificações WhatsApp',
      'Relatórios e analytics',
      'Suporte prioritário',
    ],
    popular: true,
    planId: 'premium',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'price_premium',
  },
  {
    name: 'Enterprise',
    price: 'R$ 260',
    period: '/mês',
    description: 'Para grandes escritórios',
    features: [
      'Tudo do Premium +',
      'Usuários ilimitados',
      'Armazenamento ilimitado',
      'API de integração',
      'Suporte dedicado 24/7',
      'Treinamento personalizado',
      'White label',
      'SLA garantido',
    ],
    popular: false,
    planId: 'enterprise',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
  },
]

export function SubscriptionPlans({ currentPlan }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (planId: string, priceId: string) => {
    setLoading(planId)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, priceId }),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar checkout')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error('URL de checkout não retornada')
      }
    } catch (error) {
      console.error('[Checkout Error]:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => {
        const isCurrentPlan = currentPlan === plan.planId
        const isLoading = loading === plan.planId

        return (
          <Card
            key={plan.name}
            className={cn(
              'relative border-2 transition-all duration-300 hover:shadow-xl',
              plan.popular
                ? 'border-blue-500 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 scale-105'
                : 'border-slate-200 hover:border-slate-300 bg-white',
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 shadow-md">
                  Mais Popular
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-slate-900 mb-2">{plan.name}</CardTitle>
              <CardDescription className="text-slate-600 text-base">{plan.description}</CardDescription>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-600 text-lg">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="rounded-full bg-green-100 p-1 mt-0.5 shrink-0">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="flex-1">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleCheckout(plan.planId, plan.priceId)}
                disabled={isCurrentPlan || isLoading}
                className={cn(
                  'w-full h-12 text-base font-semibold transition-all duration-300',
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-slate-900 hover:bg-slate-800 text-white hover:scale-105',
                  isCurrentPlan && 'bg-slate-400 hover:bg-slate-400 cursor-not-allowed',
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    {isCurrentPlan ? 'Plano Atual' : 'Assinar Agora'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

