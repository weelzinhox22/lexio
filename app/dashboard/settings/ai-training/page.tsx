"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Edit2, Bot, Save, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function AITrainingPage() {
    const [knowledge, setKnowledge] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [currentAnswer, setCurrentAnswer] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        fetchKnowledge()
    }, [])

    const fetchKnowledge = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("bot_knowledge")
                .select("*")
                .eq('is_active', true)
                .order("created_at", { ascending: false })

            if (error) {
                if (error.code === '42P01') {
                    toast.error("Por favor, rode o script 038_create_bot_knowledge.sql no Supabase.")
                    return
                }
                throw error
            }
            setKnowledge(data || [])
        } catch (error: any) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!currentQuestion.trim() || !currentAnswer.trim()) {
            toast.error("Preencha a pergunta e a resposta.")
            return
        }

        try {
            const { data: userData } = await supabase.auth.getUser()
            const userId = userData.user?.id

            if (editingId) {
                const { error } = await supabase
                    .from("bot_knowledge")
                    .update({ question: currentQuestion, answer: currentAnswer, updated_at: new Date().toISOString() })
                    .eq("id", editingId)

                if (error) throw error
                toast.success("Treinamento atualizado com sucesso!")
            } else {
                const { error } = await supabase
                    .from("bot_knowledge")
                    .insert([{ question: currentQuestion, answer: currentAnswer, created_by: userId }])

                if (error) throw error
                toast.success("Novo conhecimento adicionado!")
            }

            setIsDialogOpen(false)
            fetchKnowledge()
        } catch (error: any) {
            toast.error("Erro ao salvar: " + error.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja deletar este conhecimento do bot?")) return

        try {
            const { error } = await supabase
                .from("bot_knowledge")
                .delete()
                .eq("id", id)

            if (error) throw error
            toast.success("Conhecimento deletado.")
            fetchKnowledge()
        } catch (error: any) {
            toast.error("Erro ao deletar: " + error.message)
        }
    }

    const openNewDialog = () => {
        setEditingId(null)
        setCurrentQuestion("")
        setCurrentAnswer("")
        setIsDialogOpen(true)
    }

    const openEditDialog = (item: any) => {
        setEditingId(item.id)
        setCurrentQuestion(item.question)
        setCurrentAnswer(item.answer)
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Bot className="h-6 w-6 text-blue-600" />
                        Treinamento da Themixa AI
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Alimente o cérebro do assistente virtual. Diga o que eles devem responder para perguntas específicas.
                    </p>
                </div>
                <Button onClick={openNewDialog} className="bg-blue-600 hover:bg-blue-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ensinar Nova Regra
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Editar Conhecimento" : "Ensinar Novo Conhecimento"}</DialogTitle>
                        <DialogDescription>
                            Escreva exemplos de perguntas ou palavras-chave na 'Pergunta/Gatilho' e a resposta completa na 'Resposta'.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="question" className="text-sm font-medium">Pergunta ou Palavras-chave (Gatilhos)</label>
                            <Input
                                id="question"
                                placeholder="Exemplo: como calcular honorários, timesheet, honorarios..."
                                value={currentQuestion}
                                onChange={(e) => setCurrentQuestion(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="answer" className="text-sm font-medium">O que a IA deve responder?</label>
                            <Textarea
                                id="answer"
                                placeholder="Exemplo: Para incluir honorários vá em Timesheet e..."
                                rows={8}
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Copiar</Button> {/* Dummy text for Cancels to fix layout if needed, will put Cancel */}
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Conhecimento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : knowledge.length === 0 ? (
                    <Card className="border-dashed border-2 bg-slate-50">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Bot className="h-12 w-12 text-slate-300 mb-4" />
                            <p className="text-lg font-medium text-slate-900">Mente Vazia!</p>
                            <p className="text-slate-500 max-w-sm mt-1 mb-4">
                                O assistente ainda não aprendeu regras personalizadas. Adicione o seu primeiro conhecimento para customizar a IA.
                            </p>
                            <Button onClick={openNewDialog} variant="outline">
                                <Plus className="h-4 w-4 mr-2" /> Ensinar Primeira Regra
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    knowledge.map((item) => (
                        <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row border-l-4 border-blue-500">
                                <div className="flex-1 p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                                            Gatilho
                                        </span>
                                        <h3 className="font-semibold text-slate-900">{item.question}</h3>
                                    </div>
                                    <div className="mt-3 bg-slate-50 rounded-md p-3 border border-slate-100">
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.answer}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 sm:bg-white border-t sm:border-t-0 sm:border-l border-slate-100 p-4 flex sm:flex-col items-center justify-end sm:justify-center gap-2 shrink-0">
                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)} className="text-slate-500 hover:text-blue-600">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
