'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

export function CTAFinalSection() {
  return (
    <section className="bg-white border-t border-slate-200 py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-slate-900 sm:text-5xl">
            Pronto para nunca mais perder um prazo?
          </h2>
          <p className="mb-8 text-xl text-slate-600">
            Comece grátis hoje e veja como o Themixa pode transformar a gestão do seu escritório jurídico.
          </p>
          <div className="mb-8 flex flex-wrap justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Setup em menos de 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="h-14 bg-slate-900 text-white px-8 text-lg hover:bg-slate-800 hover:scale-105 hover:shadow-lg transition-all duration-300 group"
              >
                Criar conta grátis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="h-14 border-2 border-slate-300 text-slate-700 px-8 text-lg hover:bg-slate-50 hover:border-slate-400 hover:scale-105 transition-all duration-300"
              >
                Ver como funciona
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

