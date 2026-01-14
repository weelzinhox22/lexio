'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileStack, FileText, Palette, Plus, Eye, Edit, Trash2, Copy, Download } from 'lucide-react'
import { TemplateEditor } from './template-editor'
import { TemplateViewer } from './template-viewer'
import { LetterheadEditor } from './letterhead-editor'

type Template = {
  id: string
  name: string
  category: string
  subcategory: string | null
  description: string | null
  content: string
  placeholders: string[]
  is_system: boolean
}

type Letterhead = {
  id: string
  name: string
  logo_url: string | null
  header_text: string | null
  footer_text: string | null
  header_color: string
  footer_color: string
  font_family: string
  is_default: boolean
}

const CATEGORIES = {
  kit_basico: { name: 'Kit Básico', icon: '📋' },
  direito_consumidor: { name: 'Direito do Consumidor', icon: '🛒' },
  direito_familia: { name: 'Direito de Família', icon: '👨‍👩‍👧' },
  direito_trabalhista: { name: 'Direito Trabalhista', icon: '👷' },
  direito_civil: { name: 'Direito Cível', icon: '⚖️' },
  direito_penal: { name: 'Direito Penal', icon: '🔒' },
  custom: { name: 'Personalizados', icon: '✨' },
}

export function TemplatesManager({
  initialTemplates,
  initialLetterheads,
  userId,
}: {
  initialTemplates: Template[]
  initialLetterheads: Letterhead[]
  userId: string
}) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [letterheads, setLetterheads] = useState<Letterhead[]>(initialLetterheads)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [selectedLetterhead, setSelectedLetterhead] = useState<Letterhead | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('templates')

  // Agrupar templates por categoria
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, Template[]>)

  const handleDuplicateTemplate = (template: Template) => {
    // Lógica para duplicar template (criar cópia personalizada)
    console.log('Duplicar template:', template.id)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Deseja realmente excluir este template?')) return
    // Lógica para deletar
  }

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template)
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileStack className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="letterheads" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Papel Timbrado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6 mt-6">
          {!selectedTemplate && !isCreating && !isEditing && (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Seus Templates</h2>
                  <p className="text-sm text-slate-600">
                    {templates.filter((t) => !t.is_system).length} personalizados •{' '}
                    {templates.filter((t) => t.is_system).length} do sistema
                  </p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="bg-slate-900 hover:bg-slate-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </div>

              <div className="space-y-6">
                {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <span>{CATEGORIES[category as keyof typeof CATEGORIES]?.icon || '📄'}</span>
                      {CATEGORIES[category as keyof typeof CATEGORIES]?.name || category}
                      <Badge variant="outline" className="ml-2">
                        {categoryTemplates.length}
                      </Badge>
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categoryTemplates.map((template) => (
                        <Card key={template.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base mb-1">{template.name}</CardTitle>
                                <CardDescription className="text-xs line-clamp-2">
                                  {template.description}
                                </CardDescription>
                              </div>
                              {template.is_system && (
                                <Badge variant="secondary" className="text-xs">
                                  Sistema
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleUseTemplate(template)}
                                size="sm"
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Usar
                              </Button>
                              {template.is_system ? (
                                <Button
                                  onClick={() => handleDuplicateTemplate(template)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    onClick={() => {
                                      setSelectedTemplate(template)
                                      setIsEditing(true)
                                    }}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteTemplate(template.id)}
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">
                              {(template.placeholders as string[])?.length || 0} campos
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {selectedTemplate && !isEditing && (
            <TemplateViewer
              template={selectedTemplate}
              onClose={() => setSelectedTemplate(null)}
              userId={userId}
            />
          )}

          {(isCreating || isEditing) && (
            <TemplateEditor
              template={isEditing ? selectedTemplate : null}
              onClose={() => {
                setIsCreating(false)
                setIsEditing(false)
                setSelectedTemplate(null)
              }}
              userId={userId}
            />
          )}
        </TabsContent>

        <TabsContent value="letterheads" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Papéis Timbrados</h2>
              <p className="text-sm text-slate-600">{letterheads.length} configurados</p>
            </div>
            <Button
              onClick={() => setSelectedLetterhead({} as Letterhead)}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Papel Timbrado
            </Button>
          </div>

          {selectedLetterhead ? (
            <LetterheadEditor
              letterhead={selectedLetterhead.id ? selectedLetterhead : null}
              onClose={() => setSelectedLetterhead(null)}
              userId={userId}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {letterheads.map((letterhead) => (
                <Card key={letterhead.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{letterhead.name}</CardTitle>
                      {letterhead.is_default && (
                        <Badge className="bg-green-100 text-green-700">Padrão</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {letterhead.logo_url && (
                        <div className="w-full h-20 bg-slate-100 rounded flex items-center justify-center">
                          <img
                            src={letterhead.logo_url}
                            alt="Logo"
                            className="max-h-16 max-w-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedLetterhead(letterhead)}
                          size="sm"
                          className="flex-1"
                          variant="outline"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}












