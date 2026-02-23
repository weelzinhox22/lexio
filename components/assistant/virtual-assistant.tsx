"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, X, Send, User, Sparkles, Loader2, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ReactMarkdown from "react-markdown"

type Message = {
    id: string
    role: "user" | "assistant"
    content: string
}

export function VirtualAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "init",
            role: "assistant",
            content: "Olá, Doutor(a)! Sou o assistente de IA da Themixa. Como posso ajudar com a plataforma hoje? Precisando calcular honorários ou registrar processos?"
        }
    ])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (isOpen && !isMinimized) {
            // Pequeno delay para garantir que a renderização do DOM/CSS transition termine antes de rolar
            setTimeout(() => {
                scrollToBottom()
            }, 150)
        }
    }, [messages, isOpen, isMinimized])

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue.trim()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue("")
        setIsLoading(true)

        try {
            // Send history mapped to API format
            const historyToSend = messages.concat(userMessage).map(m => ({
                role: m.role,
                content: m.content
            }))

            const response = await fetch('/api/ai/assistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: historyToSend })
            })

            if (!response.ok) {
                throw new Error("Erro na solicitação da IA")
            }

            const data = await response.json()

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.text || "Desculpe, não entendi. Tente de novo!"
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "❌ Ups! Fui interrompido e não consegui responder. Pode tentar de novo?"
                }
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const toggleChat = () => {
        if (isOpen && !isMinimized) {
            setIsOpen(false)
        } else {
            setIsOpen(true)
            setIsMinimized(false)
        }
    }

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-4">

            {/* O Chat Box */}
            {isOpen && (
                <Card className={`w-[350px] shadow-2xl border-blue-200 transition-all duration-300 transform origin-bottom-right ${isMinimized ? 'scale-0 opacity-0 pointer-events-none absolute' : 'scale-100 opacity-100 flex flex-col'} h-[500px] overflow-hidden`}>

                    {/* Header do Chat */}
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-full">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold">Themixa AI</CardTitle>
                                <p className="text-[10px] text-blue-100 opacity-90 leading-tight">O suporte instantâneo do seu escritório</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                                onClick={() => setIsMinimized(true)}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-white hover:bg-white/20 hover:text-red-300 rounded-full"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Área das Mensagens */}
                    <CardContent className="flex-1 p-3 overflow-y-auto bg-slate-50 space-y-4 text-sm">
                        {messages.map((m) => (
                            <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {m.role === 'assistant' && (
                                    <div className="mt-1 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-3 py-2 ${m.role === 'user'
                                        ? 'bg-slate-800 text-white rounded-tr-sm'
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                                        }`}
                                >
                                    <div className="markdown-chat prose-sm prose-p:my-1 prose-strong:text-current prose-ul:my-1 prose-ul:pl-4">
                                        <ReactMarkdown>
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                                {m.role === 'user' && (
                                    <div className="mt-1 h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                        <User className="h-3.5 w-3.5 text-slate-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 justify-start">
                                <div className="mt-1 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                                </div>
                                <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Campo de Input */}
                    <CardFooter className="p-3 bg-white border-t border-slate-200">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex w-full items-center space-x-2"
                        >
                            <Input
                                type="text"
                                placeholder="Pergunte sobre a plataforma..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading}
                                className="flex-1 focus-visible:ring-blue-500 rounded-full"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!inputValue.trim() || isLoading}
                                className="rounded-full bg-blue-600 hover:bg-blue-700 shrink-0 h-10 w-10 shadow-sm"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            {/* Botão Flutuante */}
            <Button
                onClick={toggleChat}
                className={`h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all transform hover:scale-105 duration-200 ${isOpen && !isMinimized ? 'hidden' : 'flex'} items-center justify-center relative`}
            >
                <Sparkles className="absolute top-3 right-3 h-3 w-3 text-yellow-300 animate-pulse" />
                <Bot className="h-7 w-7" />
            </Button>

        </div>
    )
}
