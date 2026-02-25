'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[Page Error]:', error)
    }, [error])

    return (
        <div className="flex min-h-[60vh] w-full flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center text-center max-w-md">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 mb-6">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3">
                    Erro ao carregar a página
                </h2>
                <p className="text-slate-600 mb-6">
                    Ocorreu um problema inesperado. Tente recarregar a página.
                </p>
                {error?.digest && (
                    <p className="text-xs text-slate-400 font-mono mb-6">
                        Código: {error.digest}
                    </p>
                )}
                <div className="flex gap-3">
                    <Button
                        onClick={reset}
                        variant="outline"
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Tentar novamente
                    </Button>
                    <Link href="/dashboard">
                        <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white">
                            <Home className="h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
