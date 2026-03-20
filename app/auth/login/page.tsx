"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Scale } from "lucide-react"
import HCaptcha from '@hcaptcha/react-hcaptcha'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | undefined>()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro ao fazer login com o Google")
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
              <CardTitle className="text-2xl font-bold text-slate-900">Entrar</CardTitle>
              <CardDescription className="text-slate-600">Entre com seu email para acessar sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
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
                    <div className="flex justify-end">
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        Esqueceu a senha?
                      </Link>
                    </div>
                  </div>
                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>
                  )}

                  <div className="flex justify-center my-2 min-h-[78px]">
                    <HCaptcha
                      sitekey="a34667c8-761e-44e2-9b30-bf74a0f058be"
                      onVerify={(token) => setCaptchaToken(token)}
                      onError={() => setError("Erro ao carregar o captcha.")}
                      onExpire={() => setCaptchaToken(undefined)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Ou</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white text-slate-700 hover:bg-slate-50 border-slate-200 transition-all font-semibold shadow-sm"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Entrar com o Google
                </Button>

                <p className="mt-4 text-center text-xs text-slate-500">
                  Ao realizar o login, você concorda firmemente com nossos{" "}
                  <Link href="/terms" className="underline underline-offset-4 hover:text-slate-900 transition-colors">
                    Termos de Uso
                  </Link>
                  {" "}e{" "}
                  <Link href="/privacy" className="underline underline-offset-4 hover:text-slate-900 transition-colors">
                    Política de Privacidade
                  </Link>.
                </p>

                <div className="mt-6 text-center text-sm text-slate-600">
                  Não tem uma conta?{" "}
                  <Link href="/auth/sign-up" className="font-medium text-slate-900 underline underline-offset-4">
                    Cadastre-se
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
