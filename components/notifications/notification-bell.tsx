"use client"

import { useEffect, useState } from "react"
import { Bell, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function NotificationBell({ userId }: { userId: string }) {
    const [unreadCount, setUnreadCount] = useState(0)
    const [recentNotifications, setRecentNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            // Busca contagem de não lidas
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false)

            if (count !== null) setUnreadCount(count)

            // Busca as 5 mais recentes (lidas ou não)
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5)

            if (data) setRecentNotifications(data)
        } catch (error) {
            console.error("Erro ao buscar notificações:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()

        const channel = supabase
            .channel('notification-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    fetchNotifications()
                    if (payload.eventType === 'INSERT') {
                        const newNotif = payload.new as any
                        toast.info(newNotif.title, {
                            description: newNotif.message,
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase])

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        fetchNotifications()
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-300 group overflow-visible"
                >
                    <Bell className={cn(
                        "h-5 w-5 text-slate-600 group-hover:text-indigo-600 transition-all duration-300",
                        unreadCount > 0 && "animate-wiggle"
                    )} />

                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white shadow-lg ring-2 ring-white animate-in zoom-in-0 duration-300 z-10">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-xl pointer-events-none" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 shadow-2xl border-slate-200 rounded-2xl overflow-hidden" align="end">
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        Notificações
                        {unreadCount > 0 && <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
                    </h3>
                    <button
                        onClick={() => router.push('/dashboard/notifications')}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                    >
                        Ver todas
                        <ExternalLink className="h-3 w-3" />
                    </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-xs text-slate-500 font-medium">Nenhuma notificação por enquanto.</p>
                        </div>
                    ) : (
                        recentNotifications.map((n) => (
                            <div
                                key={n.id}
                                className={cn(
                                    "p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group relative",
                                    !n.is_read && "bg-indigo-50/20"
                                )}
                            >
                                <div className="flex flex-col gap-1 pr-6">
                                    <h4 className={cn("text-xs font-bold truncate", n.is_read ? "text-slate-700" : "text-slate-900")}>{n.title}</h4>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                    <span className="text-[9px] text-slate-400 mt-1 font-medium italic">
                                        {format(new Date(n.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                    </span>
                                </div>
                                {!n.is_read && (
                                    <button
                                        onClick={() => markAsRead(n.id)}
                                        className="absolute right-4 top-4 h-6 w-6 rounded-full bg-white border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:border-green-500 hover:text-green-600 transition-all shadow-sm"
                                        title="Marcar como lida"
                                    >
                                        <Check className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>

            <style jsx global>{`
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-8deg); }
                    50% { transform: rotate(8deg); }
                    75% { transform: rotate(-4deg); }
                }
                .animate-wiggle {
                    animation: wiggle 2s ease-in-out infinite;
                }
            `}</style>
        </Popover>
    )
}
