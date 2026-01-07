import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Scale } from "lucide-react"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Lexio</h1>
          </div>
          <Card className="border-slate-200">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Mail className="h-8 w-8 text-slate-900" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Verifique seu email</CardTitle>
              <CardDescription className="text-slate-600">
                Enviamos um link de confirmação para seu email. Por favor, verifique sua caixa de entrada e clique no
                link para ativar sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-slate-600">
                Não recebeu o email?{" "}
                <Link href="/auth/sign-up" className="font-medium text-slate-900 underline underline-offset-4">
                  Tentar novamente
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
