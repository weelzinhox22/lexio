'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Search, FileText, Users, CheckSquare, Briefcase } from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  type: 'process' | 'contact' | 'task' | 'publication'
  subtitle?: string
  href: string
}

interface GlobalSearchProps {
  placeholder?: string
}

export function GlobalSearch({ placeholder = 'Pesquisar processos, contatos ou tarefas...' }: GlobalSearchProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const searchAll = async () => {
      if (!query || query.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.results || [])
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(searchAll, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.href)
    setOpen(false)
    setQuery('')
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'process':
        return <Briefcase className="w-4 h-4 text-blue-600" />
      case 'contact':
        return <Users className="w-4 h-4 text-green-600" />
      case 'task':
        return <CheckSquare className="w-4 h-4 text-orange-600" />
      case 'publication':
        return <FileText className="w-4 h-4 text-purple-600" />
      default:
        return <Search className="w-4 h-4 text-slate-600" />
    }
  }

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'process':
        return 'Processo'
      case 'contact':
        return 'Contato'
      case 'task':
        return 'Tarefa'
      case 'publication':
        return 'Publicação'
      default:
        return 'Resultado'
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="relative w-full md:w-96 justify-start text-sm text-muted-foreground bg-slate-50 hover:bg-slate-100"
        >
          <Search className="w-4 h-4 mr-2 text-slate-600" />
          <span className="hidden sm:inline-flex">{placeholder}</span>
          <span className="inline-flex sm:hidden">Pesquisar...</span>
          <kbd className="pointer-events-none absolute right-1.5 hidden h-6 select-none items-center gap-1 rounded border border-slate-200 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full md:w-96 p-0 shadow-lg">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            className="border-0"
          />
          <CommandList>
            {!query && (
              <CommandEmpty className="py-8">
                <div className="text-center text-sm text-slate-500">
                  <p className="mb-2">Digite para pesquisar</p>
                  <p className="text-xs text-slate-400">
                    Processos, contatos, tarefas e publicações
                  </p>
                </div>
              </CommandEmpty>
            )}

            {loading && query && (
              <CommandEmpty className="py-4">
                <div className="text-sm text-slate-500">Pesquisando...</div>
              </CommandEmpty>
            )}

            {!loading && results.length === 0 && query && (
              <CommandEmpty className="py-4">
                <div className="text-sm text-slate-500">
                  Nenhum resultado encontrado para "{query}"
                </div>
              </CommandEmpty>
            )}

            {results.length > 0 && (
              <>
                {/* Agrupar por tipo */}
                {results.some((r) => r.type === 'process') && (
                  <CommandGroup heading="Processos">
                    {results
                      .filter((r) => r.type === 'process')
                      .map((result) => (
                        <CommandItem
                          key={result.id}
                          value={result.id}
                          onSelect={() => handleSelectResult(result)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {getIcon(result.type)}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{result.title}</p>
                              {result.subtitle && (
                                <p className="text-xs text-slate-500">{result.subtitle}</p>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}

                {results.some((r) => r.type === 'contact') && (
                  <CommandGroup heading="Contatos">
                    {results
                      .filter((r) => r.type === 'contact')
                      .map((result) => (
                        <CommandItem
                          key={result.id}
                          value={result.id}
                          onSelect={() => handleSelectResult(result)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {getIcon(result.type)}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{result.title}</p>
                              {result.subtitle && (
                                <p className="text-xs text-slate-500">{result.subtitle}</p>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}

                {results.some((r) => r.type === 'task') && (
                  <CommandGroup heading="Tarefas">
                    {results
                      .filter((r) => r.type === 'task')
                      .map((result) => (
                        <CommandItem
                          key={result.id}
                          value={result.id}
                          onSelect={() => handleSelectResult(result)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {getIcon(result.type)}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{result.title}</p>
                              {result.subtitle && (
                                <p className="text-xs text-slate-500">{result.subtitle}</p>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}

                {results.some((r) => r.type === 'publication') && (
                  <CommandGroup heading="Publicações">
                    {results
                      .filter((r) => r.type === 'publication')
                      .map((result) => (
                        <CommandItem
                          key={result.id}
                          value={result.id}
                          onSelect={() => handleSelectResult(result)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {getIcon(result.type)}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{result.title}</p>
                              {result.subtitle && (
                                <p className="text-xs text-slate-500">{result.subtitle}</p>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
