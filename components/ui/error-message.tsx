"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info, AlertTriangle } from "lucide-react"
import { getUserFriendlyError, extractErrorType, type ErrorContext } from "@/lib/errors/user-friendly-errors"
import { Button } from "./button"
import Link from "next/link"

type ErrorMessageProps = {
  error: string | Error
  context?: ErrorContext
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function ErrorMessage({ error, context = 'generic', onRetry, onDismiss, className }: ErrorMessageProps) {
  const errorType = extractErrorType(error)
  const friendlyError = getUserFriendlyError(errorType, context)

  const Icon = friendlyError.severity === 'error' 
    ? AlertCircle 
    : friendlyError.severity === 'warning'
    ? AlertTriangle
    : Info

  const variant = friendlyError.severity === 'error' 
    ? 'destructive'
    : 'default'

  return (
    <Alert variant={variant} className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle className="font-semibold">{friendlyError.title}</AlertTitle>
      <AlertDescription className="space-y-2 mt-2">
        <div>
          <p className="font-medium mb-1">O que aconteceu:</p>
          <p className="text-sm">{friendlyError.what}</p>
        </div>
        <div>
          <p className="font-medium mb-1">Por que pode ter acontecido:</p>
          <p className="text-sm">{friendlyError.why}</p>
        </div>
        <div>
          <p className="font-medium mb-1">O que você pode fazer:</p>
          <p className="text-sm">{friendlyError.action}</p>
        </div>
        {(onRetry || context === 'email_send') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Tentar novamente
              </Button>
            )}
            {context === 'email_send' && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/settings/notifications">
                  Ver configurações
                </Link>
              </Button>
            )}
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                Fechar
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

