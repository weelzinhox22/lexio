'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, KeyRound, Globe, Copy, CheckCircle2, UserCircle, Share2, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface ClientPortalManagerProps {
    clientId: string
    hasPortalActive: boolean
    initialAccessCode?: string | null
    initialPassword?: string | null
    initialToken?: string | null
}

export function ClientPortalManager({ clientId, hasPortalActive, initialAccessCode, initialPassword, initialToken }: ClientPortalManagerProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isActive, setIsActive] = useState(hasPortalActive)
    const [accessCode, setAccessCode] = useState(initialAccessCode || '')
    const [password, setPassword] = useState(initialPassword || '')
    const [token, setToken] = useState(initialToken || '')

    const handleActivate = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/clients/${clientId}/portal`, {
                method: 'POST'
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Erro ao ativar o portal')

            setAccessCode(data.portal_access_code)
            setPassword(data.portal_password)
            setToken(data.onboarding_token)
            setIsActive(true)
            toast.success('Portal e link de Onboarding ativados com sucesso!')
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : 'Erro ao ativar o portal')
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = (text: string, description: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${description} copiado para a área de transferência!`)
    }

    const onboardingUrl = `${window.location.origin}/onboarding/${token}`
    const portalUrl = `${window.location.origin}/portal`

    return (
        <Card className="border-indigo-100 bg-indigo-50/30 overflow-hidden shadow-sm">
            <CardHeader className="bg-white border-b border-indigo-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            <Globe className="h-4 w-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base text-slate-800">
                                Portal do Cliente & Onboarding
                            </CardTitle>
                        </div>
                    </div>
                    {isActive ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 uppercase text-[10px] font-bold tracking-wider">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Ativo
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-slate-500 bg-slate-100 uppercase text-[10px] font-bold tracking-wider">
                            Inativo
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {!isActive ? (
                    <div className="text-center py-4 bg-white rounded-xl border border-dashed border-indigo-200">
                        <UserCircle className="h-10 w-10 text-indigo-300 mx-auto mb-2" />
                        <CardDescription className="mb-4 text-xs max-w-[200px] mx-auto">
                            Economize tempo pedindo para o próprio cliente completar os dados e visualizar seu caso online.
                        </CardDescription>
                        <Button
                            onClick={handleActivate}
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full max-w-[200px]"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
                            Gerar Acesso ao Portal
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* ONBOARDING LINK */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                <ClipboardList className="h-4 w-4 text-emerald-500" />
                                Link de Auto-Cadastro
                            </h4>
                            <p className="text-[11px] text-slate-500 mb-2">
                                Envie para o WhatsApp do cliente para ele preencher os dados (RG, CEP, etc) e anexar documentos.
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-slate-100 p-2 rounded text-[10px] text-slate-600 truncate border border-slate-200">
                                    {onboardingUrl}
                                </code>
                                <Button size="sm" variant="secondary" onClick={() => copyToClipboard(onboardingUrl, 'Link de Cadastro')} className="shrink-0 h-8 font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                                    <Copy className="h-3.5 w-3.5 mr-1" />
                                    Copiar
                                </Button>
                            </div>
                        </div>

                        {/* PORTAL ACCESS (SENHAS) */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                <KeyRound className="h-4 w-4 text-indigo-500" />
                                Credenciais do Portal
                            </h4>
                            <p className="text-[11px] text-slate-500 mb-3">
                                Envie os dados abaixo para o cliente consultar o andamento dos processos ativos ({portalUrl}).
                            </p>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Usuário (Código)</span>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs text-slate-800 font-bold">{accessCode}</span>
                                        <button onClick={() => copyToClipboard(accessCode, 'Usuário')} className="text-slate-400 hover:text-indigo-600 transition-colors p-1"><Copy className="h-3 w-3" /></button>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Senha Web</span>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs text-slate-800 font-bold tracking-wider">{password}</span>
                                        <button onClick={() => copyToClipboard(password, 'Senha')} className="text-slate-400 hover:text-indigo-600 transition-colors p-1"><Copy className="h-3 w-3" /></button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full h-8 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                onClick={() => {
                                    const msg = `Olá! 👋\nPara acompanhar o andamento dos seus processos conosco de forma transparente, acesse nosso Portal Exclusivo.\n\n🌐 Link: ${portalUrl}\n👤 Seu Usuário: ${accessCode}\n🔑 Sua Senha: ${password}\n\nQualquer dúvida, estamos à disposição!.`
                                    copyToClipboard(msg, 'Mensagem pronta')
                                }}
                            >
                                <Share2 className="h-3 w-3 mr-2" />
                                Copiar Mensagem para WhatsApp
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
