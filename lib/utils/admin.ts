/**
 * Utilitários para verificação de admin
 */

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .filter(Boolean)
  .map((e) => e.trim().toLowerCase())

/**
 * Verifica se um usuário é admin
 */
export function isAdmin(userId: string, userEmail?: string | null): boolean {
  const email = userEmail?.toLowerCase() || ''
  return (
    ADMIN_USER_IDS.includes(userId) ||
    ADMIN_EMAILS.includes(email) ||
    email.endsWith('@themixa.com')
  )
}

