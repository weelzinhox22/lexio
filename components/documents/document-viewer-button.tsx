'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { DocumentViewer } from './document-viewer'
import type { Document } from '@/lib/types/database'

export function DocumentViewerButton({ document }: { document: Document }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className="border-slate-300">
        <Eye className="h-4 w-4 mr-2" />
        Visualizar
      </Button>
      {isOpen && <DocumentViewer document={document} onClose={() => setIsOpen(false)} />}
    </>
  )
}







