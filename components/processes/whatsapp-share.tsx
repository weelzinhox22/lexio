"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Copy, ExternalLink, Check, Phone, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProcessInfo {
    title: string
    processNumber?: string | null
    court?: string | null
    vara?: string | null
    matter?: string | null
    status?: string | null
    lastMovement?: { title: string; date: string } | null
}

interface ClientInfo {
    name: string
    phone?: string | null
}

interface WhatsAppShareProps {
    process: ProcessInfo
    client?: ClientInfo | null
    profileName?: string | null
}

export function WhatsAppShare({ process, client, profileName }: WhatsAppShareProps) {
    const [copied, setCopied] = useState(false)
    const [loadingAI, setLoadingAI] = useState(false)
    const [message, setMessage] = useState(() => buildMessage(process, client, profileName))

    function buildMessage(p: ProcessInfo, c?: ClientInfo | null, name?: string | null): string {
        const lines: string[] = []

        lines.push(`📋 *Atualização do Processo*`)
        lines.push(``)
        if (c?.name) lines.push(`👤 *Cliente:* ${c.name}`)
        lines.push(`📑 *Processo:* ${p.title}`)
        if (p.processNumber) lines.push(`🔢 *Número:* ${p.processNumber}`)
        if (p.court) lines.push(`🏛️ *Tribunal:* ${p.court}`)
        if (p.vara) lines.push(`⚖️ *Vara:* ${p.vara}`)
        if (p.matter) lines.push(`📌 *Matéria:* ${p.matter}`)

        const statusLabels: Record<string, string> = {
            active: 'Ativo', archived: 'Arquivado', suspended: 'Suspenso',
            in_progress: 'Em Andamento', won: 'Ganho', lost: 'Perdido',
        }
        if (p.status) lines.push(`📊 *Status:* ${statusLabels[p.status] || p.status}`)

        if (p.lastMovement) {
            lines.push(``)
            lines.push(`📢 *Última Movimentação:*`)
            lines.push(`${p.lastMovement.title}`)
            if (p.lastMovement.date) {
                lines.push(`📅 ${new Date(p.lastMovement.date).toLocaleDateString('pt-BR')}`)
            }
        }

        lines.push(``)
        lines.push(`---`)
        lines.push(`${name ? `*${name}*` : '*Seu Advogado*'} — Themixa`)

        return lines.join('\n')
    }

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(message)
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        } catch {
            // Fallback
            const textarea = document.createElement('textarea')
            textarea.value = message
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        }
    }, [message])

    const getWhatsAppUrl = useCallback(() => {
        if (!client?.phone) return null

        // Clean phone number
        let phone = client.phone.replace(/\D/g, '')

        // Add country code if needed
        if (phone.length === 10 || phone.length === 11) {
            phone = '55' + phone
        }

        const encoded = encodeURIComponent(message)
        return `https://wa.me/${phone}?text=${encoded}`
    }, [client?.phone, message])

    const handleExplainWithAI = async () => {
        setLoadingAI(true)
        try {
            const res = await fetch('/api/ai/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ process, client, profileName })
            })
            if (!res.ok) throw new Error("Falha na API")
            const data = await res.json()
            if (data.text) {
                setMessage(data.text)
                toast.success("Mensagem reescrita pela IA!")
            }
        } catch (error) {
            toast.error("Não foi possível gerar a explicação com a IA.")
            console.error(error)
        } finally {
            setLoadingAI(false)
        }
    }

    const whatsappUrl = getWhatsAppUrl()

    return (
        <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/30 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-green-800 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Enviar Atualização ao Cliente
                    {client?.phone && (
                        <Badge variant="outline" className="text-[10px] border-green-300 text-green-700 ml-auto">
                            <Phone className="h-3 w-3 mr-1" />
                            {client.phone}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    className="text-sm bg-white border-green-200 focus:border-green-400 focus:ring-green-200 font-mono text-[12px] leading-relaxed"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        onClick={handleExplainWithAI}
                        variant="outline"
                        size="sm"
                        disabled={loadingAI}
                        className="flex-1 border-purple-300 hover:bg-purple-100 text-purple-800"
                    >
                        {loadingAI ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                        Traduzir com IA
                    </Button>
                    <Button
                        onClick={handleCopy}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-green-300 hover:bg-green-100 text-green-800"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-1.5 text-green-600" />
                                Copiado!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-1.5" />
                                Copiar Texto
                            </>
                        )}
                    </Button>

                    {whatsappUrl ? (
                        <Button
                            asChild
                            size="sm"
                            className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm"
                        >
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1.5" />
                                Enviar WhatsApp Web
                            </a>
                        </Button>
                    ) : (
                        <Button disabled size="sm" className="flex-1" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-1.5" />
                            Sem telefone
                        </Button>
                    )}
                </div>
                {!client?.phone && client && (
                    <p className="text-xs text-amber-600">
                        💡 Cadastre o telefone do cliente para enviar diretamente via WhatsApp Web.
                    </p>
                )}
            </CardContent>
        </Card >
    )
}
