"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ShieldAlert, Send, Activity, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { broadcastNotification } from "../actions"

export default function AdminNotificationsPage() {
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSend(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim() || !message.trim()) return

        setIsLoading(true)
        setSuccess(false)
        try {
            const res = await broadcastNotification(title.trim(), message.trim())
            if (res.success) {
                toast.success("Notificação enviada a todos os usuários!")
                setSuccess(true)
                setTitle("")
                setMessage("")
            } else {
                toast.error(res.error || "Erro ao enviar notificação.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Ocorreu um erro ao processar o disparo.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <ShieldAlert className="h-8 w-8 text-blue-600" />
                    Avisos do Sistema
                </h1>
                <p className="text-slate-600 mt-1 md:text-base text-sm">
                    Envie alertas, notificações de manutenção ou comunicados importantes para todos os usuários cadastrados (via in-app).
                </p>
            </div>

            <Card className="border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                        <Activity className="h-5 w-5 text-indigo-500" />
                        Disparo Global (Broadcast)
                    </CardTitle>
                    <CardDescription>
                        Esta mensagem aparecerá no "Sininho" de todos os usuários imediatamente.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {success && (
                        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-3 border border-emerald-100">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <p className="text-sm font-medium">As notificações foram despachadas com sucesso e já estão na caixa de entrada dos usuários!</p>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-slate-700 font-semibold">
                                Título da Notificação
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., Manutenção Programada - Sábado"
                                required
                                maxLength={100}
                                className="border-slate-200 focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-slate-700 font-semibold">
                                Mensagem Completa
                            </Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="E.g., O sistema passará por instabilidade neste sábado às 23:00 para melhora nos servidores..."
                                required
                                rows={6}
                                maxLength={500}
                                className="border-slate-200 focus-visible:ring-indigo-500 resize-none min-h-[120px]"
                            />
                            <p className="text-xs text-slate-400 text-right">{message.length}/500 caracteres</p>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button
                                type="submit"
                                disabled={isLoading || !title.trim() || !message.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md pr-6 pl-5 transition-all w-full sm:w-auto"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Disparando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Enviar para Todos
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
