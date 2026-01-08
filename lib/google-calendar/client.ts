import { createClient } from '@/lib/supabase/server'
import { GOOGLE_CALENDAR_API, GOOGLE_TOKEN_URL } from './config'

/**
 * Cliente para interagir com a API do Google Calendar
 */

export interface GoogleCalendarEvent {
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
}

/**
 * Obtém um token de acesso válido para o usuário
 * Renova automaticamente se estiver expirado
 */
async function getValidAccessToken(userId: string): Promise<string | null> {
  const supabase = await createClient()

  // Buscar tokens do usuário
  const { data: tokenData, error } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !tokenData) {
    console.error('Erro ao buscar tokens:', error)
    return null
  }

  // Verificar se o token está expirado
  const now = new Date()
  const expiresAt = new Date(tokenData.expires_at)

  if (now >= expiresAt) {
    // Token expirado, renovar
    console.log('Token expirado, renovando...')
    
    try {
      const refreshResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      if (!refreshResponse.ok) {
        console.error('Erro ao renovar token:', await refreshResponse.text())
        return null
      }

      const newTokens = await refreshResponse.json()

      // Calcular nova data de expiração
      const newExpiresAt = new Date()
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + newTokens.expires_in)

      // Atualizar tokens no banco
      await supabase
        .from('google_calendar_tokens')
        .update({
          access_token: newTokens.access_token,
          expires_at: newExpiresAt.toISOString(),
        })
        .eq('user_id', userId)

      return newTokens.access_token
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      return null
    }
  }

  return tokenData.access_token
}

/**
 * Cria um evento no Google Calendar
 */
export async function createGoogleCalendarEvent(
  userId: string,
  event: GoogleCalendarEvent
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId)
    if (!accessToken) {
      return { success: false, error: 'Token de acesso inválido ou expirado' }
    }

    const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro ao criar evento:', errorData)
      return { success: false, error: errorData.error?.message || 'Erro ao criar evento' }
    }

    const createdEvent = await response.json()
    return { success: true, eventId: createdEvent.id }
  } catch (error) {
    console.error('Erro ao criar evento no Google Calendar:', error)
    return { success: false, error: 'Erro inesperado ao criar evento' }
  }
}

/**
 * Atualiza um evento no Google Calendar
 */
export async function updateGoogleCalendarEvent(
  userId: string,
  eventId: string,
  event: Partial<GoogleCalendarEvent>
): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId)
    if (!accessToken) {
      return { success: false, error: 'Token de acesso inválido ou expirado' }
    }

    const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro ao atualizar evento:', errorData)
      return { success: false, error: errorData.error?.message || 'Erro ao atualizar evento' }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar evento no Google Calendar:', error)
    return { success: false, error: 'Erro inesperado ao atualizar evento' }
  }
}

/**
 * Deleta um evento do Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  userId: string,
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(userId)
    if (!accessToken) {
      return { success: false, error: 'Token de acesso inválido ou expirado' }
    }

    const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json()
      console.error('Erro ao deletar evento:', errorData)
      return { success: false, error: errorData.error?.message || 'Erro ao deletar evento' }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar evento do Google Calendar:', error)
    return { success: false, error: 'Erro inesperado ao deletar evento' }
  }
}

