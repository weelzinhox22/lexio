'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created_at: string
}

export function DeadlineNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Buscar notificações pendentes
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('notification_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) {
        setNotifications(data as Notification[])
      }
    }

    fetchNotifications()

    // Verificar prazos vencendo hoje
    const checkDeadlines = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: deadlines } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('deadline_date', today.toISOString())
        .lt('deadline_date', tomorrow.toISOString())

      if (deadlines && deadlines.length > 0) {
        // Criar notificações para prazos de hoje
        for (const deadline of deadlines) {
          const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('entity_type', 'deadline')
            .eq('entity_id', deadline.id)
            .eq('notification_status', 'pending')
            .single()

          if (!existing) {
            await supabase.from('notifications').insert({
              user_id: user.id,
              notification_type: 'deadline_reminder',
              title: 'Prazo Vencendo Hoje',
              message: `O prazo "${deadline.title}" vence hoje!`,
              entity_type: 'deadline',
              entity_id: deadline.id,
              channel: 'in_app',
              notification_status: 'pending',
            })
          }
        }

        fetchNotifications()
      }
    }

    checkDeadlines()
    const interval = setInterval(checkDeadlines, 60000) // Verificar a cada minuto

    // Escutar novas notificações
    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchNotifications()
          },
        )
        .subscribe()

      return channel
    }

    const channelPromise = setupRealtime()

    return () => {
      clearInterval(interval)
      channelPromise.then((channel) => {
        if (channel) supabase.removeChannel(channel)
      })
    }
  }, [])

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ notification_status: 'read' })
      .eq('id', notificationId)

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from('notifications')
      .update({ notification_status: 'read' })
      .eq('user_id', user.id)
      .eq('notification_status', 'pending')

    setNotifications([])
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg relative"
        >
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </Button>

        {isOpen && (
          <div className="absolute bottom-16 right-0 w-80 rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">Notificações</h3>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border-b border-slate-100 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{notification.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

