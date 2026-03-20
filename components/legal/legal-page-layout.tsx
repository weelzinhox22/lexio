'use client'

import { useEffect, useRef, ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Scale } from 'lucide-react'
import gsap from 'gsap'

interface LegalPageLayoutProps {
    title: string
    subtitle: string
    lastUpdated: string
    icon: ReactNode
    children: ReactNode
    tocItems?: { id: string; label: string }[]
}

export function LegalPageLayout({
    title,
    subtitle,
    lastUpdated,
    icon,
    children,
    tocItems,
}: LegalPageLayoutProps) {
    const heroRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const subtitleRef = useRef<HTMLParagraphElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const tocRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!heroRef.current) return

        const ctx = gsap.context(() => {
            gsap.from(titleRef.current, {
                opacity: 0,
                y: 30,
                duration: 1,
                delay: 0.2,
                ease: 'power3.out',
            })

            gsap.from(subtitleRef.current, {
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay: 0.4,
                ease: 'power3.out',
            })

            if (tocRef.current) {
                gsap.from(tocRef.current, {
                    opacity: 0,
                    x: -20,
                    duration: 0.6,
                    delay: 0.6,
                    ease: 'power2.out',
                })
            }

            if (contentRef.current) {
                const sections = contentRef.current.querySelectorAll('.legal-section')
                gsap.from(sections, {
                    opacity: 0,
                    y: 20,
                    stagger: 0.08,
                    duration: 0.6,
                    delay: 0.5,
                    ease: 'power2.out',
                })
            }
        }, heroRef)

        return () => ctx.revert()
    }, [])

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2 group/logo hover:opacity-80 transition-opacity">
                        <img
                            src="/logo.png"
                            alt="Themixa Logo"
                            className="h-30 w-auto group-hover/logo:scale-110 transition-transform duration-300"
                        />
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Voltar ao início
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <div ref={heroRef}>
                <section className="relative pt-32 pb-16 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-20 left-10 w-64 h-64 bg-blue-50 rounded-full opacity-30 blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-48 h-48 bg-slate-100 rounded-full opacity-40 blur-3xl" />

                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white mb-6 shadow-lg">
                                {icon}
                            </div>
                            <h1
                                ref={titleRef}
                                className="text-4xl font-bold text-slate-900 sm:text-5xl mb-4"
                            >
                                {title}
                            </h1>
                            <p
                                ref={subtitleRef}
                                className="text-lg text-slate-600 max-w-2xl mx-auto mb-4"
                            >
                                {subtitle}
                            </p>
                            <p className="text-sm text-slate-400">
                                Última atualização: {lastUpdated}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16">
                    <div className="container mx-auto px-6">
                        <div className="max-w-5xl mx-auto flex gap-12">
                            {/* Table of Contents - desktop sidebar */}
                            {tocItems && tocItems.length > 0 && (
                                <aside
                                    ref={tocRef}
                                    className="hidden lg:block w-64 shrink-0"
                                >
                                    <div className="sticky top-24">
                                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                                            Índice
                                        </h3>
                                        <nav className="space-y-1">
                                            {tocItems.map((item) => (
                                                <a
                                                    key={item.id}
                                                    href={`#${item.id}`}
                                                    className="block text-sm text-slate-500 hover:text-slate-900 hover:translate-x-1 transition-all py-1.5 border-l-2 border-transparent hover:border-slate-900 pl-3"
                                                >
                                                    {item.label}
                                                </a>
                                            ))}
                                        </nav>
                                    </div>
                                </aside>
                            )}

                            {/* Main content */}
                            <div ref={contentRef} className="flex-1 min-w-0">
                                <div className="prose prose-slate prose-lg max-w-none
                  prose-headings:scroll-mt-24
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:text-slate-900 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-3 prose-h2:mb-6
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:text-slate-800
                  prose-p:text-slate-600 prose-p:leading-relaxed
                  prose-li:text-slate-600
                  prose-strong:text-slate-900
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                ">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* CTA Footer */}
            <section className="border-t border-slate-200 bg-slate-50 py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Tem alguma dúvida?
                        </h2>
                        <p className="text-slate-600 mb-8">
                            Nossa equipe está disponível para esclarecer qualquer questão sobre nossos termos e políticas.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="mailto:contato@themixa.com.br">
                                <Button variant="outline" className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all">
                                    Fale Conosco
                                </Button>
                            </a>
                            <Link href="/auth/sign-up">
                                <Button className="bg-slate-900 hover:bg-slate-800 hover:scale-105 hover:shadow-lg transition-all duration-300 text-white group">
                                    Começar grátis
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mini footer */}
            <footer className="border-t border-slate-200 bg-white py-6">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900">
                                <Scale className="h-3 w-3 text-white" />
                            </div>
                            <span>© {new Date().getFullYear()} Themixa. Todos os direitos reservados.</span>
                        </div>
                        <nav className="flex gap-6">
                            <Link href="/terms" className="hover:text-slate-900 transition-colors">Termos</Link>
                            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacidade</Link>
                            <Link href="/lgpd" className="hover:text-slate-900 transition-colors">LGPD</Link>
                            <Link href="/cookies" className="hover:text-slate-900 transition-colors">Cookies</Link>
                        </nav>
                    </div>
                </div>
            </footer>
        </div>
    )
}
