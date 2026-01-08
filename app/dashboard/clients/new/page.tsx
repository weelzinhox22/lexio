import { ClientForm } from "@/components/clients/client-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function NewClientPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="max-w-5xl space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          Novo Cliente
        </h1>
        <p className="text-slate-600 mt-2">Cadastre um novo cliente no sistema</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-lg lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ClientForm userId={user!.id} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
            <CardTitle className="text-sm font-semibold text-slate-900">💡 Dicas</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-sm text-slate-600">
            <div className="space-y-2">
              <p className="font-semibold text-slate-900">Informações Importantes:</p>
              <ul className="space-y-1 list-disc list-inside text-slate-600">
                <li>Preencha o CPF/CNPJ corretamente</li>
                <li>O email será usado para comunicações</li>
                <li>Adicione observações relevantes</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="font-semibold text-slate-900 mb-2">Próximos Passos:</p>
              <p className="text-slate-600">Após cadastrar, você poderá associar este cliente a processos, documentos e prazos.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
