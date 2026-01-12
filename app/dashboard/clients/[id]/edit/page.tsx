import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientEditForm } from '@/components/clients/client-edit-form'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Cliente</h1>
        <p className="text-slate-600 mt-1">Atualize as informações do cliente</p>
      </div>
      <ClientEditForm client={client} userId={user.id} />
    </div>
  )
}







