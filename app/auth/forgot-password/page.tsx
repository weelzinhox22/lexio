"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Scale, ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
            })
            if (error) throw error
            setIsSuccess(true)
        } catch (error: unknown) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao enviar o e-mail de recuperação"
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
                                Recuperar senha
                            </CardTitle>
                            <CardDescription className="text-slate-600">
                                {isSuccess
                                    ? "Verifique sua caixa de entrada"
                                    : "Informe seu e-mail para receber o link de recuperação"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isSuccess ? (
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-slate-900 font-medium">
                                            E-mail enviado com sucesso!
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            Enviamos um link de recuperação para{" "}
                                            <strong className="text-slate-900">{email}</strong>.
                                            Verifique sua caixa de entrada e a pasta de spam.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full mt-4">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => {
                                                setIsSuccess(false)
                                                setEmail("")
                                            }}
                                        >
                                            <Mail className="h-4 w-4 mr-2" />
                                            Enviar para outro e-mail
                                        </Button>
                                        <Link href="/auth/login" className="w-full">
                                            <Button
                                                className="w-full bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 text-white"
                                            >
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                Voltar ao login
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleResetPassword}>
                                    <div className="flex flex-col gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-slate-700">
                                                E-mail da conta
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="seu@email.com"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
                                            />
                                            <p className="text-xs text-slate-500">
                                                Enviaremos um link para redefinir sua senha.
                                            </p>
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
                                            {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                                        </Button>
                                    </div>
                                    <div className="mt-4 text-center text-sm text-slate-600">
                                        Lembrou a senha?{" "}
                                        <Link
                                            href="/auth/login"
                                            className="font-medium text-slate-900 underline underline-offset-4"
                                        >
                                            Entrar
                                        </Link>
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
