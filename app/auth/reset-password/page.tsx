"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Scale, CheckCircle2, ArrowRight } from "lucide-react"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Verificar se o usuário tem uma sessão válida (veio do link de recuperação)
        const checkSession = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            setIsValidSession(!!session)
        }
        checkSession()
    }, [])

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres")
            setIsLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError("As senhas não coincidem")
            setIsLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            })
            if (error) throw error
            setIsSuccess(true)
        } catch (error: unknown) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao redefinir a senha"
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="w-full max-w-md">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
                            <Scale className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Themixa</h1>
                    </div>

                    <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-slate-900">
                                {isSuccess ? "Senha redefinida!" : "Redefinir senha"}
                            </CardTitle>
                            <CardDescription className="text-slate-600">
                                {isSuccess
                                    ? "Sua senha foi atualizada com sucesso"
                                    : "Escolha uma nova senha para sua conta"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isValidSession === false ? (
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="text-center space-y-2">
                                        <p className="text-slate-900 font-medium">
                                            Link expirado ou inválido
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            O link de recuperação pode ter expirado. Solicite um novo link.
                                        </p>
                                    </div>
                                    <Link href="/auth/forgot-password" className="w-full">
                                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                                            Solicitar novo link
                                        </Button>
                                    </Link>
                                </div>
                            ) : isSuccess ? (
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-sm text-slate-600">
                                            Sua senha foi atualizada. Você já pode acessar o sistema com a nova senha.
                                        </p>
                                    </div>
                                    <Link href="/dashboard" className="w-full mt-2">
                                        <Button className="w-full bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 text-white group">
                                            Ir para o Dashboard
                                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleResetPassword}>
                                    <div className="flex flex-col gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-slate-700">
                                                Nova senha
                                            </Label>
                                            <PasswordInput
                                                id="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-slate-700">
                                                Confirmar nova senha
                                            </Label>
                                            <PasswordInput
                                                id="confirmPassword"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
                                            />
                                        </div>
                                        {error && (
                                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                                                {error}
                                            </div>
                                        )}
                                        <Button
                                            type="submit"
                                            className="w-full bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 text-white"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Salvando..." : "Salvar nova senha"}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
