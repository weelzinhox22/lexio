'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import gsap from 'gsap'

const showcases = [
  {
    title: 'Faça a gestão dos seus prazos e tarefas em um único lugar',
    description:
      'O Lexio atualiza você sobre prazos importantes e ajuda a organizar, delegar e acompanhar todas as tarefas do seu escritório. Nunca mais perca uma data importante.',
    features: [
      'Alertas automáticos de movimentações, prazos e tarefas iminentes',
      'Mais segurança e tranquilidade para você nunca perder uma data importante',
      'Eleve a produtividade e comunicação entre a equipe com uma gestão de tarefas eficiente',
    ],
    imagePlaceholder: 'Calendário visual com prazos e tarefas organizados',
    reverse: false,
  },
  {
    title: 'Evolua a comunicação compartilhando no WhatsApp',
    description:
      'Envie informações sobre audiências, tarefas, prazos e eventos de forma rápida e eficiente via WhatsApp. Mantenha seus clientes sempre informados.',
    features: [
      'Centralização da comunicação para otimizar seu tempo e esforços',
      'Tenha um atendimento ao cliente de excelência investindo na comunicação ativa',
      'Garanta que nenhuma informação importante para seu cliente seja esquecida',
    ],
    imagePlaceholder: 'Interface mostrando compartilhamento via WhatsApp',
    reverse: true,
  },
  {
    title: 'Emita boletos com PIX para uma gestão financeira mais profissional',
    description:
      'Facilite a gestão financeira do seu escritório gerando boletos integrados com PIX para recebimento de honorários de forma prática e segura.',
    features: [
      'Simplifique o processo de pagamento para os clientes e garanta seus honorários em dia',
      'Tenha uma visão clara e detalhada do fluxo de caixa e da saúde financeira do seu negócio',
      'Automatize lembretes de pagamento e profissionalize as suas cobranças',
    ],
    imagePlaceholder: 'Interface de gestão financeira com boletos e PIX',
    reverse: false,
  },
  {
    title: 'Tenha o controle de suas publicações e processos sem estresse',
    description:
      'Nossos sistemas buscam seus processos automaticamente. Depois você passa a receber as atualizações processuais de forma automática e organizada.',
    features: [
      'Liberte-se das tarefas repetitivas e se concentre em atividades de alto valor',
      'Você não precisa se preocupar, receba publicações e intimações automaticamente',
      'Minimize erros e aumente a eficiência utilizando a tecnologia a seu favor',
    ],
    imagePlaceholder: 'Dashboard de processos com publicações e atualizações',
    reverse: true,
  },
]

export function FeatureShowcase() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const items = sectionRef.current.querySelectorAll('.showcase-item')
    const observers: IntersectionObserver[] = []

    items.forEach((item) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.from(item, {
                opacity: 0,
                y: 80,
                duration: 0.8,
                ease: 'power3.out',
              })
              observer.unobserve(item)
            }
          })
        },
        { threshold: 0.2 },
      )
      observer.observe(item)
      observers.push(observer)
    })

    return () => {
      observers.forEach((obs) => obs.disconnect())
    }
  }, [])

  return (
    <section ref={sectionRef} className="bg-gradient-to-b from-white to-slate-50 py-24">
      <div className="container mx-auto px-6">
        {showcases.map((showcase, index) => (
          <div
            key={index}
            className={`mb-24 showcase-item flex flex-col gap-12 last:mb-0 lg:flex-row lg:items-center ${
              showcase.reverse ? 'lg:flex-row-reverse' : ''
            }`}
          >
            {/* Text Content */}
            <div className="flex-1">
              <h2 className="mb-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                {showcase.title}
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-slate-600">
                {showcase.description}
              </p>
              <ul className="mb-8 space-y-4">
                {showcase.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
                  Comece grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Image Placeholder */}
            <div className="flex-1">
              <div className="relative h-[400px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl">
                <div className="flex h-full items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mb-4 text-6xl">📊</div>
                    <p className="text-sm font-medium text-slate-500">
                      {showcase.imagePlaceholder}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      (Imagem será adicionada aqui)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

