'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Calendar,
  BookOpen,
  User,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Publication {
  id: string
  process_number: string | null
  process_title: string | null
  publication_type: string | null
  publication_date: string
  diary_name: string | null
  diary_date: string | null
  searched_name: string | null
  content: string | null
  pje_url: string | null
  status: 'untreated' | 'treated' | 'discarded'
  treated_at: string | null
  discarded_at: string | null
  notes: string | null
  created_at: string
}

export default function PublicationsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [publications, setPublications] = useState<Publication[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showAlert, setShowAlert] = useState(true)
  const [processSearch, setProcessSearch] = useState<string>('')
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('untreated')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Estatísticas
  const [stats, setStats] = useState({
    untreatedToday: 0,
    treatedToday: 0,
    discardedToday: 0,
    untreated: 0,
  })

  useEffect(() => {
    loadProfile()
    loadPublications()
    // Buscar automaticamente ao carregar se OAB estiver configurada
    const timer = setTimeout(() => {
      autoSearchIfNeeded()
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    loadPublications()
  }, [statusFilter, stateFilter, dateFilter])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        // Ativar busca automática se OAB estiver configurada
        if (data.oab_number && !data.jusbrasil_auto_search) {
          await supabase
            .from('profiles')
            .update({ jusbrasil_auto_search: true })
            .eq('id', user.id)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  async function autoSearchIfNeeded() {
    // Não buscar automaticamente se já tem publicações recentes
    if (publications.length > 0) {
      const recentPublications = publications.filter(p => {
        const pubDate = new Date(p.publication_date)
        const daysDiff = (new Date().getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff < 7 // Publicações dos últimos 7 dias
      })
      if (recentPublications.length > 0) return
    }
    
    // Buscar automaticamente se:
    // 1. Tem OAB configurada OU
    // 2. Tem processos cadastrados
    
    const hasOAB = profile?.oab_number && profile?.oab_state
    const shouldSearch = hasOAB
    
    if (!shouldSearch) return
    
    // Verificar última busca (buscar apenas se passou mais de 6 horas)
    const lastSearch = profile.jusbrasil_last_search_at
    if (lastSearch) {
      const lastSearchDate = new Date(lastSearch)
      const now = new Date()
      const hoursDiff = (now.getTime() - lastSearchDate.getTime()) / (1000 * 60 * 60)
      if (hoursDiff < 6) {
        return // Buscou recentemente, não buscar novamente
      }
    }

    // Buscar automaticamente - vai buscar nos processos cadastrados e por OAB
    await handleSearch(true)
  }

  async function loadPublications() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (dateFilter !== 'all') {
        const today = new Date().toISOString().split('T')[0]
        if (dateFilter === 'today') {
          params.append('date_from', today)
          params.append('date_to', today)
        } else if (dateFilter === 'week') {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          params.append('date_from', weekAgo.toISOString().split('T')[0])
        }
      }

      const response = await fetch(`/api/jusbrasil/publications?${params.toString()}`)
      const data = await response.json()

      if (data.publications) {
        let filtered = data.publications
        
        // Filtrar por termo de busca
        if (searchTerm) {
          filtered = filtered.filter((p: Publication) => 
            p.process_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.process_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.searched_name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        
        setPublications(filtered)
        calculateStats(data.publications)
      } else {
        // Se não retornou publicações, garantir que o array está vazio
        setPublications([])
        calculateStats([])
      }
    } catch (error) {
      console.error('Error loading publications:', error)
      setPublications([])
      calculateStats([])
    } finally {
      setLoading(false)
    }
  }

  function calculateStats(pubs: Publication[]) {
    const today = new Date().toISOString().split('T')[0]
    
    const untreatedToday = pubs.filter(
      (p) => p.status === 'untreated' && p.publication_date === today
    ).length

    const treatedToday = pubs.filter(
      (p) => p.status === 'treated' && p.treated_at?.startsWith(today)
    ).length

    const discardedToday = pubs.filter(
      (p) => p.status === 'discarded' && p.discarded_at?.startsWith(today)
    ).length

    const untreated = pubs.filter((p) => p.status === 'untreated').length

    setStats({
      untreatedToday,
      treatedToday,
      discardedToday,
      untreated,
    })
  }

  async function handleSearch(silent = false, processNumber?: string) {
    setSearching(true)
    try {
      // Se forneceu número de processo, buscar por ele
      if (processNumber || processSearch) {
        const procNum = processNumber || processSearch
        if (!procNum.trim()) {
          if (!silent) {
            toast.error('Número de processo inválido', {
              description: 'Digite um número de processo válido no formato CNJ',
            })
          }
          setSearching(false)
          return
        }

        const response = await fetch('/api/jusbrasil/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ processNumber: procNum.trim() }),
        })

        const data = await response.json()

        if (data.success) {
          if (!silent) {
            const count = data.publications_saved || 0
            if (count > 0) {
              toast.success('Busca realizada com sucesso!', {
                description: `${count} publicação(ões) encontrada(s) na API do DataJud (CNJ)`,
              })
            } else {
              toast.warning('Nenhuma publicação encontrada', {
                description: 'O processo foi encontrado, mas não há publicações disponíveis no momento.',
              })
            }
          }
          setProcessSearch('') // Limpar campo após busca
          await loadPublications()
        } else {
          if (!silent) {
            // Mostrar mensagem amigável retornada pela API
            const errorMessage = data.message || data.error || 'Erro desconhecido ao buscar processo'
            toast.error('Erro ao buscar processo', {
              description: errorMessage,
            })
          }
        }
        setSearching(false)
        return
      }

      // Buscar automaticamente: processos cadastrados + OAB (se configurada)
      // Não precisa de OAB obrigatoriamente, pode buscar só nos processos cadastrados
      const oabMatch = profile?.oab_number?.match(/OAB\/([A-Z]{2})\s*(\d+)/i)
      const oabNumber = oabMatch ? oabMatch[2] : profile?.oab_number?.replace(/OAB\/[A-Z]{2}\s*/i, '') || ''
      const oabState = profile?.oab_state || oabMatch?.[1] || 'BA'

      const response = await fetch('/api/jusbrasil/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          oabNumber: oabNumber || undefined,
          oabState: oabState || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (!silent) {
          const count = data.publications_saved || 0
          toast.success('Busca realizada!', {
            description: `${count} publicação(ões) encontrada(s) e salva(s).`,
          })
        }
        await loadProfile()
        await loadPublications()
      } else {
        if (!silent) {
          toast.error('Erro ao buscar processos', {
            description: data.error || 'Erro desconhecido',
          })
        }
      }
    } catch (error) {
      console.error('Error searching:', error)
      if (!silent) {
        toast.error('Erro ao buscar processos', {
          description: 'Ocorreu um erro inesperado. Tente novamente.',
        })
      }
    } finally {
      setSearching(false)
    }
  }

  async function updatePublicationStatus(id: string, status: 'treated' | 'discarded', notes?: string) {
    try {
      const response = await fetch('/api/jusbrasil/publications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicationId: id, status, notes }),
      })

      const data = await response.json()

      if (data.publication) {
        toast.success('Publicação atualizada!', {
          description: `Status alterado para ${status === 'treated' ? 'tratada' : 'descartada'}`,
        })
        await loadPublications()
      } else {
        toast.error('Erro ao atualizar publicação', {
          description: 'Não foi possível atualizar o status da publicação.',
        })
      }
    } catch (error) {
      console.error('Error updating publication:', error)
      toast.error('Erro ao atualizar publicação', {
        description: 'Ocorreu um erro inesperado. Tente novamente.',
      })
    }
  }

  function toggleExpand(id: string) {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  function expandAll() {
    setExpandedIds(new Set(publications.map(p => p.id)))
  }

  function collapseAll() {
    setExpandedIds(new Set())
  }

  const filteredPublications = publications

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Publicações</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">
            Gerencie as publicações encontradas automaticamente
          </p>
        </div>
        <Button
          onClick={() => handleSearch(false)}
          disabled={searching}
          className="bg-slate-900 hover:bg-slate-800 text-white"
        >
          {searching ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Buscar Processos
            </>
          )}
        </Button>
      </div>

      {/* Aviso */}
      {showAlert && (
        <Alert className="relative">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            As publicações abaixo foram encontradas com seu nome e já estavam disponíveis no Diário Oficial. 
            Novas publicações serão exibidas automaticamente assim que estiverem disponíveis.
          </AlertDescription>
          <button
            onClick={() => setShowAlert(false)}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={stats.untreatedToday > 0 ? 'border-orange-300 bg-orange-50' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Não tratadas de hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.untreatedToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Tratadas hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.treatedToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Descartadas hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.discardedToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Não tratadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.untreated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Busca por Processo */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar por Número de Processo</CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Digite um número de processo no formato CNJ (ex: 0000123-45.2024.8.05.0001) para buscar publicações <strong>reais</strong> na API pública do DataJud (CNJ). Os dados retornados são <strong>oficiais</strong> e vêm diretamente dos tribunais.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: 0000123-45.2024.8.05.0001"
              value={processSearch}
              onChange={(e) => setProcessSearch(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && processSearch.trim()) {
                  handleSearch(false)
                }
              }}
              className="flex-1 font-mono text-sm"
            />
            <Button
              onClick={() => handleSearch(false)}
              disabled={searching || !processSearch.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {searching ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar no DataJud
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            A busca é realizada na API pública do DataJud (CNJ) e retorna dados <strong>reais</strong> do processo, incluindo publicações, movimentações e informações oficiais.
          </p>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o processo ou termo pesquisado"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  loadPublications()
                }}
                className="w-full"
              />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                <SelectItem value="BA">Bahia</SelectItem>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="untreated">Não tratadas</SelectItem>
                <SelectItem value="treated">Tratadas</SelectItem>
                <SelectItem value="discarded">Descartadas</SelectItem>
              </SelectContent>
            </Select>
            {statusFilter === 'untreated' && (
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 px-3 py-2">
                STATUS: NÃO TRATADA
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Publicações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mostrando {filteredPublications.length} publicação(ões)</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={expandAll}
                className="text-sm"
              >
                Expandir todos
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={collapseAll}
                className="text-sm"
              >
                Colapsar todos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Carregando...</div>
          ) : filteredPublications.length === 0 ? (
            <div className="text-center py-8 text-slate-500 space-y-2">
              <p>Nenhuma publicação encontrada.</p>
              {profile?.oab_number ? (
                <p className="text-sm">
                  A busca automática está ativa. As publicações aparecerão automaticamente quando:
                  <br />
                  • Você cadastrar um processo no sistema
                  <br />
                  • Novas publicações forem encontradas vinculadas à sua OAB
                </p>
              ) : (
                <p className="text-sm">
                  Configure seu OAB nas configurações ou cadastre processos para iniciar a busca automática.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Cabeçalho da tabela */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 border-b">
                <div className="col-span-1">
                  <Checkbox />
                </div>
                <div className="col-span-2">DIVULGADO EM</div>
                <div className="col-span-2">TIPO</div>
                <div className="col-span-2">PROCESSO</div>
                <div className="col-span-2">DIÁRIO</div>
                <div className="col-span-2">NOME PESQUISADO</div>
                <div className="col-span-1">STATUS</div>
              </div>

              {/* Publicações */}
              {filteredPublications.map((pub) => {
                const isExpanded = expandedIds.has(pub.id)
                const isSelected = selectedIds.has(pub.id)
                
                return (
                  <div
                    key={pub.id}
                    className="border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {/* Linha principal */}
                    <div className="grid grid-cols-12 gap-4 p-4 items-center">
                      <div className="col-span-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(pub.id)}
                        />
                      </div>
                      <div className="col-span-2 text-sm">
                        {pub.publication_date && (
                          <div>
                            <div className="font-medium">
                              {format(new Date(pub.publication_date), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                            {pub.diary_date && pub.diary_date !== pub.publication_date && (
                              <div className="text-xs text-slate-500">
                                Publicado em: {format(new Date(pub.diary_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <Badge variant="outline">{pub.publication_type || 'N/A'}</Badge>
                      </div>
                      <div className="col-span-2 text-sm">
                        {pub.process_number ? (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">{pub.process_number}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </div>
                      <div className="col-span-2 text-sm text-slate-600">
                        {pub.diary_name || 'N/A'}
                      </div>
                      <div className="col-span-2 text-sm text-slate-600">
                        {pub.searched_name || 'N/A'}
                      </div>
                      <div className="col-span-1">
                        <Badge
                          className={
                            pub.status === 'treated'
                              ? 'bg-green-100 text-green-700'
                              : pub.status === 'discarded'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                          }
                        >
                          {pub.status === 'treated'
                            ? 'TRATADA'
                            : pub.status === 'discarded'
                              ? 'DESCARTADA'
                              : 'NÃO TRATADA'}
                        </Badge>
                      </div>
                    </div>

                    {/* Conteúdo expandido */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-slate-200 bg-slate-50">
                        <div className="pt-4 space-y-4">
                          {pub.process_title && (
                            <div>
                              <h4 className="font-medium text-slate-900 mb-2">{pub.process_title}</h4>
                            </div>
                          )}
                          
                          {pub.content && (
                            <div>
                              <p className="text-sm text-slate-600 whitespace-pre-wrap">{pub.content}</p>
                            </div>
                          )}

                           <div className="flex items-center gap-2 flex-wrap">
                             <Button
                               size="sm"
                               variant="outline"
                               className="text-blue-600 border-blue-600 hover:bg-blue-50"
                               asChild
                             >
                               <Link href={`/dashboard/publications/${pub.id}`}>
                                 <ExternalLink className="h-4 w-4 mr-2" />
                                 Ver Detalhes
                               </Link>
                             </Button>
                             {pub.pje_url && (
                               <Button
                                 size="sm"
                                 variant="outline"
                                 className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                                 asChild
                               >
                                 <a href={pub.pje_url} target="_blank" rel="noopener noreferrer">
                                   <ExternalLink className="h-4 w-4 mr-2" />
                                   Acessar no PJe
                                 </a>
                               </Button>
                             )}
                            
                            {pub.status === 'untreated' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => updatePublicationStatus(pub.id, 'treated')}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Tratar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => updatePublicationStatus(pub.id, 'discarded')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Descartar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botão para expandir/colapsar */}
                    <div className="px-4 pb-2">
                      <button
                        onClick={() => toggleExpand(pub.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Colapsar
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Ler mais
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
