"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Check, CheckCheck, Loader2, ListFilter, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, unread, read
    const supabase = createClient()

    useEffect(() => {
        fetchNotifications()
    }, [])

    async function fetchNotifications() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (data) setNotifications(data)
        setLoading(false)
    }

    async function markAsRead(id: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            toast.success("Marcada como lida")
        }
    }

    async function markAllAsRead() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        if (!error) {
            fetchNotifications()
            toast.success("Todas as notificações lidas")
        }
    }

    async function deleteNotification(id: string) {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)

        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id))
            toast.success("Notificação excluída")
        }
    }

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read
        if (filter === 'read') return n.is_read
        return true
    })

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Bell className="h-6 w-6 text-blue-600" />
                        Central de Notificações
                    </h1>
                    <p className="text-slate-600 mt-1">Gerencie todos os seus alertas e avisos da plataforma.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[160px] bg-white">
                            <ListFilter className="w-4 h-4 mr-2 text-slate-500" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="unread">Não Lidas</SelectItem>
                            <SelectItem value="read">Lidas</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={markAllAsRead} disabled={loading || notifications.filter(n => !n.is_read).length === 0}>
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Ler Todas
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 h-[300px]">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        <p className="mt-4 text-sm text-slate-500">Carregando notificações...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                            <Bell className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">Tudo limpo por aqui</h3>
                        <p className="mt-1 text-sm text-slate-500 max-w-sm">
                            Você não possui mais notificações para exibir com o filtro atual selecionado.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredNotifications.map((n) => (
                            <div
                                key={n.id}
                                className={`p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4 
                  ${!n.is_read ? 'bg-blue-50/30' : 'bg-white'}`}
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="mt-0.5 relative">
                                        {n.notification_type === 'deadline' ? (
                                            <div className={`p-2 rounded-full ${!n.is_read ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                                <Bell className="h-4 w-4" />
                                            </div>
                                        ) : (
                                            <div className={`p-2 rounded-full ${!n.is_read ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                <Bell className="h-4 w-4" />
                                            </div>
                                        )}
                                        {!n.is_read && (
                                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`text-sm ${!n.is_read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                {n.title}
                                            </h4>
                                            <Badge variant="outline" className={`text-[10px] ${!n.is_read ? 'border-blue-200 text-blue-700' : 'text-slate-500 border-slate-200'}`}>
                                                {n.channel || 'Sistema'}
                                            </Badge>
                                        </div>
                                        {n.message && (
                                            <p className={`text-sm ${!n.is_read ? 'text-slate-700' : 'text-slate-500'}`}>
                                                {n.message}
                                            </p>
                                        )}
                                        <span className="text-xs text-slate-400 mt-2 block">
                                            {new Date(n.created_at).toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0">
                                    {!n.is_read && (
                                        <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)} className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            <Check className="h-4 w-4 mr-1.5" />
                                            Marcar Lida
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => deleteNotification(n.id)} className="h-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
