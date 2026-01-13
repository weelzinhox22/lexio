import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TemplateViewerClient } from '@/components/templates/template-viewer-client'

export default async function ViewTemplatePage({
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

  // Buscar template
  const { data: template, error } = await supabase
    .from('document_templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !template) {
    redirect('/dashboard/templates')
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <TemplateViewerClient
        template={{
          id: template.id,
          name: template.name,
          content: template.content,
          placeholders: (template.placeholders as string[]) || [],
        }}
        userId={user.id}
      />
    </div>
  )
}

