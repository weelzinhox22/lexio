"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Scale } from "lucide-react"

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref)
      // Salvar no localStorage para usar após signup
      localStorage.setItem('referral_code', ref)
    }
  }, [searchParams])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            role: "advogado",
            referral_code: referralCode || localStorage.getItem('referral_code'),
          },
        },
      })
      if (error) throw error

      // Processar referral se houver código
      if (referralCode || localStorage.getItem('referral_code')) {
        const code = referralCode || localStorage.getItem('referral_code')
        if (code && data.user) {
          // Chamar API para processar referral
          await fetch('/api/referrals/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referralCode: code,
              userId: data.user.id,
            }),
          })
        }
        localStorage.removeItem('referral_code')
      }

      router.push("/auth/check-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro ao criar conta")
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
              <CardTitle className="text-2xl font-bold text-slate-900">Criar conta</CardTitle>
              <CardDescription className="text-slate-600">Crie sua conta para começar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700">
                      Nome completo
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Email
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">
                      Senha
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
                      Confirmar senha
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
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-slate-600">
                  Já tem uma conta?{" "}
                  <Link href="/auth/login" className="font-medium text-slate-900 underline underline-offset-4">
                    Entrar
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
