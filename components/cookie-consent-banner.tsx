'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePopups } from '@/lib/hooks/use-popups'

const CONSENT_KEY = 'themixa-cookie-consent'

export function CookieConsentBanner() {
    const { showPopups, markAsInteracted } = usePopups()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (showPopups && !visible) {
            const timer = setTimeout(() => setVisible(true), 1500)
            return () => clearTimeout(timer)
        } else if (!showPopups && visible) {
            setVisible(false)
        }
    }, [showPopups, visible])

    const handleAcceptAll = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({ all: true, date: new Date().toISOString() }))
        markAsInteracted()
        setVisible(false)
    }

    const handleAcceptEssential = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, date: new Date().toISOString() }))
        markAsInteracted()
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Icon + Text */}
                    <div className="flex gap-3 flex-1">
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                            <Cookie className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900">
                                Utilizamos cookies 🍪
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Usamos cookies essenciais para o funcionamento da plataforma e cookies de performance
                                para melhorar sua experiência. Ao clicar em "Aceitar todos", você concorda com o uso
                                conforme nossa{' '}
                                <Link href="/cookies" className="text-blue-600 underline underline-offset-2 hover:text-blue-800">
                                    Política de Cookies
                                </Link>
                                {' '}e{' '}
                                <Link href="/privacy" className="text-blue-600 underline underline-offset-2 hover:text-blue-800">
                                    Política de Privacidade
                                </Link>.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAcceptEssential}
                            className="flex-1 sm:flex-none text-xs border-slate-300"
                        >
                            Apenas essenciais
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleAcceptAll}
                            className="flex-1 sm:flex-none text-xs bg-slate-900 hover:bg-slate-800 text-white"
                        >
                            Aceitar todos
                        </Button>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={handleAcceptEssential}
                        className="absolute top-3 right-3 sm:static p-1 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="h-4 w-4 text-slate-400" />
                    </button>
                </div>
            </div>
        </div>
    )
}
