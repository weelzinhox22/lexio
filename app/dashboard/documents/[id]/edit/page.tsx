import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DocumentEditForm } from '@/components/documents/document-edit-form'

export default async function DocumentEditPage({
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

  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !document) {
    redirect('/dashboard/documents')
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
        <h1 className="text-3xl font-bold text-slate-900">Editar Documento</h1>
        <p className="text-slate-600 mt-1">Atualize as informações do documento</p>
      </div>
      <DocumentEditForm
        document={document}
        clients={clientsResult.data || []}
        processes={processesResult.data || []}
        userId={user.id}
      />
    </div>
  )
}







