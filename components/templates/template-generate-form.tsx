'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wand2, Loader2, Eye, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { TEMPLATE_CATEGORIES, TEMPLATE_TYPES, GROQ_MODELS } from '@/lib/constants/templates'
import { TemplatePreview } from './template-preview'

interface GeneratedTemplate {
  content: string
  placeholders: string[]
}

export function TemplateGenerateForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'peticao_inicial',
    category: 'direito_consumidor',
    subcategory: '',
    context: '',
    model: 'llama-3.3-70b-versatile',
  })

  const handleGeneratePreview = async () => {
    if (!formData.type || !formData.category) {
      toast.error('Tipo e categoria são obrigatórios')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/admin/templates/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          category: formData.category,
          subcategory: formData.subcategory || undefined,
          context: formData.context || undefined,
          model: formData.model,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar preview')
      }

      const data = await response.json()
      setGeneratedTemplate({
        content: data.content,
        placeholders: data.placeholders || [],
      })
      setShowPreview(true)
      toast.success('Template gerado com sucesso! Revise antes de salvar.')
    } catch (error) {
      console.error('Erro ao gerar preview:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar template')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async (saveData: { name: string; description?: string; category?: string }) => {
    if (!generatedTemplate) return

    try {
      const response = await fetch('/api/admin/templates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          category: saveData.category || formData.category,
          subcategory: formData.subcategory || undefined,
          context: formData.context || undefined,
          name: saveData.name,
          description: saveData.description,
          model: formData.model,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar template')
      }

      toast.success('Template salvo com sucesso!')
      router.push('/dashboard/templates')
      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar template:', error)
      throw error
    }
  }

  const handleEdit = () => {
    setShowPreview(false)
  }

  const handleDiscard = () => {
    setGeneratedTemplate(null)
    setShowPreview(false)
  }

  if (showPreview && generatedTemplate) {
    return (
      <div className="space-y-6">
        <Button onClick={handleEdit} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para edição
        </Button>
        <TemplatePreview
          content={generatedTemplate.content}
          placeholders={generatedTemplate.placeholders}
          name={formData.name}
          description={formData.description}
          category={formData.category}
          onSave={handleSave}
          onEdit={handleEdit}
          onDiscard={handleDiscard}
        />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Gerar Template com IA
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo para gerar um template de documento jurídico usando Groq AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Template</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Petição Inicial - Danos Morais"
              />
              <p className="text-xs text-slate-500">
                Opcional. Pode ser definido após o preview.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo do Documento *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Área do Direito *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.filter(cat => cat.value !== 'custom').map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategoria</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData((prev) => ({ ...prev, subcategory: e.target.value }))}
                placeholder="Ex: danos_morais, divórcio_consensual"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="context">Contexto Específico</Label>
              <Textarea
                id="context"
                value={formData.context}
                onChange={(e) => setFormData((prev) => ({ ...prev, context: e.target.value }))}
                placeholder="Descreva o contexto específico do caso (opcional)"
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do template (opcional)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo IA</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, model: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROQ_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-slate-500">
              ⚡ O template será gerado mas não será salvo automaticamente. Você pode revisar antes de salvar.
            </p>
            <Button
              onClick={handleGeneratePreview}
              disabled={isGenerating || !formData.type || !formData.category}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Gerar Preview
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

