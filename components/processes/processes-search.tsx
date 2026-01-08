'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useProcessFavorites, useSearchHistory } from '@/lib/hooks'
import { searchDataJud, convertDataJudToPublication } from '@/lib/datajud-api'
import { ProcessDetailsDashboard } from '@/components/publications/process-details-dashboard'
import { TagSelector } from '@/components/processes/tag-selector'
import { ProcessTag } from '@/lib/constants/process-tags'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Heart, Trash2, Clock, Search, ChevronRight, Loader2, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ProcessData {
  processNumber: string
  classe?: string
  assunto?: string
  tribunal?: string
  tags?: ProcessTag[]
}

interface SelectedProcess extends ProcessData {}

export function ProcessSearch() {
  const router = useRouter()
  const { user } = useUser()
  const { isFavorited, toggleFavorite, updateNotes, favorites } = useProcessFavorites(user?.id)
  const {
    addToHistory,
    getRecentSearches,
    getUniqueProcesses,
    getTodaySearches,
    removeFromHistory,
    clearHistory,
  } = useSearchHistory(user?.id)

  const [searchInput, setSearchInput] = useState('')
  const [selectedProcess, setSelectedProcess] = useState<SelectedProcess | null>(null)
  const [searchResults, setSearchResults] = useState<ProcessData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'history'>('search')
  const [notesInput, setNotesInput] = useState('')
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false)
  const [selectedTags, setSelectedTags] = useState<ProcessTag[]>([])

  // Validate CNJ process number format
  const isValidCNJNumber = useCallback((number: string): boolean => {
    const cleaned = number.replace(/\D/g, '')
    return cleaned.length === 20
  }, [])

  // Format CNJ number for display
  const formatCNJNumber = useCallback((number: string): string => {
    const cleaned = number.replace(/\D/g, '')
    if (cleaned.length !== 20) return number
    return `${cleaned.slice(0, 7)}-${cleaned.slice(7, 11)}.${cleaned.slice(11, 15)}.${cleaned.slice(15, 17)}.${cleaned.slice(17, 20)}`
  }, [])

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!isValidCNJNumber(searchInput)) {
      setSearchError('Número do processo deve ter 20 dígitos no formato CNJ')
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setSearchResults([])
    setSelectedProcess(null)

    try {
      const processNumber = searchInput.replace(/\D/g, '')

      // Search using DataJud API
      const data = await searchDataJud(processNumber)

      if (data) {
        const publications = convertDataJudToPublication(data, processNumber)
        if (publications.length > 0) {
          const results: ProcessData[] = publications.map((pub) => ({
            processNumber: processNumber,
            classe: pub.process_title,
            assunto: pub.content,
            tribunal: pub.diary_name,
          }))

          setSearchResults(results)
          setSelectedProcess({
            processNumber,
            classe: results[0]?.classe,
            assunto: results[0]?.assunto,
            tribunal: results[0]?.tribunal,
          })

          // Add to history
          await addToHistory(processNumber, results.length)
        } else {
          setSearchError('Nenhum processo encontrado com este número')
          await addToHistory(processNumber, 0)
        }
      } else {
        setSearchError('Erro ao buscar processo. Tente novamente.')
        await addToHistory(processNumber, 0)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setSearchError(`Erro na busca: ${errorMessage}`)
    } finally {
      setIsSearching(false)
    }
  }, [searchInput, isValidCNJNumber, addToHistory])

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(async () => {
    if (!selectedProcess) return

    const success = await toggleFavorite(selectedProcess.processNumber, {
      tribunal: selectedProcess.tribunal,
      classe: selectedProcess.classe,
      assunto: selectedProcess.assunto,
    })

    if (success && isFavorited(selectedProcess.processNumber)) {
      setShowNotesDialog(true)
    }
  }, [selectedProcess, toggleFavorite, isFavorited])

  // Handle notes update
  const handleUpdateNotes = useCallback(async () => {
    if (!selectedProcess) return
    await updateNotes(selectedProcess.processNumber, notesInput)
    setShowNotesDialog(false)
  }, [selectedProcess, notesInput, updateNotes])

  // Handle quick search from history
  const handleQuickSearch = useCallback(async (processNumber: string) => {
    setSearchInput(processNumber)
    // Trigger search with the selected process number
    const cleaned = processNumber.replace(/\D/g, '')
    if (cleaned.length === 20) {
      try {
        setIsSearching(true)
        const data = await searchDataJud(cleaned)
        if (data) {
          const publications = convertDataJudToPublication(data, cleaned)
          const results: ProcessData[] = publications.map((pub) => ({
            processNumber: cleaned,
            classe: pub.process_title,
            assunto: pub.content,
            tribunal: pub.diary_name,
          }))
          setSearchResults(results)
          setSelectedProcess({
            processNumber: cleaned,
            classe: results[0]?.classe,
            assunto: results[0]?.assunto,
            tribunal: results[0]?.tribunal,
          })
          await addToHistory(cleaned, results.length)
        }
      } catch (error) {
        console.error('Error in quick search:', error)
      } finally {
        setIsSearching(false)
      }
    }
  }, [addToHistory])

  // Recent searches
  const recentSearches = useMemo(() => getRecentSearches(10), [getRecentSearches])
  const uniqueProcesses = useMemo(() => getUniqueProcesses(), [getUniqueProcesses])
  const todaySearches = useMemo(() => getTodaySearches(), [getTodaySearches])

  return (
    <div className="w-full h-full flex gap-6 p-6">
      {/* Left Panel - Search */}
      <div className="w-1/3 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Buscar Processo</CardTitle>
            <CardDescription>Digite o número CNJ do processo (20 dígitos)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Aviso de instabilidade do DataJud */}
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-800">
                <strong>Aviso:</strong> A pesquisa no DataJud está instável no momento e pode não funcionar conforme esperado. Se a busca falhar, seus processos cadastrados aparecerão como fallback.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Input
                placeholder="Ex: 0000000-00.0000.0.00.0000"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  setSearchError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSearching) {
                    handleSearch()
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Formato: 7 dígitos - 4 dígitos . 4 dígitos . 2 dígitos . 5 dígitos
              </p>
            </div>

            {/* Tag Selector */}
            <div className="pt-2">
              <TagSelector selectedTags={selectedTags} onTagsChange={setSelectedTags} />
            </div>

            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full"
              size="lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>

            {searchError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {searchError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for History, Favorites */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico & Favoritos</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history" className="gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Histórico</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Favoritos</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-3 mt-4">
                {todaySearches.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">HOJE</p>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2 pr-4">
                        {todaySearches.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 rounded border hover:bg-accent cursor-pointer"
                            onClick={() => handleQuickSearch(item.process_number)}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {formatCNJNumber(item.process_number)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.searched_at).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {recentSearches.length > todaySearches.length && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">ANTERIORES</p>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2 pr-4">
                        {recentSearches.slice(todaySearches.length, 5).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 rounded border hover:bg-accent cursor-pointer text-sm"
                            onClick={() => handleQuickSearch(item.process_number)}
                          >
                            <span className="truncate text-muted-foreground">
                              {formatCNJNumber(item.process_number)}
                            </span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {recentSearches.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma busca realizada
                  </p>
                )}

                {recentSearches.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowClearHistoryDialog(true)}
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Limpar Histórico
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="favorites" className="space-y-3 mt-4">
                {favorites.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-4">
                      {favorites.map((fav) => (
                        <div
                          key={fav.id}
                          className="p-3 rounded border hover:bg-accent cursor-pointer space-y-2"
                          onClick={() => handleQuickSearch(fav.process_number)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">
                              {formatCNJNumber(fav.process_number)}
                            </p>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {fav.tribunal}
                            </Badge>
                          </div>
                          {fav.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              📝 {fav.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum processo favorito
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Middle Panel - Results */}
      <div className="w-1/3 flex flex-col gap-4">
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resultados da Busca</CardTitle>
              <CardDescription>{searchResults.length} processo(s) encontrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-4">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedProcess(result)}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedProcess?.processNumber === result.processNumber
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {formatCNJNumber(result.processNumber)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {result.classe}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {result.assunto}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Panel - Detail */}
      <div className="w-1/3 flex flex-col gap-4">
        {selectedProcess ? (
          <>
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {formatCNJNumber(selectedProcess.processNumber)}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {selectedProcess.tribunal}
                    </CardDescription>
                  </div>
                  <Button
                    variant={isFavorited(selectedProcess.processNumber) ? 'default' : 'outline'}
                    size="icon"
                    onClick={handleToggleFavorite}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFavorited(selectedProcess.processNumber)
                          ? 'fill-current'
                          : ''
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <ProcessDetailsDashboard
                  processNumber={selectedProcess.processNumber}
                  isLoading={false}
                  processDetails={null}
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="flex items-center justify-center h-full text-center p-6">
            <div className="space-y-2">
              <Search className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-muted-foreground">Busque um processo para ver detalhes</p>
            </div>
          </Card>
        )}
      </div>

      {/* Notes Dialog */}
      <AlertDialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Adicionar Notas ao Favorito</AlertDialogTitle>
          <AlertDialogDescription>
            Adicione notas sobre este processo para referência futura.
          </AlertDialogDescription>
          <Textarea
            placeholder="Ex: Processo importante, verificar novos prazos..."
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateNotes}>Salvar Notas</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear History Dialog */}
      <AlertDialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Limpar Histórico</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja limpar todo o histórico de buscas? Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await clearHistory()
                setShowClearHistoryDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Limpar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
