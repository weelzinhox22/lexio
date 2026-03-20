'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Eye, Edit, Plus, X, Sparkles, FileText, FolderOpen, Share2 } from 'lucide-react'
import { TEMPLATE_CATEGORIES, TEMPLATE_TYPES } from '@/lib/constants/templates'
import { isAdmin } from '@/lib/utils/admin'

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
  created_at: string
  updated_at: string
}

interface TemplatesListAdvancedProps {
  initialTemplates: Template[]
  userId: string
  userEmail?: string | null
}

export function TemplatesListAdvanced({
  initialTemplates,
  userId,
  userEmail,
}: TemplatesListAdvancedProps) {
  const router = useRouter()
  const [templates] = useState<Template[]>(initialTemplates)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const userIsAdmin = isAdmin(userId, userEmail || null)

  // Filtrar templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Filtro de busca
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          template.name.toLowerCase().includes(query) ||
          (template.description && template.description.toLowerCase().includes(query)) ||
          (template.subcategory && template.subcategory.toLowerCase().includes(query))

        if (!matchesSearch) return false
      }

      // Filtro de categoria
      if (selectedCategory !== 'all' && template.category !== selectedCategory) {
        return false
      }

      // Filtro de tipo (subcategoria)
      if (selectedType !== 'all' && template.subcategory !== selectedType) {
        return false
      }

      return true
    })
  }, [templates, searchQuery, selectedCategory, selectedType])

  // Agrupar por categoria
  const groupedTemplates = useMemo(() => {
    const grouped: Record<string, Template[]> = {}
    filteredTemplates.forEach((template) => {
      if (!grouped[template.category]) {
        grouped[template.category] = []
      }
      grouped[template.category].push(template)
    })
    return grouped
  }, [filteredTemplates])

  const getCategoryIcon = (category: string) => {
    return <FolderOpen className="w-5 h-5 text-blue-600 mr-2" />
  }

  const getCategoryLabel = (category: string) => {
    const cat = TEMPLATE_CATEGORIES.find((c) => c.value === category)
    return cat?.label || category
  }

  const handleUseTemplate = (template: Template) => {
    router.push(`/dashboard/templates/${template.id}`)
  }

  const handleEditTemplate = async (template: Template) => {
    // Se for template do sistema e não for admin, criar cópia primeiro
    if (template.is_system && !userIsAdmin) {
      try {
        const response = await fetch(`/api/templates/${template.id}/duplicate`, {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Erro ao criar cópia do template')
        }

        const data = await response.json()
        // Redirecionar para edição da cópia
        router.push(`/dashboard/templates/${data.template.id}/edit`)
      } catch (error) {
        console.error('Erro ao duplicar template:', error)
        // Em caso de erro, tentar editar direto (pode ser que já exista uma cópia)
        router.push(`/dashboard/templates/${template.id}/edit`)
      }
    } else {
      // Template próprio ou admin editando sistema
      router.push(`/dashboard/templates/${template.id}/edit`)
    }
  }

  // Todos podem editar (cria cópia se for template do sistema)
  const canEdit = () => true

  return (
    <div className="space-y-6">
      {/* Header e ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Templates</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} encontrado{filteredTemplates.length !== 1 ? 's' : ''}
            {filteredTemplates.length !== initialTemplates.length ? ` de ${initialTemplates.length}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 mr-2">
            <Share2 className="h-4 w-4 text-emerald-600" />
            <p className="text-[10px] text-emerald-800 font-medium max-w-[150px] leading-tight">
              Modelos da <strong>Comunidade</strong> são gerados via IA e anonimizados.
            </p>
          </div>
          {userIsAdmin && (
            <Button
              onClick={() => router.push('/dashboard/admin/templates/generate')}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-sm font-semibold transition-transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar com IA (Admin)
            </Button>
          )}
          <Button onClick={() => router.push('/dashboard/templates/new')} size="sm" className="bg-slate-900 hover:bg-slate-800 rounded-full shadow-sm font-semibold transition-transform hover:-translate-y-0.5">
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Busca */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full border-slate-300 focus:border-blue-400 focus:ring-blue-200 shadow-sm h-10"
                />
              </div>
            </div>

            {/* Categoria */}
            <div className="w-[180px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-full shadow-sm border-slate-300 focus:ring-blue-200 h-10 font-medium">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="w-[180px]">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="rounded-full shadow-sm border-slate-300 focus:ring-blue-200 h-10 font-medium">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {TEMPLATE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Limpar filtros */}
            {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all') && (
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedType('all')
                }}
                variant="outline"
                size="sm"
                className="rounded-full h-10 px-4 text-slate-600 font-semibold"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de templates */}
      {filteredTemplates.length === 0 ? (
        <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden bg-slate-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium">Nenhum template encontrado</p>
            <p className="text-sm text-slate-500 mt-2">
              Tente ajustar os filtros ou criar um novo template
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 sm:p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
                {getCategoryIcon(category)}
                {getCategoryLabel(category)}
                <Badge variant="secondary" className="ml-3 bg-slate-100 text-slate-600 shadow-none hover:bg-slate-200">
                  {categoryTemplates.length}
                </Badge>
              </h2>
              <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categoryTemplates.map((template) => (
                  <Card key={template.id} className="rounded-2xl border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group overflow-hidden flex flex-col">
                    <CardHeader className="pb-3 bg-slate-50/50 group-hover:bg-blue-50/30 transition-colors border-b border-slate-100">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base mb-1 truncate font-bold text-slate-800">{template.name}</CardTitle>
                          <CardDescription className="text-xs line-clamp-2 text-slate-500 font-medium">
                            {template.description || 'Sem descrição'}
                          </CardDescription>
                        </div>
                        {template.is_system ? (
                          <Badge variant="secondary" className="text-[10px] shrink-0 bg-indigo-50 text-indigo-700 shadow-none border-indigo-100 border">
                            Sistema
                          </Badge>
                        ) : !template.user_id ? (
                          <Badge variant="secondary" className="text-[10px] shrink-0 bg-emerald-50 text-emerald-700 shadow-none border-emerald-100 border">
                            Comunidade
                          </Badge>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {template.subcategory && (
                          <Badge variant="outline" className="text-[10px] shadow-none border-slate-200 text-slate-600 bg-white">
                            {template.subcategory}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] shadow-none border-slate-200 text-slate-600 bg-white flex items-center">
                          <FileText className="w-3 h-3 mr-1 opacity-50" /> {(template.placeholders as string[])?.length || 0} campos
                        </Badge>
                      </div>
                      <div className="flex gap-2 w-full mt-auto pt-2">
                        <Button
                          onClick={() => handleUseTemplate(template)}
                          size="sm"
                          className="flex-1 rounded-full bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm transition-transform hover:-translate-y-0.5 w-full"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          Usar Template
                        </Button>
                        <Button
                          onClick={() => handleEditTemplate(template)}
                          size="sm"
                          variant="outline"
                          className="rounded-full w-10 h-9 p-0 shadow-sm border-slate-200 hover:bg-slate-50 shrink-0"
                          title="Editar/Duplicar Template"
                        >
                          <Edit className="h-4 w-4 text-slate-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

