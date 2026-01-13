'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Loader2, History, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { TemplateRichEditor } from './template-rich-editor'
import { TemplateVersionsPanel } from './template-versions-panel'
import { TEMPLATE_CATEGORIES } from '@/lib/constants/templates'

interface Template {
  id: string
  name: string
  category: string
  subcategory: string | null
  description: string | null
  content: string
  placeholders: string[]
  is_system: boolean
  user_id: string | null
}

interface TemplateEditPageProps {
  templateId: string
  userId: string
  isAdmin?: boolean
}

export function TemplateEditPage({ templateId, userId, isAdmin = false }: TemplateEditPageProps) {
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showVersions, setShowVersions] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    content: '',
    placeholders: [] as string[],
  })

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  const loadTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`)
      if (!response.ok) {
        throw new Error('Template não encontrado')
      }

      const data = await response.json()
      setTemplate(data.template)
      setFormData({
        name: data.template.name,
        category: data.template.category,
        subcategory: data.template.subcategory || '',
        description: data.template.description || '',
        content: data.template.content,
        placeholders: data.template.placeholders || [],
      })
    } catch (error) {
      console.error('Erro ao carregar template:', error)
      toast.error('Erro ao carregar template')
      router.push('/dashboard/templates')
    } finally {
      setLoading(false)
    }
  }

  const extractPlaceholders = (content: string): string[] => {
    const regex = /{{([A-Z_]+)}}/g
    const matches = Array.from(content.matchAll(regex))
    const placeholders = matches.map((match) => match[1])
    const uniquePlaceholders = [...new Set(placeholders)]
    return uniquePlaceholders.filter((p) => p !== 'DATA_ATUAL')
  }

  const handleContentChange = (content: string) => {
    const placeholders = extractPlaceholders(content)
    setFormData((prev) => ({ ...prev, content, placeholders }))
  }

  const handleSave = async () => {
    if (!template) return

    // Verificar permissão
    if (template.is_system && template.user_id !== userId && !isAdmin) {
      toast.error('Você não tem permissão para editar este template')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar template')
      }

      const data = await response.json()
      toast.success('Template salvo com sucesso!')
      
      if (data.versionCreated) {
        toast.info('Uma nova versão foi criada')
      }

      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar template:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar template')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!template) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Template não encontrado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const canEdit = template.user_id === userId || isAdmin || !template.is_system

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Editar Template</h1>
            <p className="text-sm text-slate-600 mt-1">{template.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowVersions(!showVersions)}
            variant="outline"
            size="sm"
          >
            <History className="h-4 w-4 mr-2" />
            Versões
          </Button>
          <Button onClick={handleSave} disabled={saving || !canEdit} size="sm">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      {!canEdit && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              ⚠️ Este é um template do sistema. Você não pode editá-lo, mas pode criar uma cópia.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Template *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
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
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label>Placeholders Detectados</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.placeholders.length > 0 ? (
                    formData.placeholders.map((placeholder) => (
                      <span
                        key={placeholder}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono"
                      >
                        {placeholder}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Nenhum placeholder encontrado</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conteúdo do Template</CardTitle>
            </CardHeader>
            <CardContent>
              {canEdit ? (
                <TemplateRichEditor
                  content={formData.content}
                  onChange={handleContentChange}
                  placeholder="Digite o conteúdo do template usando placeholders como {{NOME_CLIENTE}}..."
                />
              ) : (
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 min-h-[400px]">
                  <pre className="whitespace-pre-wrap font-serif text-sm text-slate-900">
                    {formData.content}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showVersions && (
        <TemplateVersionsPanel templateId={templateId} userId={userId} isAdmin={isAdmin} />
      )}
    </div>
  )
}

