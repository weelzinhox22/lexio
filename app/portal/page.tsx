'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Lock, Loader2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

export default function PortalLoginPage() {
    const [accessCode, setAccessCode] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch('/api/portal/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessCode, password })
            })

            const data = await res.json()

            if (!res.ok) {
                console.error('Portal Login API Error:', data);
                toast.error(data.error || 'Erro ao efetuar login.')
                return
            }

            console.log('Portal Login Success, navigating to dashboard...');
            toast.success('Acesso ao Portal Concedido!')
            router.push('/portal/dashboard')
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error('Erro de conexão ao Portal. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-12">
            <Card className="max-w-md w-full shadow-lg border-slate-200">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-8 w-8 text-indigo-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Acesso ao Portal</CardTitle>
                    <CardDescription className="text-slate-500 mt-2">
                        Consulte o andamento dos seus processos atrelados ao seu CPF/CNPJ de forma transparente e 24h.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="accessCode">Usuário (Código)</Label>
                            <Input
                                id="accessCode"
                                type="text"
                                placeholder="Seu código recebido via WhatsApp"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                className="h-12 bg-slate-50 border-slate-300 font-mono"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha de Acesso Web</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Sua senha recebida"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-slate-50 border-slate-300 font-mono tracking-widest"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 text-md mt-4 bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Entrando de Forma Segura...</>
                            ) : (
                                <><KeyRound className="h-4 w-4 mr-2" /> Acessar Processos</>
                            )}
                        </Button>
                        <p className="text-center text-xs text-slate-400 font-mono pt-4 border-t border-slate-100 w-fit mx-auto">
                            🔒 Protegido com Criptografia
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
