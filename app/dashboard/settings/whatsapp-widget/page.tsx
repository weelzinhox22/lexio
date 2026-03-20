"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Code, Loader2, Copy, Check, Info } from "lucide-react"
import { toast } from "sonner"
import { getWhatsappWidgetConfig, saveWhatsappWidgetConfig } from "./actions"
import { createClient } from "@/lib/supabase/client"

export default function WhatsappWidgetPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState(false)

    const [userId, setUserId] = useState<string>("")
    const [isActive, setIsActive] = useState(true)
    const [phoneNumber, setPhoneNumber] = useState("")
    const [defaultMessage, setDefaultMessage] = useState("Olá, vim pelo site e gostaria de conversar com o Dr.")
    const [callToAction, setCallToAction] = useState("Fale com o Doutor")
    const [buttonColor, setButtonColor] = useState("#25D366")

    const supabase = createClient()

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
            }

            const config = await getWhatsappWidgetConfig()
            if (config.success && config.data) {
                setIsActive(config.data.is_active)
                setPhoneNumber(config.data.phone_number || "")
                setDefaultMessage(config.data.default_message || "")
                setCallToAction(config.data.call_to_action || "")
                setButtonColor(config.data.button_color || "#25D366")
            }
            setLoading(false)
        }
        loadData()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        // Validate phone just containing numbers
        const cleanPhone = phoneNumber.replace(/\D/g, '')
        if (cleanPhone.length < 10) {
            toast.error("Por favor, digite um número de WhatsApp válido com DDD.")
            setSaving(false)
            return
        }

        const payload = {
            phone_number: cleanPhone,
            default_message: defaultMessage,
            button_color: buttonColor,
            call_to_action: callToAction,
            is_active: isActive
        }

        const res = await saveWhatsappWidgetConfig(payload)
        if (res.success) {
            toast.success("Widget atualizado com sucesso!")
        } else {
            toast.error(res.error || "Erro ao salvar o widget.")
        }
        setSaving(false)
    }

    const widgetScript = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/widgets/whatsapp.js?id=${userId}" defer></script>`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(widgetScript)
        setCopied(true)
        toast.success("Script copiado para a área de transferência!")
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <MessageCircle className="h-8 w-8 text-[#25D366]" />
                    Captador WhatsApp (Widget)
                </h1>
                <p className="text-slate-600 mt-1">
                    Configure um botão de WhatsApp inteligente para a sua Landing Page. Todo cliente que clicar nele será automaticamente salvo como Lead no seu CRM.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Formulário de Configuração */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-slate-800">Aparência e Contatos</CardTitle>
                                    <CardDescription>Defina para qual número o cliente será redirecionado.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                                        {isActive ? "Ativo no Site" : "Desativado"}
                                    </Label>
                                    <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                                </div>
                            </div>
                        </CardHeader>
                        <form onSubmit={handleSave}>
                            <CardContent className="space-y-5 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Número do WhatsApp (com DDD)</Label>
                                    <Input
                                        id="phone"
                                        placeholder="Ex: 11999999999"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-slate-500">Apenas números. O Themixa enviará o cliente para este destino.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cta">Texto do Balão / Título do Formulário</Label>
                                    <Input
                                        id="cta"
                                        placeholder="Ex: Fale com um Especialista Agora"
                                        value={callToAction}
                                        onChange={(e) => setCallToAction(e.target.value)}
                                        maxLength={40}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Mensagem Padrão Preenchida</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Mensagem que aparecerá digitada no WhatsApp do cliente"
                                        value={defaultMessage}
                                        onChange={(e) => setDefaultMessage(e.target.value)}
                                        rows={2}
                                        className="resize-none"
                                    />
                                    <p className="text-xs text-slate-500">Facilita a vida do cliente. Ele não precisa pensar no que escrever.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="color">Cor Principal do Botão</Label>
                                    <div className="flex gap-3 items-center">
                                        <Input
                                            id="color"
                                            type="color"
                                            value={buttonColor}
                                            onChange={(e) => setButtonColor(e.target.value)}
                                            className="w-16 h-10 p-1 cursor-pointer"
                                        />
                                        <span className="text-sm text-slate-600 uppercase font-mono">{buttonColor}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-end py-4">
                                <Button type="submit" disabled={saving || !phoneNumber}>
                                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Salvar Configurações
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Código de Instalação */}
                    <Card className="border-slate-200 border-indigo-100 shadow-sm shadow-indigo-100/50">
                        <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                                <Code className="h-5 w-5 text-indigo-600" />
                                Script de Instalação
                            </CardTitle>
                            <CardDescription className="text-indigo-700/80">
                                Copie e cole este código dentro da tag <code className="bg-indigo-100 px-1 rounded mx-1 text-xs">&lt;body&gt;</code> do seu site/Landing Page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="relative">
                                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed border border-slate-700">
                                    {widgetScript}
                                </pre>
                                <div className="mt-4 flex justify-end">
                                    <Button onClick={copyToClipboard} variant="outline" className="gap-2 bg-white">
                                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-500" />}
                                        {copied ? "Copiado!" : "Copiar Script"}
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-6 flex items-start gap-3 bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-100">
                                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                <div className="text-sm space-y-1">
                                    <p className="font-semibold">Como funciona?</p>
                                    <p className="text-blue-700/90 leading-relaxed">
                                        Assim que adicionado ao site, um botão flutuante aparecerá. Quando o cliente preencher o nome e telefone, você o verá instantaneamente na sua aba de Leads do Themixa, sem depender que ele chegue a abrir o WhatsApp!
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Live Preview Simples */}
                <div>
                    <Card className="border-slate-200 shadow-sm sticky top-24 overflow-hidden h-[400px]">
                        <CardHeader className="bg-slate-50 pb-3 border-b border-slate-100">
                            <CardTitle className="text-sm font-semibold flex justify-between items-center text-slate-700">
                                Pré-visualização
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Ao vivo</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-full relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50">
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-center mt-20">Seu Site<br />adv.exemplo.com.br</p>
                            </div>

                            {/* Simulated Floating Widget Button */}
                            {isActive && (
                                <div className="absolute bottom-6 right-6 flex flex-col items-end z-10 transition-all duration-300">
                                    <div className="bg-white px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 mb-3 animate-bounce">
                                        <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">{callToAction}</p>
                                    </div>
                                    <div
                                        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                                        style={{ backgroundColor: buttonColor }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
