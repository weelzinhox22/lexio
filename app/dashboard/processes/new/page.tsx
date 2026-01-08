import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProcessForm } from "@/components/processes/process-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function NewProcessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Buscar clientes do usuário
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  // Verificar se há clientes cadastrados
  if (!clients || clients.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Novo Processo</h1>
          <p className="text-slate-600 mt-1">Cadastre um novo processo judicial</p>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-amber-900">
              <AlertCircle className="h-6 w-6" />
              Nenhum Cliente Cadastrado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-amber-800">
              Você precisa cadastrar pelo menos um cliente antes de criar um processo.
            </p>
            <p className="text-amber-700 text-sm">
              Os clientes representam as partes que você está representando nos processos. Cadastre seus clientes primeiro para poder associá-los aos processos.
            </p>
            <Link href="/dashboard/clients/new">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Cliente
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-2">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          Novo Processo
        </h1>
        <p className="text-slate-600 mt-2">Cadastre um novo processo judicial no sistema</p>
      </div>

      <ProcessForm clients={clients} userId={user.id} />
    </div>
  )
}
