'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Eye, Edit, Plus, Filter, X, Sparkles } from 'lucide-react'
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
    const cat = TEMPLATE_CATEGORIES.find((c) => c.value === category)
    return cat?.icon || '📄'
  }

  const getCategoryLabel = (category: string) => {
    const cat = TEMPLATE_CATEGORIES.find((c) => c.value === category)
    return cat?.label || category
  }

  const handleUseTemplate = (template: Template) => {
    router.push(`/dashboard/templates/${template.id}`)
  }

  const handleEditTemplate = (template: Template) => {
    router.push(`/dashboard/templates/${template.id}/edit`)
  }

  const canEdit = (template: Template) => {
    return template.user_id === userId || userIsAdmin || !template.is_system
  }

  return (
    <div className="space-y-6">
      {/* Header e ações */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Templates</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} encontrado
            {filteredTemplates.length !== initialTemplates.length ? ` de ${initialTemplates.length}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userIsAdmin && (
            <Button
              onClick={() => router.push('/dashboard/admin/templates/generate')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar com IA
            </Button>
          )}
          <Button onClick={() => router.push('/dashboard/templates/new')} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
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
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categoria */}
            <div className="w-[180px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="w-[180px]">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
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
            <div key={category}>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span>{getCategoryIcon(category)}</span>
                {getCategoryLabel(category)}
                <Badge variant="secondary" className="ml-2">
                  {categoryTemplates.length}
                </Badge>
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoryTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-1">{template.name}</CardTitle>
                          <CardDescription className="text-xs line-clamp-2">
                            {template.description || 'Sem descrição'}
                          </CardDescription>
                        </div>
                        {template.is_system && (
                          <Badge variant="secondary" className="text-xs">
                            Sistema
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {template.subcategory && (
                          <Badge variant="outline" className="text-xs">
                            {template.subcategory}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {(template.placeholders as string[])?.length || 0} campos
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUseTemplate(template)}
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Usar
                        </Button>
                        {canEdit(template) && (
                          <Button
                            onClick={() => handleEditTemplate(template)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
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

