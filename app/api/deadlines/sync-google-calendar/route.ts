import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createGoogleCalendarEvent, updateGoogleCalendarEvent, deleteGoogleCalendarEvent } from '@/lib/google-calendar/client'

/**
 * POST /api/deadlines/sync-google-calendar
 * 
 * Sincroniza um prazo com o Google Calendar
 * Ações: create, update, delete
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, deadlineId, deadline } = body

    // Verificar se o usuário tem Google Calendar conectado
    const { data: userData } = await supabase
      .from('profiles')
      .select('google_calendar_connected')
      .eq('id', user.id)
      .single()

    if (!userData?.google_calendar_connected) {
      return NextResponse.json(
        { error: 'Google Calendar não conectado' },
        { status: 400 }
      )
    }

    if (action === 'create' && deadline) {
      // Criar evento no Google Calendar
      const deadlineDate = new Date(deadline.deadline_date)
      const reminderDate = deadline.reminder_date ? new Date(deadline.reminder_date) : null

      const event = {
        summary: `[Prazo] ${deadline.title}`,
        description: deadline.description || `Prazo processual: ${deadline.title}`,
        start: {
          dateTime: deadlineDate.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: new Date(deadlineDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hora depois
          timeZone: 'America/Sao_Paulo',
        },
        reminders: {
          useDefault: false,
          overrides: reminderDate
            ? [
                {
                  method: 'email' as const,
                  minutes: Math.floor((deadlineDate.getTime() - reminderDate.getTime()) / 60000),
                },
                {
                  method: 'popup' as const,
                  minutes: Math.floor((deadlineDate.getTime() - reminderDate.getTime()) / 60000),
                },
              ]
            : [
                { method: 'email' as const, minutes: 24 * 60 }, // 1 dia antes
                { method: 'popup' as const, minutes: 60 }, // 1 hora antes
              ],
        },
      }

      const result = await createGoogleCalendarEvent(user.id, event)

      if (result.success && result.eventId) {
        // Atualizar o prazo com o ID do evento do Google Calendar
        await supabase
          .from('deadlines')
          .update({ google_calendar_event_id: result.eventId })
          .eq('id', deadlineId)

        return NextResponse.json({ success: true, eventId: result.eventId })
      } else {
        return NextResponse.json(
          { error: result.error || 'Erro ao criar evento' },
          { status: 500 }
        )
      }
    } else if (action === 'update' && deadline && deadline.google_calendar_event_id) {
      // Atualizar evento no Google Calendar
      const deadlineDate = new Date(deadline.deadline_date)

      const eventUpdate = {
        summary: `[Prazo] ${deadline.title}`,
        description: deadline.description || `Prazo processual: ${deadline.title}`,
        start: {
          dateTime: deadlineDate.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: new Date(deadlineDate.getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
      }

      const result = await updateGoogleCalendarEvent(
        user.id,
        deadline.google_calendar_event_id,
        eventUpdate
      )

      if (result.success) {
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json(
          { error: result.error || 'Erro ao atualizar evento' },
          { status: 500 }
        )
      }
    } else if (action === 'delete' && deadline?.google_calendar_event_id) {
      // Deletar evento do Google Calendar
      const result = await deleteGoogleCalendarEvent(user.id, deadline.google_calendar_event_id)

      if (result.success) {
        // Remover o ID do evento do prazo
        await supabase
          .from('deadlines')
          .update({ google_calendar_event_id: null })
          .eq('id', deadlineId)

        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json(
          { error: result.error || 'Erro ao deletar evento' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Ação inválida ou dados faltando' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Erro ao sincronizar com Google Calendar:', error)
    return NextResponse.json(
      { error: 'Erro ao sincronizar com Google Calendar' },
      { status: 500 }
    )
  }
}

