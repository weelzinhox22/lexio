'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import gsap from 'gsap'

const faqs = [
  {
    question: 'Como funciona o período de teste gratuito?',
    answer:
      'Você tem 7 dias grátis para testar todas as funcionalidades do Lexio. Não é necessário cartão de crédito para começar. Após o período de teste, você pode escolher um dos nossos planos ou cancelar sem custos.',
  },
  {
    question: 'Meus dados estão seguros no Lexio?',
    answer:
      'Sim! Utilizamos criptografia de ponta a ponta, backup automático em nuvem e seguimos os mais altos padrões de segurança. Seus dados são protegidos com Row Level Security (RLS) e nunca são compartilhados com terceiros.',
  },
  {
    question: 'Posso integrar com outros sistemas?',
    answer:
      'Sim, o Lexio oferece integrações com WhatsApp, sistemas de pagamento e APIs para conectar com outros softwares jurídicos. Estamos sempre expandindo nossas integrações.',
  },
  {
    question: 'Como funciona o sistema de notificações via WhatsApp?',
    answer:
      'O Lexio envia automaticamente alertas de prazos, lembretes de pagamento e atualizações de processos via WhatsApp. Você pode configurar os horários e tipos de notificações que deseja receber.',
  },
  {
    question: 'Posso usar o Lexio em múltiplos dispositivos?',
    answer:
      'Sim! O Lexio é uma plataforma web responsiva que funciona perfeitamente em computadores, tablets e smartphones. Acesse seus dados de qualquer lugar, a qualquer hora.',
  },
  {
    question: 'E se eu precisar de suporte?',
    answer:
      'Oferecemos suporte via chat, email e documentação completa. Nossa equipe está sempre pronta para ajudar você a aproveitar ao máximo todas as funcionalidades do Lexio.',
  },
  {
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer:
      'Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas. Seus dados permanecerão acessíveis até o final do período pago.',
  },
  {
    question: 'O Lexio funciona offline?',
    answer:
      'O Lexio é uma plataforma baseada em nuvem que requer conexão com a internet. Isso garante que seus dados estejam sempre sincronizados e seguros, além de permitir acesso de qualquer dispositivo.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    let titleAnimated = false
    let itemsAnimated = false

    // Define estado inicial dos items como invisível
    const items = Array.from(sectionRef.current.querySelectorAll('.faq-item')) as HTMLElement[]
    gsap.set(items, { opacity: 0, y: 30 })

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

    const itemsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !itemsAnimated) {
            itemsAnimated = true
            gsap.to(items, {
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
    if (sectionRef.current) itemsObserver.observe(sectionRef.current)

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
      if (!itemsAnimated) {
        itemsAnimated = true
        gsap.to(items, {
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
      itemsObserver.disconnect()
    }
  }, [])

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section ref={sectionRef} id="faq" className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div ref={titleRef} className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
            Perguntas Frequentes
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Tire suas dúvidas sobre o Lexio e descubra como podemos ajudar seu escritório
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="faq-item overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-semibold text-slate-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300',
                    openIndex === index && 'rotate-180',
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
                )}
              >
                <div className="px-6 pb-6 text-slate-600 leading-relaxed">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

