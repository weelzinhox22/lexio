'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import gsap from 'gsap'
import dynamic from 'next/dynamic'

// Carregar Lottie dinamicamente
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const [animationData, setAnimationData] = useState<any>(null)

  useEffect(() => {
    // Carregar a animação Lottie
    fetch('/officeteam.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Erro ao carregar animação:', err))
  }, [])

  useEffect(() => {
    if (!heroRef.current) return

    const ctx = gsap.context(() => {
      // Animação do título
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out',
      })

      // Animação do subtítulo
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.5,
        ease: 'power3.out',
      })

      // Animação dos botões
      gsap.from(buttonsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.7,
        ease: 'power2.out',
      })

      // Animação dos features
      gsap.from(featuresRef.current?.children || [], {
        opacity: 0,
        x: 20,
        stagger: 0.1,
        duration: 0.6,
        delay: 0.9,
        ease: 'power2.out',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] overflow-hidden flex items-center bg-white pt-32 pb-24"
    >
      <div className="container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Texto - Lado Esquerdo */}
          <div className="order-1">
            <h1
              ref={titleRef}
              className="mb-6 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl"
            >
              Prático, inteligente e funcional.
              <br />
              <span className="text-slate-900">
                Tenha mais tranquilidade na advocacia
              </span>
              <br />
              <span className="text-blue-600">com o Themixa</span>
            </h1>

            <p
              ref={subtitleRef}
              className="mb-8 text-lg leading-relaxed text-slate-600 sm:text-xl"
            >
              A combinação entre tecnologia e facilidade de uso para manter seu escritório
              automatizado e eficiente do início ao fim. Tudo em um só lugar, acessível de
              onde estiver.
            </p>

            <div ref={buttonsRef} className="mb-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/auth/sign-up">
                <Button 
                  size="lg" 
                  className="h-14 bg-slate-900 px-8 text-lg hover:bg-slate-800 hover:scale-105 hover:shadow-lg transition-all duration-300 text-white group"
                >
                  Experimentar grátis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-2 border-slate-300 bg-transparent px-8 text-lg hover:bg-slate-50 hover:border-slate-400 hover:scale-105 hover:shadow-md transition-all duration-300 text-slate-900"
                >
                  Conheça o Themixa
                </Button>
              </Link>
            </div>

            <div
              ref={featuresRef}
              className="flex flex-wrap items-center gap-6 text-sm text-slate-600 sm:gap-8"
            >
              <div className="flex items-center gap-2 hover:text-slate-900 transition-colors cursor-default group">
                <Check className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                <span>7 dias grátis para testar</span>
              </div>
              <div className="flex items-center gap-2 hover:text-slate-900 transition-colors cursor-default group">
                <Check className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                <span>Sem necessidade de cartão</span>
              </div>
              <div className="flex items-center gap-2 hover:text-slate-900 transition-colors cursor-default group">
                <Check className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>

          {/* Animação Lottie - Lado Direito */}
          <div className="order-2 flex items-center justify-center">
            {animationData && (
              <div className="w-full max-w-5xl h-auto">
                <Lottie
                  animationData={animationData}
                  loop={true}
                  autoplay={true}
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    maxHeight: '900px'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
