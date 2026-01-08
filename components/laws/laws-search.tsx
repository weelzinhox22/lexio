'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Search, BookOpen, ExternalLink, Loader2, FileText, Calendar, AlertCircle, Users, Heart, HeartOff, Star } from 'lucide-react'
import { BRAZILIAN_LAWS } from '@/lib/data/brazilian-laws'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// Base de leis brasileiras (expandida com 50+ leis)
const ALL_LAWS = BRAZILIAN_LAWS

// Leis mais populares para exibição inicial
const POPULAR_LAWS = [
  {
    name: 'Lei Maria da Penha',
    number: 'Lei nº 11.340/2006',
    url: 'https://www.planalto.gov.br/ccivil_03/_Ato2004-2006/2006/Lei/L11340.htm',
    category: 'Direito Penal',
    description: 'Cria mecanismos para coibir a violência doméstica e familiar contra a mulher',
  },
  {
    name: 'Código de Processo Civil',
    number: 'Lei nº 13.105/2015',
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm',
    category: 'Processo Civil',
    description: 'Novo Código de Processo Civil',
  },
  {
    name: 'Código Civil',
    number: 'Lei nº 10.406/2002',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm',
    category: 'Direito Civil',
    description: 'Institui o Código Civil',
  },
  {
    name: 'Código de Defesa do Consumidor',
    number: 'Lei nº 8.078/1990',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm',
    category: 'Direito do Consumidor',
    description: 'Dispõe sobre a proteção do consumidor',
  },
  {
    name: 'Código Penal',
    number: 'Decreto-Lei nº 2.848/1940',
    url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm',
    category: 'Direito Penal',
    description: 'Código Penal Brasileiro',
  },
  {
    name: 'Consolidação das Leis do Trabalho (CLT)',
    number: 'Decreto-Lei nº 5.452/1943',
    url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm',
    category: 'Direito Trabalhista',
    description: 'Aprova a Consolidação das Leis do Trabalho',
  },
  {
    name: 'Estatuto da Criança e do Adolescente',
    number: 'Lei nº 8.069/1990',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l8069.htm',
    category: 'Direitos Humanos',
    description: 'Dispõe sobre o Estatuto da Criança e do Adolescente',
  },
  {
    name: 'Lei de Improbidade Administrativa',
    number: 'Lei nº 8.429/1992',
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l8429.htm',
    category: 'Direito Administrativo',
    description: 'Dispõe sobre as sanções aplicáveis em virtude da prática de atos de improbidade administrativa',
  },
  {
    name: 'Lei Geral de Proteção de Dados (LGPD)',
    number: 'Lei nº 13.709/2018',
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm',
    category: 'Direito Digital',
    description: 'Lei Geral de Proteção de Dados Pessoais',
  },
]

