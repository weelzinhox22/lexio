import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProcessEditForm } from '@/components/processes/process-edit-form'

export default async function ProcessEditPage({
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

  const { data: process, error } = await supabase
    .from('processes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !process) {
    redirect('/dashboard/processes')
  }

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .eq('user_id', user.id)
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Processo</h1>
        <p className="text-slate-600 mt-1">Atualize as informações do processo</p>
      </div>
      <ProcessEditForm process={process} clients={clients || []} userId={user.id} />
    </div>
  )
}










