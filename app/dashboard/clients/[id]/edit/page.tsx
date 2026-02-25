import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientEditForm } from '@/components/clients/client-edit-form'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ClientEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !client) {
    redirect('/dashboard/clients')
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl p-6 border border-blue-200/60 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          Editar Cliente
        </h1>
        <p className="text-slate-600 mt-2">Atualize o cadastro e as informações deste cliente</p>
      </div>

      <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-4">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modificando Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ClientEditForm client={client} userId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}












