import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendDeadlineAlertEmail } from '@/lib/email/send-deadline-alert'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deadlineId } = await request.json()

    if (!deadlineId) {
      return NextResponse.json({ error: 'deadlineId is required' }, { status: 400 })
    }

    // Buscar o prazo
    const { data: deadline, error: deadlineError } = await supabase
      .from('deadlines')
      .select('id, title, deadline_date, process_id, user_id')
      .eq('id', deadlineId)
      .eq('user_id', user.id)
      .single()

    if (deadlineError || !deadline) {
      return NextResponse.json({ error: 'Deadline not found' }, { status: 404 })
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Buscar configurações de notificação
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('email_override')
      .eq('user_id', user.id)
      .maybeSingle()

    const toEmail = (settings?.email_override || profile?.email || user.email || '').trim()

    if (!toEmail) {
      return NextResponse.json({ error: 'No email address found' }, { status: 400 })
    }

    // Calcular dias restantes
    const now = new Date()
    const deadlineDate = new Date(deadline.deadline_date)
    const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Enviar e-mail de teste
    const sendResult = await sendDeadlineAlertEmail({
      to: toEmail,
      userName: profile?.full_name || null,
      deadline: {
        id: deadline.id,
        title: deadline.title,
        deadline_date: deadline.deadline_date,
        process_id: deadline.process_id,
      },
      daysRemaining: daysRemaining >= 0 ? daysRemaining : 0,
      severity: daysRemaining <= 3 ? 'danger' : daysRemaining <= 7 ? 'warning' : 'info',
      isTestEmail: true,
    })

    if (!sendResult.ok) {
      return NextResponse.json(
        { error: 'Failed to send test email', details: sendResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      emailId: sendResult.id,
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


