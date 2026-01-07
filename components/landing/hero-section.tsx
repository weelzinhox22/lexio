'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Scale, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import gsap from 'gsap'

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroRef.current) return

    const ctx = gsap.context(() => {
      // Animação da imagem (esquerda)
      gsap.from(imageRef.current, {
        opacity: 0,
        x: -50,
        duration: 1,
        ease: 'power3.out',
      })

      // Animação do título (direita)
      gsap.from(titleRef.current, {
        opacity: 0,
        x: 50,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      })

      // Animação do subtítulo
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.4,
        ease: 'power3.out',
      })

      // Animação dos botões
      gsap.from(buttonsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.6,
        ease: 'power2.out',
      })

      // Animação dos features
      gsap.from(featuresRef.current?.children || [], {
        opacity: 0,
        x: 20,
        stagger: 0.1,
        duration: 0.6,
        delay: 0.8,
        ease: 'power2.out',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-white pt-32 pb-24"
    >
      <div className="container mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Imagem - Lado Esquerdo */}
          <div ref={imageRef} className="order-2 lg:order-1">
            <div className="relative">
              <img
                src="/person-hero.webp"
                alt="Advogado usando o Lexio"
                className="w-full h-auto rounded-2xl object-cover shadow-2xl"
              />
            </div>
          </div>

          {/* Texto - Lado Direito */}
          <div className="order-1 lg:order-2">
            <h1
              ref={titleRef}
              className="mb-6 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl"
            >
              Prático, inteligente e funcional.
              <br />
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Tenha mais tranquilidade na advocacia
              </span>
              <br />
              <span className="text-blue-600">com o Lexio</span>
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
                <Button size="lg" className="h-14 bg-slate-900 px-8 text-lg hover:bg-slate-800 text-white">
                  Experimentar grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-2 border-slate-300 bg-transparent px-8 text-lg hover:bg-slate-50"
                >
                  Conheça o Lexio
                </Button>
              </Link>
            </div>

            <div
              ref={featuresRef}
              className="flex flex-wrap items-center gap-6 text-sm text-slate-600 sm:gap-8"
            >
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>7 dias grátis para testar</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Sem necessidade de cartão</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

