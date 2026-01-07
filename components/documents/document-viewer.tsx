'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Document } from '@/lib/types/database'

interface DocumentViewerProps {
  document: Document
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFile = async () => {
      try {
        const supabase = createClient()
        
        // Se tem file_path, baixar do storage
        if (document.file_path) {
          const { data, error: downloadError } = await supabase.storage
            .from('documents')
            .download(document.file_path)

          if (downloadError) throw downloadError

          const url = URL.createObjectURL(data)
          setFileUrl(url)
        } else if (document.file_url) {
          // Se tem file_url, usar diretamente
          setFileUrl(document.file_url)
        } else {
          throw new Error('Arquivo não encontrado')
        }
      } catch (err) {
        console.error('Erro ao carregar documento:', err)
        setError('Erro ao carregar documento')
      } finally {
        setIsLoading(false)
      }
    }

    loadFile()

    return () => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [document])

  const handleDownload = () => {
    if (!fileUrl) return

    const a = window.document.createElement('a')
    a.href = fileUrl
    a.download = document.file_name || document.title
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
  }

  const isPDF = document.file_type === 'application/pdf' || document.file_name?.endsWith('.pdf')
  const isWord = document.file_type?.includes('word') || document.file_name?.endsWith('.doc') || document.file_name?.endsWith('.docx')
  const isImage = document.file_type?.startsWith('image/')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-7xl mx-4 my-4 bg-white rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">{document.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                <p className="text-slate-600">Carregando documento...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={onClose}>Fechar</Button>
              </div>
            </div>
          )}

          {fileUrl && !isLoading && !error && (
            <div className="h-full">
              {isPDF && (
                <iframe
                  src={fileUrl}
                  className="w-full h-full min-h-[600px] border-0 rounded"
                  title={document.title}
                />
              )}
              {isWord && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">
                      Visualização de documentos Word não está disponível no navegador.
                    </p>
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar para visualizar
                    </Button>
                  </div>
                </div>
              )}
              {isImage && (
                <div className="flex items-center justify-center h-full">
                  <img src={fileUrl} alt={document.title} className="max-w-full max-h-full object-contain" />
                </div>
              )}
              {!isPDF && !isWord && !isImage && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">
                      Visualização não disponível para este tipo de arquivo.
                    </p>
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar arquivo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

