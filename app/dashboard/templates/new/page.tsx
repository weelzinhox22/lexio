import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewTemplateForm } from '@/components/templates/new-template-form'

export default async function NewTemplatePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Novo Template</h1>
        <p className="text-slate-600 mt-1 text-sm md:text-base">
          Crie um novo template de documento jurídico
        </p>
      </div>

      <NewTemplateForm userId={user.id} />
    </div>
  )
}
