'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface OABSearchDialogProps {
  children: React.ReactNode
}

export function OABSearchDialog({ children }: OABSearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [oabNumber, setOabNumber] = useState('')
  const [uf, setUf] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [lawyerName, setLawyerName] = useState<string | null>(null)

  const ufOptions = [
    'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
    'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
  ]

  const handleSearch = async () => {
    if (!oabNumber.trim() || !uf) {
      toast.error('Preencha o número da OAB e selecione o UF')
      return
    }

    setIsSearching(true)
    setResults([])

    try {
      const response = await fetch('/api/datajud/search-by-oab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oabNumber: oabNumber.trim(), uf })
      })

      if (!response.ok) {
        throw new Error('Erro na busca')
      }

      const data = await response.json()
      setResults(data.processes || [])
      setLawyerName(data.lawyerName || null)

      if (data.processes.length === 0) {
        if (data.lawyerName) {
          toast.success(`Advogado localizado: ${data.lawyerName}, mas nenhum processo foi encontrado.`)
        } else {
          toast.info('Nenhum processo encontrado para esta OAB')
        }
      } else {
        toast.success(`${data.processes.length} processo(s) encontrado(s)`)
      }
    } catch (error) {
      console.error('OAB search error:', error)
      toast.error('Erro ao buscar processos. Tente novamente.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleImportProcess = async (process: any) => {
    try {
      const response = await fetch('/api/processes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(process)
      })

      if (!response.ok) throw new Error('Erro ao importar')

      toast.success('Processo importado com sucesso!')
      // Atualizar lista removendo o processo importado
      setResults(prev => prev.filter(p => p.numeroProcesso !== process.numeroProcesso))
    } catch (error) {
      toast.error('Erro ao importar processo')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buscar Processos por OAB</DialogTitle>
          <DialogDescription>
            Encontre processos associados ao seu número de OAB e UF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="oab-number">Número da OAB</Label>
              <Input
                id="oab-number"
                placeholder="Ex: 123456"
                value={oabNumber}
                onChange={(e) => setOabNumber(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uf">UF</Label>
              <Select value={uf} onValueChange={setUf}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o UF" />
                </SelectTrigger>
                <SelectContent>
                  {ufOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={isSearching || !oabNumber || !uf}
            className="w-full"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar Processos
              </>
            )}
          </Button>

          {lawyerName && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-blue-900">
                Advogado: <span className="font-bold">{lawyerName}</span>
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Processos Encontrados:</h3>
              {results.map((process: any) => (
                <Card key={process.numeroProcesso} className="p-3">
                  <CardContent className="p-0 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{process.numeroProcesso}</p>
                        <p className="text-xs text-slate-600">{process.classe || 'Classe não informada'}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] h-4">
                            {process.tribunal}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] h-4">
                            OAB: {process.representanteOAB || `${oabNumber}/${uf}`}
                          </Badge>
                          {process.origem && (
                            <Badge variant="outline" className="text-[10px] h-4 bg-slate-50">
                              Fonte: {process.origem}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleImportProcess(process)}
                        className="h-8"
                      >
                        Importar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {results.length === 0 && !isSearching && (
            <div className="text-center py-6 text-slate-400">
              {lawyerName ? (
                <div className="flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
                  <p className="text-slate-700 font-semibold text-sm">Nenhum processo público encontrado automaticamente</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    O advogado <span className="font-bold">{lawyerName}</span> foi identificado, porém não foi possível localizar processos via busca automática.
                  </p>
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left w-full max-w-sm">
                    <p className="text-xs font-semibold text-amber-800 mb-2">💡 O que fazer:</p>
                    <ul className="text-xs text-amber-700 space-y-1.5">
                      <li className="flex gap-1.5">
                        <span className="font-bold">1.</span>
                        <span>Use o botão <strong>&quot;Pesquisar&quot;</strong> na tela de processos para buscar por número do processo.</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="font-bold">2.</span>
                        <span>Ou cadastre seus processos <strong>manualmente</strong> clicando em <strong>&quot;Novo Processo&quot;</strong>.</span>
                      </li>
                    </ul>
                    <p className="text-[10px] text-amber-600 mt-2 italic">
                      Alguns tribunais (como TJBA) não disponibilizam dados de advogados na API pública,
                      exigindo consulta manual.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4" />
                  <p>Digite seu número de OAB e UF para buscar processos</p>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}