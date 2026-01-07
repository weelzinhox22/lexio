import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FinancialEditForm } from '@/components/financial/financial-edit-form'

export default async function FinancialEditPage({
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

  const { data: transaction, error } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !transaction) {
    redirect('/dashboard/financial')
  }

  const [clientsResult, processesResult] = await Promise.all([
    supabase
      .from('clients')
      .select('id, name')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('processes')
      .select('id, title, process_number')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Editar Transação</h1>
        <p className="text-slate-600 mt-1">Atualize as informações da transação</p>
      </div>
      <FinancialEditForm
        transaction={transaction}
        clients={clientsResult.data || []}
        processes={processesResult.data || []}
        userId={user.id}
      />
    </div>
  )
}

