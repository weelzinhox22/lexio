'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Template = {
  id?: string
  name: string
  category: string
  subcategory: string | null
  description: string | null
  content: string
  placeholders: string[]
}

const CATEGORIES = [
  { value: 'kit_basico', label: 'Kit Básico' },
  { value: 'direito_consumidor', label: 'Direito do Consumidor' },
  { value: 'direito_familia', label: 'Direito de Família' },
  { value: 'direito_trabalhista', label: 'Direito Trabalhista' },
  { value: 'direito_civil', label: 'Direito Cível' },
  { value: 'direito_penal', label: 'Direito Penal' },
  { value: 'custom', label: 'Personalizado' },
]

export function TemplateEditor({
  template,
  onClose,
  userId,
}: {
  template: Template | null
  onClose: () => void
  userId: string
}) {
  const [formData, setFormData] = useState<Template>(
    template || {
      name: '',
      category: 'custom',
      subcategory: null,
      description: null,
      content: '',
      placeholders: [],
    }
  )
  const [isSaving, setIsSaving] = useState(false)

  const extractPlaceholders = (content: string): string[] => {
    const regex = /{{([A-Z_]+)}}/g
    const matches = content.match(regex)
    if (!matches) return []
    
    const uniquePlaceholders = [...new Set(matches.map((m) => m.replace(/{{|}}/g, '')))]
    return uniquePlaceholders.filter((p) => p !== 'DATA_ATUAL') // Excluir automáticos
  }

  const handleContentChange = (content: string) => {
    const placeholders = extractPlaceholders(content)
    setFormData((prev) => ({ ...prev, content, placeholders }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()

    try {
      const dataToSave = {
        ...formData,
        user_id: userId,
        placeholders: formData.placeholders,
      }

      if (template?.id) {
        // Atualizar
        const { error } = await supabase
          .from('document_templates')
          .update(dataToSave)
          .eq('id', template.id)

        if (error) throw error
      } else {
        // Criar
        const { error } = await supabase
          .from('document_templates')
          .insert(dataToSave)

        if (error) throw error
      }

      alert('Template salvo com sucesso!')
      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Erro ao salvar template:', error)
      alert('Erro ao salvar template. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onClose} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">
            {template ? 'Editar Template' : 'Novo Template'}
          </h2>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Template *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Petição Inicial - Danos Morais"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategoria</Label>
              <Input
                id="subcategory"
                value={formData.subcategory || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, subcategory: e.target.value }))}
                placeholder="Ex: petição inicial, contestação"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o propósito deste template"
                rows={3}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">💡 Dica: Placeholders</p>
              <p className="text-xs text-blue-700">
                Use placeholders no formato <code className="bg-blue-100 px-1 rounded">{'{{NOME_CAMPO}}'}</code> no conteúdo. Eles serão detectados automaticamente e aparecerão como campos de preenchimento.
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Campos detectados: <strong>{formData.placeholders.length}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conteúdo do Documento</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Digite o conteúdo do template usando placeholders como {{NOME_CLIENTE}}, {{CPF_CLIENTE}}, etc."
              className="font-mono text-sm min-h-[500px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}









