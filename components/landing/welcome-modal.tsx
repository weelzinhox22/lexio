'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import Link from 'next/link'
import { useGsapFadeIn } from '@/lib/hooks/useGsapAnimation'

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useGsapFadeIn(0.2)

  useEffect(() => {
    // Verifica se o usuário já fechou o modal antes
    const hasSeenModal = localStorage.getItem('themixa-welcome-modal-seen')
    if (!hasSeenModal) {
      // Aguarda um pouco antes de mostrar
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('themixa-welcome-modal-seen', 'true')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative mx-4 w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900">
            <span className="text-2xl font-bold text-white">T</span>
          </div>

          <h2 className="mb-4 text-3xl font-bold text-slate-900">
            Bem-vindo ao Themixa
          </h2>

          <p className="mb-2 text-lg text-slate-600">
            Em 2026, experimente uma advocacia mais leve e no seu ritmo.
          </p>

          <p className="mb-6 text-slate-500">
            Gerencie processos, clientes, prazos e finanças em uma única plataforma.
            Tudo que você precisa para transformar seu escritório jurídico.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/auth/sign-up" onClick={handleClose} className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                Começar grátis
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={handleClose}
              className="w-full border-slate-300 sm:w-auto"
            >
              Explorar primeiro
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

