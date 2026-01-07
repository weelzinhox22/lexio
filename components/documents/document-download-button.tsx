'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/lib/types/database'

export function DocumentDownloadButton({ document }: { document: Document }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    if (!document.file_path) {
      alert('Arquivo não encontrado')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.file_name || document.title
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar documento:', error)
      alert('Erro ao baixar documento')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={isLoading || !document.file_path}
      className="border-slate-300"
    >
      <Download className="h-4 w-4 mr-2" />
      {isLoading ? 'Baixando...' : 'Baixar'}
    </Button>
  )
}

