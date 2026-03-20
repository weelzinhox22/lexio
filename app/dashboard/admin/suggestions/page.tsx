"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Calendar, User, CheckCircle2, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Suggestion {
    id: string
    created_at: string
    category: string
    content: string
    status: 'pending' | 'reviewed' | 'implemented' | 'rejected'
    user_id: string
    profiles?: {
        full_name: string
        email: string
    }
}

export default function AdminSuggestionsPage() {
    const supabase = createClient()
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchSuggestions()
    }, [])

    const fetchSuggestions = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('user_suggestions')
                .select('*, profiles!user_id(full_name, email)')
                .order('created_at', { ascending: false })

            if (error) {
                console.error("Erro Supabase:", error)
                // Se o join falhar, tenta buscar sem o join para não quebrar a tela
                const { data: simpleData, error: simpleError } = await supabase
                    .from('user_suggestions')
                    .select('*')
                    .order('created_at', { ascending: false })
                
                if (simpleError) throw simpleError
                setSuggestions(simpleData || [])
                toast.error("Erro ao carregar perfis, mas os dados básicos estão aqui.")
            } else {
                setSuggestions(data || [])
            }
        } catch (error: any) {
            toast.error("Erro crítico: " + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const updateStatus = async (id: string, status: Suggestion['status']) => {
        const { error } = await supabase
            .from('user_suggestions')
            .update({ status })
            .eq('id', id)

        if (error) {
            toast.error("Erro ao atualizar status")
        } else {
            toast.success("Status atualizado")
            fetchSuggestions()
        }
    }

    const getStatusBadge = (status: Suggestion['status']) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>
            case 'reviewed': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Analisado</Badge>
            case 'implemented': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Implementado</Badge>
            case 'rejected': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Recusado</Badge>
        }
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sugestões dos Usuários</h1>
                    <p className="text-muted-foreground mt-1">Gerencie os feedbacks e solicitações de novas teses.</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        Sugestões Recebidas
                    </CardTitle>
                    <CardDescription>
                        Toda sugestão enviada pela Calculadora Criminal aparece aqui.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-slate-200 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[180px]">Usuário</TableHead>
                                    <TableHead className="w-[150px]">Data</TableHead>
                                    <TableHead>Sugestão</TableHead>
                                    <TableHead className="w-[130px]">Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                            Carregando sugestões...
                                        </TableCell>
                                    </TableRow>
                                ) : suggestions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                            Nenhuma sugestão encontrada.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    suggestions.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{item.profiles?.full_name || 'Usuário'}</span>
                                                    <span className="text-[10px] text-slate-500">{item.profiles?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-slate-700 leading-relaxed max-w-md whitespace-pre-wrap">{item.content}</p>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(item.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => updateStatus(item.id, 'reviewed')}>
                                                        Analisar
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateStatus(item.id, 'implemented')}>
                                                        OK
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateStatus(item.id, 'rejected')}>
                                                        X
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
