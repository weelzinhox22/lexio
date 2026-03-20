'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scale, Home, ArrowLeft, Search } from 'lucide-react'
import gsap from 'gsap'

export default function NotFound() {
    const containerRef = useRef<HTMLDivElement>(null)
    const numberRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const actionsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const ctx = gsap.context(() => {
            // Animate the 404 number
            gsap.from(numberRef.current, {
                opacity: 0,
                scale: 0.5,
                duration: 0.8,
                ease: 'back.out(1.7)',
            })

            // Animate the text content
            gsap.from(textRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.6,
                delay: 0.3,
                ease: 'power3.out',
            })

            // Animate the action buttons
            gsap.from(actionsRef.current, {
                opacity: 0,
                y: 20,
                duration: 0.6,
                delay: 0.5,
                ease: 'power2.out',
            })

            // Floating animation for the 404
            gsap.to(numberRef.current, {
                y: -10,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div
            ref={containerRef}
            className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 relative overflow-hidden"
        >
            {/* Decorative background elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-50 rounded-full opacity-40 blur-3xl" />
            <div className="absolute bottom-20 right-10 w-64 h-64 bg-slate-100 rounded-full opacity-50 blur-3xl" />
            <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-blue-100 rounded-full opacity-20 blur-3xl" />

            {/* Header */}
            <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                        <img
                            src="/logo.png"
                            alt="Themixa Logo"
                            className="h-30 w-auto group-hover:scale-110 transition-transform duration-300"
                        />
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 text-slate-700 hover:text-slate-900">
                            <ArrowLeft className="h-4 w-4" />
                            Voltar ao início
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                {/* 404 Number */}
                <div ref={numberRef} className="mb-8">
                    <div className="relative">
                        <span className="text-[10rem] sm:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-400 leading-none select-none">
                            404
                        </span>
                        <div className="absolute inset-0 text-[10rem] sm:text-[12rem] font-black text-slate-100 leading-none -z-10 translate-x-1 translate-y-1 select-none">
                            404
                        </div>
                    </div>
                </div>

                {/* Text */}
                <div ref={textRef} className="mb-10 space-y-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        Página não encontrada
                    </h1>
                    <p className="text-slate-600 text-lg leading-relaxed max-w-md mx-auto">
                        A página que você está procurando não existe, foi removida ou o endereço está incorreto.
                    </p>
                </div>

                {/* Actions */}
                <div ref={actionsRef} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link href="/">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 hover:scale-105 hover:shadow-lg transition-all duration-300 text-white group gap-2"
                        >
                            <Home className="h-4 w-4" />
                            Ir para o início
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full sm:w-auto border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 hover:scale-105 transition-all duration-300 gap-2"
                        >
                            <Scale className="h-4 w-4" />
                            Acessar dashboard
                        </Button>
                    </Link>
                </div>

                {/* Helpful links */}
                <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
                    <Link href="/auth/login" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                        <ArrowLeft className="h-3 w-3" /> Login
                    </Link>
                    <Link href="/#features" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                        <Search className="h-3 w-3" /> Funcionalidades
                    </Link>
                    <Link href="/#faq" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                        <Search className="h-3 w-3" /> FAQ
                    </Link>
                    <a href="mailto:contato@themixa.com.br" className="hover:text-slate-900 transition-colors">
                        Contato
                    </a>
                </div>
            </div>
        </div>
    )
}
