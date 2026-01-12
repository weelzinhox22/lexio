'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, X, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

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

    // Buscar notificações pendentes (in-app)
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel', 'in_app')
        .eq('notification_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) {
        setNotifications(data as Notification[])
      }
    }

    fetchNotifications()

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
      channelPromise.then((channel) => {
        if (channel) supabase.removeChannel(channel)
      })
    }
  }, [])

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ notification_status: 'read', read_at: new Date().toISOString() })
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
      .update({ notification_status: 'read', read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('notification_status', 'pending')

    setNotifications([])
  }

  // Não renderizar se não houver notificações e não estiver aberto
  if (notifications.length === 0 && !isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Botão Flutuante */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-14 w-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative",
            "hover:scale-105 active:scale-95",
            isOpen && "bg-slate-800"
          )}
        >
          <Bell className={cn("h-5 w-5 transition-transform duration-200", isOpen && "rotate-12")} />
          {notifications.length > 0 && (
            <Badge
              variant="destructive"
              className={cn(
                "absolute -top-1 -right-1 h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-semibold",
                "transition-all duration-200",
                isOpen && "scale-110"
              )}
            >
              {notifications.length > 9 ? '9+' : notifications.length}
            </Badge>
          )}
        </Button>

        {/* Dropdown */}
        {isOpen && (
          <div
            className={cn(
              "absolute bottom-20 right-0 w-96 rounded-xl border border-slate-200 bg-white shadow-2xl",
              "transform transition-all duration-200 ease-out",
              "overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">Notificações</h3>
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-8 px-2 text-slate-600 hover:text-slate-900"
                  >
                    <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                    Todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lista */}
            <div className="max-h-96 overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="rounded-full bg-slate-100 p-3 mb-3">
                    <Bell className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Sem notificações</p>
                  <p className="text-xs text-slate-500">
                    Você será notificado quando houver novos alertas de prazo.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="border-b border-slate-100 p-4 hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 leading-snug mb-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(notification.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 hover:bg-slate-200"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

