'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Scale, RefreshCw, Home, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        console.error('[Global Error]:', error)
    }, [error])

    return (
        <html lang="pt-BR">
            <body className="font-sans antialiased">
                <div
                    ref={containerRef}
                    className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 relative overflow-hidden"
                >
                    {/* Decorative blurs */}
                    <div className="absolute top-20 left-10 w-72 h-72 bg-red-50 rounded-full opacity-40 blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-64 h-64 bg-slate-100 rounded-full opacity-50 blur-3xl" />

                    {/* Header */}
                    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
                        <div className="container mx-auto flex h-16 items-center justify-between px-6">
                            <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                                    <Scale className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-lg font-bold text-slate-900">Themixa</span>
                            </Link>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                        <div className="mb-8">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 mb-6 mx-auto">
                                <AlertTriangle className="h-10 w-10 text-red-600" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                                Algo deu errado
                            </h1>
                            <p className="text-slate-600 text-lg leading-relaxed max-w-md mx-auto mb-2">
                                Ocorreu um erro inesperado. Nossa equipe já foi notificada e estamos trabalhando para resolver.
                            </p>
                            {error?.digest && (
                                <p className="text-xs text-slate-400 font-mono mt-2">
                                    Código: {error.digest}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Button
                                onClick={reset}
                                size="lg"
                                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 hover:scale-105 hover:shadow-lg transition-all duration-300 text-white group gap-2"
                            >
                                <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                                Tentar novamente
                            </Button>
                            <Link href="/">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 hover:scale-105 transition-all duration-300 gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Ir para o início
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-12 text-sm text-slate-500">
                            <p>
                                Se o problema persistir, entre em contato:{' '}
                                <a href="mailto:contato@themixa.com.br" className="text-blue-600 hover:underline">
                                    contato@themixa.com.br
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}