export function LawsSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLaw, setSelectedLaw] = useState<typeof POPULAR_LAWS[0] | null>(null)
  const [lawContent, setLawContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<typeof POPULAR_LAWS>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteNotes, setFavoriteNotes] = useState('')
  const [viewMode, setViewMode] = useState<'iframe' | 'external'>('iframe')
  const [isSavingFavorite, setIsSavingFavorite] = useState(false)
  const supabase = createClient()

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    const term = searchTerm.toLowerCase()
    
    // Busca inteligente: procura em todos os campos incluindo keywords
    const results = ALL_LAWS.filter((law) => {
      const searchIn = [
        law.name,
        law.number,
        law.category,
        law.description,
        ...((law as any).keywords || []),
      ].map((s) => s.toLowerCase())
      
      return searchIn.some((field) => field.includes(term))
    })

    // Ordenar por relevância: priorizar matches no nome
    const sorted = results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(term)
      const bNameMatch = b.name.toLowerCase().includes(term)
      
      if (aNameMatch && !bNameMatch) return -1
      if (!aNameMatch && bNameMatch) return 1
      return 0
    })

    setSearchResults(sorted)
  }

  // Buscar enquanto digita (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Verificar se lei está favoritada
  useEffect(() => {
    if (selectedLaw) {
      checkFavoriteStatus()
    }
  }, [selectedLaw])

  const checkFavoriteStatus = async () => {
    if (!selectedLaw) return
    
    try {
      const response = await fetch(`/api/laws/favorite?law_url=${encodeURIComponent(selectedLaw.url)}`)
      const data = await response.json()
      
      if (data.isFavorite && data.favorite) {
        setIsFavorite(true)
        setFavoriteNotes(data.favorite.notes || '')
      } else {
        setIsFavorite(false)
        setFavoriteNotes('')
      }
    } catch (error) {
      console.error('Erro ao verificar favorito:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!selectedLaw) return
    
    setIsSavingFavorite(true)
    
    try {
      if (isFavorite) {
        // Remover dos favoritos
        const response = await fetch(`/api/laws/favorite?law_url=${encodeURIComponent(selectedLaw.url)}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setIsFavorite(false)
          setFavoriteNotes('')
        }
      } else {
        // Adicionar aos favoritos
        const response = await fetch('/api/laws/favorite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            law_name: selectedLaw.name,
            law_number: selectedLaw.number,
            law_url: selectedLaw.url,
            law_category: selectedLaw.category,
            notes: favoriteNotes || null,
          }),
        })
        
        if (response.ok) {
          setIsFavorite(true)
        }
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error)
      alert('Erro ao favoritar lei')
    } finally {
      setIsSavingFavorite(false)
    }
  }

  const handleUpdateNotes = async () => {
    if (!selectedLaw || !isFavorite) return
    
    setIsSavingFavorite(true)
    
    try {
      const response = await fetch('/api/laws/favorite/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          law_url: selectedLaw.url,
          notes: favoriteNotes,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar notas')
      }
    } catch (error) {
      console.error('Erro ao atualizar notas:', error)
      alert('Erro ao salvar notas')
    } finally {
      setIsSavingFavorite(false)
    }
  }

  const handleOpenLaw = (law: typeof POPULAR_LAWS[0]) => {
    setSelectedLaw(law)
    setIsLoading(true)
    setViewMode('iframe')
    
    // Simular carregamento
    setTimeout(() => {
      setIsLoading(false)
    }, 300)
  }

  const displayedLaws = searchResults.length > 0 ? searchResults : POPULAR_LAWS

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
      {/* Painel de Busca */}
      <div className="lg:col-span-1 space-y-4 md:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Legislação
            </CardTitle>
            <CardDescription>
              Digite o nome, número ou área da lei
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Ex: Lei Maria da Penha, CDC, 8.078"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10 w-full"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSearchResults([])
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <Button onClick={handleSearch} size="icon" className="shrink-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Link para favoritos */}
            <Link href="/dashboard/laws/favorites">
              <Button variant="outline" className="w-full">
                <Star className="h-4 w-4 mr-2" />
                Minhas Leis Favoritas
              </Button>
            </Link>

            <div className="pt-4 border-t">
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {searchResults.length > 0
                  ? `${searchResults.length} resultado${searchResults.length !== 1 ? 's' : ''}`
                  : 'Leis Mais Consultadas'}
              </p>
              
              {searchTerm.trim() && searchResults.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-amber-900 mb-1">Nenhuma lei encontrada</p>
                  <p className="text-xs text-amber-700">
                    Tente buscar por: nome da lei, número, ou área do direito
                  </p>
                  <p className="text-xs text-amber-600 mt-2">
                    Exemplo: "maria da penha", "8.078", "consumidor"
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] md:max-h-[600px] overflow-y-auto">
                  {displayedLaws.map((law, index) => (
                  <button
                    key={index}
                    onClick={() => handleOpenLaw(law)}
                    className={`w-full text-left p-2.5 md:p-3 rounded-lg border transition-all ${
                      selectedLaw?.number === law.number
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <p className="font-semibold text-slate-900 text-xs md:text-sm mb-1 line-clamp-2">{law.name}</p>
                    <p className="text-xs text-slate-600 mb-2">{law.number}</p>
                    <Badge variant="outline" className="text-xs">
                      {law.category}
                    </Badge>
                  </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Painel de Visualização */}
      <div className="lg:col-span-2">
        {selectedLaw ? (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl md:text-2xl mb-2 break-words">{selectedLaw.name}</CardTitle>
                  <CardDescription className="text-sm md:text-base">{selectedLaw.description}</CardDescription>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-3">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                      {selectedLaw.number}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{selectedLaw.category}</Badge>
                  </div>
                </div>
                <Button
                  onClick={handleToggleFavorite}
                  disabled={isSavingFavorite}
                  variant={isFavorite ? "default" : "outline"}
                  size="sm"
                  className={`shrink-0 ${isFavorite ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                >
                  {isSavingFavorite ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFavorite ? (
                    <>
                      <Heart className="h-4 w-4 mr-2 fill-current" />
                      Favorita
                    </>
                  ) : (
                    <>
                      <HeartOff className="h-4 w-4 mr-2" />
                      Favoritar
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  {/* Modo de visualização */}
                  <div className="flex gap-2 border-b pb-3">
                    <Button
                      variant={viewMode === 'iframe' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('iframe')}
                      className="flex-1"
                    >
                      Ver Aqui
                    </Button>
                    <Button
                      variant={viewMode === 'external' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('external')}
                      className="flex-1"
                    >
                      Ver no Planalto
                    </Button>
                  </div>

                  {/* Iframe ou conteúdo externo */}
                  {viewMode === 'iframe' ? (
                    <div className="border rounded-lg overflow-hidden bg-slate-50">
                      <iframe
                        src={selectedLaw.url}
                        className="w-full h-[600px] md:h-[700px] border-0"
                        title={selectedLaw.name}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-amber-800 flex items-start gap-2 mb-4">
                        <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>Clique no botão abaixo para abrir a lei completa no site do Planalto.</span>
                      </p>
                      <Button
                        onClick={() => window.open(selectedLaw.url, '_blank')}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir no Planalto (Texto Completo)
                      </Button>
                    </div>
                  )}

                  {/* Notas pessoais (se favoritada) */}
                  {isFavorite && (
                    <div className="border-t pt-4 space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Minhas Notas sobre esta Lei
                      </label>
                      <Textarea
                        value={favoriteNotes}
                        onChange={(e) => setFavoriteNotes(e.target.value)}
                        onBlur={handleUpdateNotes}
                        placeholder="Adicione suas notas pessoais sobre esta lei..."
                        rows={3}
                        className="text-sm"
                      />
                      <p className="text-xs text-slate-500">Suas notas são salvas automaticamente</p>
                    </div>
                  )}

                  {/* Ações rápidas */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3 border-t pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedLaw.url)
                        alert('Link copiado!')
                      }}
                      className="w-full text-xs md:text-sm"
                    >
                      <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Copiar Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const text = `${selectedLaw.name} (${selectedLaw.number})\n${selectedLaw.description}\n\nLink: ${selectedLaw.url}`
                        navigator.clipboard.writeText(text)
                        alert('Informações copiadas!')
                      }}
                      className="w-full text-xs md:text-sm"
                    >
                      <Users className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Copiar Info
                    </Button>
                  </div>

                  {/* Informações adicionais */}
                  <div className="pt-2 border-t space-y-2">
                    <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Sobre esta Lei
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{selectedLaw.description}</p>
                    <div className="bg-slate-50 rounded-lg p-2 md:p-3 mt-2">
                      <p className="text-xs text-slate-600">
                        <strong>Fonte:</strong> Planalto - Presidência da República
                      </p>
                      <p className="text-xs text-slate-600 mt-1 break-all">
                        <strong>URL:</strong>{' '}
                        <a href={selectedLaw.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedLaw.url}
                        </a>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center min-h-[400px] md:min-h-[500px]">
            <CardContent className="text-center py-8 md:py-12 px-4">
              <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-slate-700 mb-2">
                Selecione uma lei para visualizar
              </h3>
              <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto">
                Escolha uma das leis mais consultadas ao lado ou use a busca para encontrar a legislação desejada.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

