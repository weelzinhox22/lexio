'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Briefcase,
  Users,
  Bell,
  DollarSign,
  FileText,
  BarChart3,
  MessageSquare,
  Calendar,
  Shield,
  Zap,
} from 'lucide-react'
import gsap from 'gsap'

const features = [
  {
    icon: Briefcase,
    title: 'Gestão de Processos',
    description:
      'Acompanhe todos os seus processos com informações completas, andamentos e atualizações automáticas. Timeline detalhada e controle total.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Bell,
    title: 'Controle de Prazos',
    description:
      'Nunca perca um prazo novamente. Alertas automáticos via WhatsApp, calendário integrado e categorização por prioridade.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Users,
    title: 'CRM de Clientes',
    description:
      'Gerencie seus clientes, leads e relacionamentos de forma profissional. Pipeline de vendas com conversão e histórico completo.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: DollarSign,
    title: 'Gestão Financeira',
    description:
      'Controle de receitas, despesas, honorários e custas processuais. Relatórios financeiros e controle de inadimplência.',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: FileText,
    title: 'Documentos',
    description:
      'Upload e organização inteligente de documentos. Categorização automática, busca avançada e vinculação com processos.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: MessageSquare,
    title: 'Notificações WhatsApp',
    description:
      'Alertas automáticos de prazos, lembretes de pagamento e atualizações de processos. Comunicação direta com seus clientes.',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
  {
    icon: BarChart3,
    title: 'Relatórios & Analytics',
    description:
      'Dashboard com KPIs, relatórios financeiros, análise de processos e métricas de performance. Tome decisões baseadas em dados.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description:
      'Calendário visual de compromissos, audiências e reuniões. Sincronização automática e lembretes personalizados.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    icon: Shield,
    title: 'Segurança Avançada',
    description:
      'Seus dados protegidos com criptografia de ponta a ponta, backup automático em nuvem e controle de acesso granular.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    icon: Zap,
    title: 'Automação Inteligente',
    description:
      'Economize tempo com automações e integrações. Cron jobs automáticos, sincronização com tribunais e muito mais.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return

    let titleAnimated = false
    let cardsAnimated = false

    // Define estado inicial dos cards como invisível
    const cards = Array.from(cardsRef.current.children) as HTMLElement[]
    gsap.set(cards, { opacity: 0, y: 60 })

    const titleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && titleRef.current && !titleAnimated) {
            titleAnimated = true
            gsap.from(titleRef.current, {
              opacity: 0,
              y: 50,
              duration: 0.8,
              ease: 'power3.out',
            })
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    )

    const cardsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !cardsAnimated) {
            cardsAnimated = true
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              stagger: 0.08,
              duration: 0.6,
              ease: 'power2.out',
            })
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -100px 0px' },
    )

    if (titleRef.current) titleObserver.observe(titleRef.current)
    if (cardsRef.current) cardsObserver.observe(cardsRef.current)

    // Fallback: se não detectar, anima após 800ms
    const fallbackTimer = setTimeout(() => {
      if (!titleAnimated && titleRef.current) {
        titleAnimated = true
        gsap.from(titleRef.current, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: 'power3.out',
        })
      }
      if (!cardsAnimated) {
        cardsAnimated = true
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power2.out',
        })
      }
    }, 800)

    return () => {
      clearTimeout(fallbackTimer)
      titleObserver.disconnect()
      cardsObserver.disconnect()
    }
  }, [])

  return (
    <section ref={sectionRef} id="features" className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Recursos poderosos para otimizar seu escritório jurídico e aumentar sua
            produtividade
          </p>
        </div>

        <div ref={cardsRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 cursor-pointer"
            >
              <CardContent className="p-6">
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.color} transition-transform duration-300 group-hover:scale-110`} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-slate-600 group-hover:text-slate-700 transition-colors">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

