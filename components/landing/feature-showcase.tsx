'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import gsap from 'gsap'
import dynamic from 'next/dynamic'

// Carregar Lottie dinamicamente
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const showcases = [
  {
    title: 'Faça a gestão dos seus prazos e tarefas em um único lugar',
    description:
      'O Themixa atualiza você sobre prazos importantes e ajuda a organizar, delegar e acompanhar todas as tarefas do seu escritório. Nunca mais perca uma data importante.',
    features: [
      'Alertas automáticos de movimentações, prazos e tarefas iminentes',
      'Mais segurança e tranquilidade para você nunca perder uma data importante',
      'Eleve a produtividade e comunicação entre a equipe com uma gestão de tarefas eficiente',
    ],
    animationFile: '/calendar.json',
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
    animationFile: '/femaledashboard.json',
    reverse: true,
  },
]

export function FeatureShowcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const [animations, setAnimations] = useState<Record<string, any>>({})

  useEffect(() => {
    // Carregar todas as animações
    const loadAnimations = async () => {
      const animationPromises = showcases.map(async (showcase) => {
        if (showcase.animationFile) {
          try {
            const response = await fetch(showcase.animationFile)
            const data = await response.json()
            return { key: showcase.animationFile, data }
          } catch (error) {
            console.error(`Erro ao carregar ${showcase.animationFile}:`, error)
            return null
          }
        }
        return null
      })

      const results = await Promise.all(animationPromises)
      const animationsMap: Record<string, any> = {}
      results.forEach((result) => {
        if (result) {
          animationsMap[result.key] = result.data
        }
      })
      setAnimations(animationsMap)
    }

    loadAnimations()
  }, [])

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
                  <li key={featureIndex} className="flex items-start gap-3 group/item hover:translate-x-1 transition-transform duration-200">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-green-600 group-hover/item:scale-110 transition-transform" />
                    <span className="text-slate-700 group-hover/item:text-slate-900 transition-colors">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 hover:scale-105 hover:shadow-lg transition-all duration-300 text-white group">
                  Comece grátis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Animation */}
            <div className="flex-1 group/image">
              <div className="relative h-[400px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl group-hover/image:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />
                <div className="flex h-full items-center justify-center p-8 relative z-10">
                  {showcase.animationFile && animations[showcase.animationFile] ? (
                    <div className="w-full h-full">
                      <Lottie
                        animationData={animations[showcase.animationFile]}
                        loop={true}
                        autoplay={true}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  ) : (
                    <div className="text-center group-hover/image:scale-105 transition-transform duration-500">
                      <div className="mb-4 text-6xl group-hover/image:scale-110 transition-transform duration-300">📊</div>
                      <p className="text-sm font-medium text-slate-500 group-hover/image:text-slate-700 transition-colors">
                        Carregando animação...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
