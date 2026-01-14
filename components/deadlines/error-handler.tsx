"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Mail } from "lucide-react"
import { useState } from "react"

type ErrorInfo = {
  deadlineId?: string
  errorMessage: string
  errorType: 'temporary' | 'invalid_email' | 'unknown'
}

export function ErrorHandler({ error, onRetry, onDismiss }: {
  error: ErrorInfo | null
  onRetry?: () => void
  onDismiss?: () => void
}) {
  const [retrying, setRetrying] = useState(false)

  if (!error) return null

  const getErrorExplanation = () => {
    switch (error.errorType) {
      case 'temporary':
        return 'Ocorreu um problema temporário ao enviar o alerta. Isso geralmente se resolve automaticamente.'
      case 'invalid_email':
        return 'O endereço de e-mail configurado parece estar inválido ou inativo. Verifique suas configurações.'
      default:
        return 'Ocorreu um erro inesperado ao enviar o alerta.'
    }
  }

  const getErrorSolution = () => {
    switch (error.errorType) {
      case 'temporary':
        return 'O sistema tentará enviar novamente automaticamente. Se o problema persistir, entre em contato com o suporte.'
      case 'invalid_email':
        return 'Verifique se o e-mail está correto em Configurações > Notificações. Você também pode adicionar um e-mail alternativo como fallback.'
      default:
        return 'Tente novamente ou entre em contato com o suporte se o problema persistir.'
    }
  }

  const handleRetry = async () => {
    if (!onRetry) return
    
    setRetrying(true)
    try {
      await onRetry()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <AlertDialog open={!!error} onOpenChange={() => onDismiss?.()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-red-100 p-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">Não foi possível enviar o alerta por e-mail</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-600 space-y-3 pt-2">
            <p>{getErrorExplanation()}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-900">
                <strong>O que fazer:</strong>
              </p>
              <p className="text-sm text-amber-800 mt-1">{getErrorSolution()}</p>
            </div>
            {error.errorMessage && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                <p className="text-xs text-slate-600 font-mono break-all">
                  {error.errorMessage}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onDismiss} className="w-full sm:w-auto">
            Fechar
          </AlertDialogCancel>
          {onRetry && (
            <Button
              onClick={handleRetry}
              disabled={retrying}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              {retrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Tentando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar novamente
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard/settings/notifications'}
            className="w-full sm:w-auto"
          >
            <Mail className="mr-2 h-4 w-4" />
            Ver configurações
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}



