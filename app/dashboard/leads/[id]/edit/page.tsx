import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LeadEditForm } from '@/components/leads/lead-edit-form'

export default async function LeadEditPage({
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

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !lead) {
    redirect('/dashboard/leads')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Lead</h1>
        <p className="text-slate-600 mt-1">Atualize as informações do lead</p>
      </div>
      <LeadEditForm lead={lead} userId={user.id} />
    </div>
  )
}










