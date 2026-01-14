'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

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
  return (
    <section className="bg-slate-50 py-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
            O que nossos clientes dizem
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Advogados que confiam no Themixa para gerenciar seus escritórios
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-slate-200 bg-white">
              <CardContent className="p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 text-slate-700 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                  <p className="text-xs text-slate-500">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}



