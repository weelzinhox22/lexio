import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TemplateEditPage } from '@/components/templates/template-edit-page'
import { isAdmin } from '@/lib/utils/admin'

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { id } = await params

  // Verificar se é admin
  const userIsAdmin = isAdmin(user.id, user.email)

  return (
    <div className="space-y-4 md:space-y-6">
      <TemplateEditPage templateId={id} userId={user.id} isAdmin={userIsAdmin} />
    </div>
  )
}

