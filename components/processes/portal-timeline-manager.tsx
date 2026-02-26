'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Calendar, LayoutList, CheckCircle2, Loader2, Save, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface TimelineEvent {
    id: string
    title: string
    description: string
    event_date: string
    category: string
    is_client_visible: boolean
}

export function PortalTimelineManager({ processId }: { processId: string }) {
    const supabase = createClient()
    const [summary, setSummary] = useState('')
    const [events, setEvents] = useState<TimelineEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSavingSummary, setIsSavingSummary] = useState(false)
    const [isAddingEvent, setIsAddingEvent] = useState(false)

    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
        category: 'generic'
    })

    useEffect(() => {
        loadTimelineData()
    }, [processId])

    async function loadTimelineData() {
        setIsLoading(true)
        try {
            // Load summary
            const { data: proc } = await supabase
                .from('processes')
                .select('client_summary')
                .eq('id', processId)
                .single()
            if (proc) setSummary(proc.client_summary || '')

            // Load events
            const { data: timeline } = await supabase
                .from('process_timeline')
                .select('*')
                .eq('process_id', processId)
                .order('event_date', { ascending: false })

            if (timeline) setEvents(timeline)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    async function updateSummary() {
        setIsSavingSummary(true)
        const { error } = await supabase
            .from('processes')
            .update({ client_summary: summary })
            .eq('id', processId)

        if (error) toast.error('Erro ao salvar resumo.')
        else toast.success('Resumo para o cliente atualizado!')
        setIsSavingSummary(false)
    }

    async function addEvent() {
        if (!newEvent.title) return
        setIsAddingEvent(true)

        const { data: { user } } = await supabase.auth.getUser()

        const { error } = await supabase
            .from('process_timeline')
            .insert({
                process_id: processId,
                user_id: user?.id,
                title: newEvent.title,
                description: newEvent.description,
                event_date: newEvent.event_date,
                category: newEvent.category
            })

        if (error) {
            toast.error('Erro ao adicionar evento.')
        } else {
            toast.success('Evento adicionado à linha do tempo!')
            setNewEvent({
                title: '',
                description: '',
                event_date: new Date().toISOString().split('T')[0],
                category: 'generic'
            })
            loadTimelineData()
        }
        setIsAddingEvent(false)
    }

    async function deleteEvent(id: string) {
        if (!confirm('Excluir este evento da linha do tempo?')) return
        const { error } = await supabase.from('process_timeline').delete().eq('id', id)
        if (error) toast.error('Erro ao excluir.')
        else {
            setEvents(events.filter(e => e.id !== id))
            toast.success('Evento removido.')
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>
    }

    return (
        <div className="space-y-6">
            <Card className="border-indigo-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-indigo-50/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                        Status Simplificado para o Cliente
                    </CardTitle>
                    <CardDescription>
                        Este texto aparecerá em destaque no Portal do Cliente ("Rastreio de Encomenda").
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <Textarea
                        placeholder="Ex: O juiz já assinou a sentença e agora estamos aguardando o prazo de recurso da outra parte."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        rows={3}
                        className="bg-white border-slate-200"
                    />
                    <Button onClick={updateSummary} disabled={isSavingSummary} className="bg-indigo-600 hover:bg-indigo-700">
                        {isSavingSummary ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Status Atual
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <LayoutList className="h-5 w-5 text-slate-600" />
                        Linha do Tempo (Portal)
                    </CardTitle>
                    <CardDescription>
                        Adicione marcos importantes que o cliente deve ver.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Event Form */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Título do Marco</Label>
                                <Input
                                    placeholder="Ex: Audiência Realizada"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Data</Label>
                                <Input
                                    type="date"
                                    value={newEvent.event_date}
                                    onChange={e => setNewEvent({ ...newEvent, event_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>O que aconteceu? (Opcional)</Label>
                            <Textarea
                                placeholder="Explicação breve para o cliente..."
                                value={newEvent.description}
                                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                rows={2}
                            />
                        </div>
                        <Button
                            onClick={addEvent}
                            disabled={isAddingEvent || !newEvent.title}
                            className="w-full sm:w-auto"
                        >
                            {isAddingEvent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Adicionar ao Portal
                        </Button>
                    </div>

                    {/* Events List */}
                    <div className="space-y-4 pt-4">
                        {events.length === 0 ? (
                            <p className="text-center text-sm text-slate-400 py-4 italic">Nenhum marco adicionado à linha do tempo do cliente.</p>
                        ) : (
                            <div className="relative border-l-2 border-indigo-100 ml-3 space-y-6">
                                {events.map((event) => (
                                    <div key={event.id} className="relative pl-6">
                                        <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-white border-2 border-indigo-500 shadow-sm" />
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-400">
                                                        {new Date(event.event_date).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400">
                                                        {event.category}
                                                    </Badge>
                                                </div>
                                                <h4 className="font-bold text-slate-800 mt-0.5">{event.title}</h4>
                                                {event.description && (
                                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                                        {event.description}
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-300 hover:text-red-500 h-8 w-8"
                                                onClick={() => deleteEvent(event.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
