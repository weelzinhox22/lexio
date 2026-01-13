'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function PricingTeaserSection() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
            Planos que cabem no seu bolso
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Comece grátis e upgrade quando precisar de mais recursos
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2 border-slate-200 bg-white">
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-slate-900">R$ 0</span>
                  <span className="text-slate-600">/mês</span>
                </div>
                <p className="text-slate-600">Perfeito para começar</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Até 10 prazos ativos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Alertas automáticos por e-mail</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Gestão básica de processos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Suporte por e-mail</span>
                </li>
              </ul>
              <Link href="/auth/sign-up" className="block">
                <Button variant="outline" className="w-full h-12 border-2">
                  Começar grátis
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-blue-600 text-white px-4 py-1">
                Mais Escolhido
              </Badge>
            </div>
            <CardContent className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-slate-900">R$ 89</span>
                  <span className="text-slate-600">/mês</span>
                </div>
                <p className="text-slate-600">Para advogados profissionais</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Prazos ilimitados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Processos ilimitados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Gestão financeira completa</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Relatórios e analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Suporte prioritário</span>
                </li>
              </ul>
              <Link href="/dashboard/subscription" className="block">
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white group">
                  Assinar Pro
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="mt-3 text-xs text-center text-slate-500">
                Cancele quando quiser • Sem compromisso
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Link href="/dashboard/subscription">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              Ver todos os planos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}


