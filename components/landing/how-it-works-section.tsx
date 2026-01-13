'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import gsap from 'gsap'

const steps = [
  {
    number: '1',
    title: 'Criar processo',
    description: 'Cadastre seus processos em segundos. Busque automaticamente no DataJud ou adicione manualmente.',
    icon: '📋',
  },
  {
    number: '2',
    title: 'Definir prazos',
    description: 'O sistema calcula automaticamente os prazos processuais ou você define manualmente. Simples assim.',
    icon: '⏰',
  },
  {
    number: '3',
    title: 'Receber alertas automáticos',
    description: 'Você recebe alertas por e-mail em 7, 3, 1 dia e no dia do prazo. Nós cuidamos dos alertas, você cuida do processo.',
    icon: '🔔',
  },
]

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return

    const cards = Array.from(cardsRef.current.children) as HTMLElement[]
    gsap.set(cards, { opacity: 0, y: 40 })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              stagger: 0.15,
              duration: 0.6,
              ease: 'power2.out',
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
            Como funciona
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Em 3 passos simples, você nunca mais perde um prazo importante
          </p>
        </div>

        <div ref={cardsRef} className="grid gap-6 md:grid-cols-3 mb-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Número no topo */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white text-lg font-semibold">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-full h-0.5 bg-slate-200 -z-10" />
                )}
              </div>
              
              {/* Card minimalista */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-md group-hover:-translate-y-1">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="h-14 bg-blue-600 px-8 text-lg hover:bg-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-300 text-white group"
            >
              Começar grátis agora
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-slate-500">
            Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  )
}

