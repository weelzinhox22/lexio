'use client'

import { useRouter } from 'next/navigation'
import { TemplateEditor } from './template-editor'

interface NewTemplateFormProps {
  userId: string
}

export function NewTemplateForm({ userId }: NewTemplateFormProps) {
  const router = useRouter()

  const handleClose = () => {
    router.push('/dashboard/templates')
    router.refresh()
  }

  return <TemplateEditor template={null} onClose={handleClose} userId={userId} />
}

