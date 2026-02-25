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
          <Card className="relative overflow-hidden border-0 bg-slate-900 text-white shadow-2xl transition-transform hover:-translate-y-1 duration-300">
            {/* Soft decorative glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1.5 border-none shadow-lg font-medium">
                Mais Escolhido
              </Badge>
            </div>
            <CardContent className="p-8 relative z-10">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-white">R$ 89</span>
                  <span className="text-slate-400">/mês</span>
                </div>
                <p className="text-slate-300">Para advogados profissionais</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">Prazos ilimitados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">Processos ilimitados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">Gestão financeira completa</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">Relatórios e analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200">Suporte prioritário</span>
                </li>
              </ul>
              <Link href="/dashboard/subscription" className="block">
                <Button className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 font-semibold group transition-all">
                  Assinar Pro
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="mt-4 text-xs text-center text-slate-400">
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



