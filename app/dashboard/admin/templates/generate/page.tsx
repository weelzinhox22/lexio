import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TemplateGenerateForm } from '@/components/templates/template-generate-form'
import { isAdmin } from '@/lib/utils/admin'

export default async function AdminGenerateTemplatePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verificar se é admin
  if (!isAdmin(user.id, user.email)) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Gerar Template com IA</h1>
        <p className="text-slate-600 mt-1 text-sm md:text-base">
          Gere templates de documentos jurídicos usando Groq AI. Revise antes de salvar.
        </p>
      </div>

      <TemplateGenerateForm userId={user.id} />
    </div>
  )
}

