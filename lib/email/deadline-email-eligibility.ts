export type DeadlineEmailEligibilityInput = {
  emailEnabled: boolean
  alertDays: number[]
  daysRemaining: number
  toEmail: string
}

/**
 * Regra de envio (MVP):
 * - Respeita preferências do usuário (email_enabled + alert_days)
 * - Não envia e-mail para OVERDUE (dias < 0) por padrão (evita spam)
 * - Exige e-mail de destino não vazio
 */
export function isEligibleForDeadlineEmail(input: DeadlineEmailEligibilityInput): boolean {
  if (!input.emailEnabled) return false
  if (!String(input.toEmail || '').trim()) return false
  if (!Array.isArray(input.alertDays) || input.alertDays.length === 0) return false
  if (input.daysRemaining < 0) return false
  return input.alertDays.includes(input.daysRemaining)
}


