/**
 * Retry automático com fallback de e-mail
 * 
 * Implementa:
 * - 1 tentativa extra automática
 * - Apenas para erros transitórios
 * - Fallback para e-mail alternativo
 * - Logs padronizados
 */

import { sendEmail, SendEmailResult } from './brevo'
import { deadlineAlertEmail } from './templates/alerts'

export type ErrorType = 'temporary' | 'permanent'

export type RetryLog = {
  alert_id: string
  user_id: string
  deadline_id: string | null
  provider: 'brevo'
  error_type: ErrorType
  error_code?: string
  attempt: 1 | 2
  fallback_used: boolean
  timestamp: string
  final_status: 'sent' | 'failed'
  email_used: string
}

/**
 * Determina se um erro é transitório (pode tentar novamente)
 */
function isTransientError(error: string): boolean {
  const transientKeywords = [
    'timeout',
    'network',
    'connection',
    'rate limit',
    'too many requests',
    '503',
    '502',
    '504',
    '500',
    '429',
  ]
  
  const errorLower = error.toLowerCase()
  return transientKeywords.some(keyword => errorLower.includes(keyword))
}

/**
 * Extrai código de erro do Brevo
 */
function extractErrorCode(error: string): string | undefined {
  // Brevo retorna códigos como "invalid_parameter" ou status HTTP
  const match = error.match(/\b(\d{3})\b/) // Código HTTP
  if (match) return match[1]
  
  const codeMatch = error.match(/\[(\w+)\]/) // Código entre colchetes
  if (codeMatch) return codeMatch[1]
  
  return undefined
}

/**
 * Envia e-mail com retry automático e fallback
 */
export async function sendEmailWithRetryAndFallback(params: {
  to: string
  fallbackEmail: string | null
  subject: string
  html: string
  alertId: string
  userId: string
  deadlineId: string | null
}): Promise<{
  ok: boolean
  messageId?: string
  error?: string
  log: RetryLog
}> {
  const { to, fallbackEmail, subject, html, alertId, userId, deadlineId } = params
  const timestamp = new Date().toISOString()
  
  // Tentativa 1: E-mail principal
  const attempt1 = await sendEmail({ to, subject, html })
  
  if (attempt1.ok) {
    return {
      ok: true,
      messageId: attempt1.messageId,
      log: {
        alert_id: alertId,
        user_id: userId,
        deadline_id: deadlineId,
        provider: 'brevo',
        error_type: 'temporary',
        attempt: 1,
        fallback_used: false,
        timestamp,
        final_status: 'sent',
        email_used: to,
      },
    }
  }
  
  // Erro na tentativa 1
  const errorType: ErrorType = isTransientError(attempt1.error) ? 'temporary' : 'permanent'
  const errorCode = extractErrorCode(attempt1.error)
  
  // Se não for erro transitório, não tenta retry
  if (errorType === 'permanent') {
    // Mas pode tentar fallback se houver
    if (fallbackEmail && fallbackEmail.trim() && fallbackEmail !== to) {
      const fallbackAttempt = await sendEmail({ to: fallbackEmail, subject, html })
      
      if (fallbackAttempt.ok) {
        return {
          ok: true,
          messageId: fallbackAttempt.messageId,
          log: {
            alert_id: alertId,
            user_id: userId,
            deadline_id: deadlineId,
            provider: 'brevo',
            error_type: 'permanent',
            error_code: errorCode,
            attempt: 1,
            fallback_used: true,
            timestamp,
            final_status: 'sent',
            email_used: fallbackEmail,
          },
        }
      }
    }
    
    return {
      ok: false,
      error: attempt1.error,
      log: {
        alert_id: alertId,
        user_id: userId,
        deadline_id: deadlineId,
        provider: 'brevo',
        error_type: 'permanent',
        error_code: errorCode,
        attempt: 1,
        fallback_used: fallbackEmail ? true : false,
        timestamp,
        final_status: 'failed',
        email_used: to,
      },
    }
  }
  
  // Erro transitório: tentar retry (tentativa 2)
  // Aguardar 2 segundos antes do retry
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const attempt2 = await sendEmail({ to, subject, html })
  
  if (attempt2.ok) {
    return {
      ok: true,
      messageId: attempt2.messageId,
      log: {
        alert_id: alertId,
        user_id: userId,
        deadline_id: deadlineId,
        provider: 'brevo',
        error_type: 'temporary',
        error_code: errorCode,
        attempt: 2,
        fallback_used: false,
        timestamp,
        final_status: 'sent',
        email_used: to,
      },
    }
  }
  
  // Retry também falhou: tentar fallback se houver
  if (fallbackEmail && fallbackEmail.trim() && fallbackEmail !== to) {
    const fallbackAttempt = await sendEmail({ to: fallbackEmail, subject, html })
    
    if (fallbackAttempt.ok) {
      return {
        ok: true,
        messageId: fallbackAttempt.messageId,
        log: {
          alert_id: alertId,
          user_id: userId,
          deadline_id: deadlineId,
          provider: 'brevo',
          error_type: 'temporary',
          error_code: errorCode,
          attempt: 2,
          fallback_used: true,
          timestamp,
          final_status: 'sent',
          email_used: fallbackEmail,
        },
      }
    }
  }
  
  // Tudo falhou
  return {
    ok: false,
    error: attempt2.error,
    log: {
      alert_id: alertId,
      user_id: userId,
      deadline_id: deadlineId,
      provider: 'brevo',
      error_type: 'temporary',
      error_code: errorCode,
      attempt: 2,
      fallback_used: fallbackEmail ? true : false,
      timestamp,
      final_status: 'failed',
      email_used: to,
    },
  }
}



