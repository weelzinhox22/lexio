import { DeadlineFormEnhanced } from "@/components/deadlines/deadline-form-enhanced"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function NewDeadlinePage({
  searchParams,
}: {
  searchParams?: Promise<{ onboarding?: string; date?: string; time?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const params = await searchParams
  const isOnboarding = params?.onboarding === 'true'
  const prefillDate = params?.date
  const prefillTime = params?.time || '09:00'

  // Fetch processes for dropdown
  const { data: processes } = await supabase
    .from("processes")
    .select("id, title, process_number")
    .eq("user_id", user!.id)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {isOnboarding ? 'Cadastre seu primeiro prazo' : 'Novo Prazo'}
        </h1>
        <p className="text-slate-600 mt-1">
          {isOnboarding 
            ? 'Nós cuidamos dos alertas. Você cuida do processo.' 
            : 'Cadastre um novo prazo processual'}
        </p>
      </div>

      {isOnboarding && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">Como funciona:</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Você receberá alertas por e-mail em 7, 3, 1 dia e no dia do prazo</li>
                  <li>Os alertas são enviados automaticamente - você não precisa fazer nada</li>
                  <li>Após criar este prazo, você receberá um e-mail de teste para confirmar que está tudo funcionando</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Informações do Prazo</CardTitle>
        </CardHeader>
        <CardContent>
          <DeadlineFormEnhanced 
            processes={processes || []} 
            userId={user!.id}
            isOnboarding={isOnboarding}
            prefillDate={prefillDate}
            prefillTime={prefillTime}
          />
        </CardContent>
      </Card>
    </div>
  )
}
