"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function NotificationBell({ userId }: { userId: string }) {
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // Busca inicial
        async function fetchUnread() {
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false)

            if (count !== null) setUnreadCount(count)
        }
        fetchUnread()

        // Realtime subscription para atualizar em tempo real
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    fetchUnread()

                    // Se for uma nova notificação (INSERT), mostra o toast na tela!
                    if (payload.eventType === 'INSERT') {
                        const newNotif = payload.new as any
                        toast.info(newNotif.title, {
                            description: newNotif.message,
                            action: {
                                label: "Ver",
                                onClick: () => router.push('/dashboard/notifications')
                            }
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase])

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-slate-100 rounded-full"
            onClick={() => router.push('/dashboard/notifications')}
        >
            <Bell className="h-5 w-5 text-slate-700" />
            {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
            )}
        </Button>
    )
}
