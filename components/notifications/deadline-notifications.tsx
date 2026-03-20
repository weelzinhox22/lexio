'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, X, CheckCheck, AlertTriangle, Info } from 'lucide-react'
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
  const containerRef = useRef<HTMLDivElement>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

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
    <div ref={containerRef} className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-[60]">
      <div className="relative group">
        {/* Botão de Notificações - Redesign Premium */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 text-slate-700 shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all duration-500 relative overflow-visible group/btn",
            "hover:scale-110 hover:bg-white active:scale-95",
            isOpen && "bg-white border-indigo-200 shadow-indigo-100"
          )}
        >
          {/* Ícone com Animação */}
          <div className="relative">
            <Bell className={cn(
              "h-5 w-5 md:h-6 md:w-6 transition-all duration-500",
              isOpen ? "rotate-[15deg] text-indigo-600 scale-110" : "text-slate-600 group-hover/btn:text-indigo-500",
              notifications.length > 0 && !isOpen && "animate-wiggle"
            )} />

            {/* Efeito Glow atrás do ícone se houver notificações */}
            {notifications.length > 0 && !isOpen && (
              <div className="absolute -inset-2 bg-indigo-400/20 blur-xl -z-10 rounded-full animate-pulse" />
            )}
          </div>

          {/* Badge de Notificações - Customizado para NÃO cortar */}
          {notifications.length > 0 && (
            <div className={cn(
              "absolute -top-1 -right-1 flex h-5 min-w-[20px] md:h-6 md:min-w-[24px] items-center justify-center rounded-full bg-gradient-to-tr from-red-500 to-rose-600 px-1 text-[9px] md:text-[10px] font-black text-white shadow-[0_4px_12px_rgba(244,63,94,0.4)] ring-2 ring-white transition-all duration-500 z-[70]",
              isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100 hover:scale-110"
            )}>
              {notifications.length > 9 ? '9+' : notifications.length}
            </div>
          )}
        </Button>

        {/* Dropdown de Notificações - Redesign Premium */}
        {isOpen && (
          <div
            className={cn(
              "absolute bottom-16 md:bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-[400px] max-h-[70vh] rounded-[2rem] md:rounded-[2.5rem] border border-white/20 bg-white/70 backdrop-blur-3xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.3)]",
              "animate-in zoom-in-95 fade-in slide-in-from-bottom-5 duration-500 cubic-bezier(0.16, 1, 0.3, 1)",
              "flex flex-col"
            )}
          >
            {/* Header com Gradiente Moderno */}
            <div className="flex items-center justify-between border-b border-slate-100/50 bg-slate-50/10 px-6 py-5">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Central de Alertas</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Sua produtividade em foco</p>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-[10px] font-black uppercase tracking-widest h-8 px-3 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-full transition-all"
                  >
                    Marcar Lidas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lista Scrollável */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2 min-h-0">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-[2rem] bg-indigo-50 mb-6 relative">
                    <Bell className="h-8 w-8 text-indigo-200" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-indigo-500 rounded-full animate-ping" />
                  </div>
                  <p className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Tudo sob controle!</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px]">
                    Não há alertas importantes por aqui. Seus prazos e tarefas estão em dia.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="group/item relative bg-white/40 hover:bg-white border border-transparent hover:border-slate-100 rounded-3xl p-5 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-2xl",
                          notification.type === 'deadline' ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"
                        )}>
                          <AlertTriangle className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0 pr-6">
                          <h4 className="font-bold text-sm text-slate-900 mb-1 line-clamp-1 uppercase tracking-tight">
                            {notification.title}
                          </h4>
                          <p className="text-[13px] text-slate-600 leading-snug mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                              {new Date(notification.created_at).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <div className="h-1 w-1 bg-slate-300 rounded-full" />
                            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-indigo-500">Urgente</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-4 h-8 w-8 rounded-full opacity-0 group-hover/item:opacity-100 hover:bg-green-50 hover:text-green-600 transition-all"
                          onClick={() => markAsRead(notification.id)}
                          title="Marcar como lida"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rodapé do Dropdown */}
            <div className="p-4 border-t border-slate-100/50 bg-slate-50/30">
              <Button
                variant="ghost"
                className="w-full h-10 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all font-primary"
                onClick={() => setIsOpen(false)}
              >
                Fechar Central
              </Button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg) scale(1.1); }
            50% { transform: rotate(10deg) scale(1.1); }
            75% { transform: rotate(-5deg); }
        }
        .animate-wiggle {
            animation: wiggle 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

