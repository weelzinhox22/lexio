'use client'

import { useRouter } from 'next/navigation'
import { TemplateViewer } from './template-viewer'

interface Template {
  id: string
  name: string
  content: string
  placeholders: string[]
}

interface TemplateViewerClientProps {
  template: Template
  userId: string
}

export function TemplateViewerClient({ template, userId }: TemplateViewerClientProps) {
  const router = useRouter()

  return (
    <TemplateViewer
      template={template}
      onClose={() => router.push('/dashboard/templates')}
      userId={userId}
    />
  )
}

