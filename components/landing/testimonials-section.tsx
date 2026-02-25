'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import gsap from 'gsap'

const testimonials = [
  {
    name: 'Dr. Carlos Silva',
    role: 'Advogado Autônomo',
    location: 'São Paulo, SP',
    content: 'O Themixa transformou minha rotina. Nunca mais perdi um prazo e consigo organizar todos os processos em um só lugar.',
    rating: 5,
  },
  {
    name: 'Dra. Ana Paula',
    role: 'Sócia do Escritório',
    location: 'Rio de Janeiro, RJ',
    content: 'A equipe adorou! Os alertas automáticos são essenciais e a interface é muito intuitiva. Recomendo para qualquer escritório.',
    rating: 5,
  },
  {
    name: 'Dr. Roberto Mendes',
    role: 'Advogado',
    location: 'Belo Horizonte, MG',
    content: 'Vale cada centavo. O sistema de prazos é impecável e me dá tranquilidade para focar no que realmente importa: os processos.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return

    let titleAnimated = false
    let cardsAnimated = false

    const cards = Array.from(cardsRef.current.children) as HTMLElement[]
    gsap.set(cards, { opacity: 0, scale: 0.9, y: 30 })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!titleAnimated && titleRef.current) {
              titleAnimated = true
              gsap.from(titleRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power3.out',
              })
            }
            if (!cardsAnimated) {
              cardsAnimated = true
              gsap.to(cards, {
                opacity: 1,
                scale: 1,
                y: 0,
                stagger: 0.15,
                duration: 0.8,
                ease: 'back.out(1.2)',
              })
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="bg-slate-50 py-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
            O que nossos clientes dizem
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Advogados que confiam no Themixa para gerenciar seus escritórios
          </p>
        </div>

        <div ref={cardsRef} className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-slate-200 bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-8">
                <div className="mb-6 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-8 text-slate-700 leading-relaxed italic text-lg line-clamp-4">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}



