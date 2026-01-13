'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, Edit, X, Save, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface TemplatePreviewProps {
  content: string
  placeholders: string[]
  name?: string
  description?: string
  category?: string
  onSave: (data: { name: string; description?: string; category?: string }) => Promise<void>
  onEdit: () => void
  onDiscard: () => void
}

/**
 * Componente de preview de template antes de salvar
 */
export function TemplatePreview({
  content,
  placeholders,
  name,
  description,
  category,
  onSave,
  onEdit,
  onDiscard,
}: TemplatePreviewProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [finalName, setFinalName] = useState(name || '')
  const [finalDescription, setFinalDescription] = useState(description || '')

  // Renderizar conteúdo com placeholders destacados usando dangerouslySetInnerHTML
  const renderContentWithHighlights = () => {
    let highlightedContent = content
    const placeholderRegex = /{{([A-Z_]+)}}/g
    
    highlightedContent = highlightedContent.replace(
      placeholderRegex,
      (match) =>
        `<span class="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded font-mono text-sm font-semibold border border-yellow-300 dark:border-yellow-700">${match}</span>`
    )
    
    return highlightedContent
  }

  const handleSave = async () => {
    if (!finalName.trim()) {
      toast.error('Nome do template é obrigatório')
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        name: finalName.trim(),
        description: finalDescription.trim() || undefined,
        category,
      })
      toast.success('Template salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar template:', error)
      toast.error('Erro ao salvar template. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Preview do Template</h2>
          <p className="text-sm text-slate-600 mt-1">
            Revise o conteúdo antes de salvar. Os placeholders estão destacados.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informações e ações */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nome do Template *</label>
                <input
                  type="text"
                  value={finalName}
                  onChange={(e) => setFinalName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Petição Inicial - Danos Morais"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Descrição</label>
                <textarea
                  value={finalDescription}
                  onChange={(e) => setFinalDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  placeholder="Descrição do template..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Placeholders Detectados</label>
                <div className="flex flex-wrap gap-2">
                  {placeholders.length > 0 ? (
                    placeholders.map((placeholder) => (
                      <Badge key={placeholder} variant="secondary" className="font-mono text-xs">
                        {placeholder}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Nenhum placeholder encontrado</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleSave} disabled={isSaving || !finalName.trim()} className="w-full" size="lg">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Template'}
              </Button>
              <Button onClick={onEdit} variant="outline" className="w-full" size="lg">
                <Edit className="h-4 w-4 mr-2" />
                Editar Conteúdo
              </Button>
              <Button onClick={onDiscard} variant="outline" className="w-full" size="lg">
                <X className="h-4 w-4 mr-2" />
                Descartar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview do conteúdo */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview do Conteúdo</CardTitle>
              <CardDescription>
                Os placeholders aparecem destacados em amarelo. Eles serão substituídos ao usar o template.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <pre
                    className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-slate-900"
                    dangerouslySetInnerHTML={{ __html: renderContentWithHighlights() }}
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

