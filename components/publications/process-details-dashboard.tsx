'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Clock,
  Users,
  DollarSign,
  Building2,
  Gavel,
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

interface ProcessDetails {
  numero: string
  classe: string
  assunto: string
  orgaoJulgador?: string
  juiz?: string
  valorCausa?: string
  status?: string
  partes?: Array<{
    tipo: string
    nome: string
    advogado?: string
  }>
  movimentacoes?: Array<{
    data: string
    descricao: string
    detalhe?: string
    tipo?: string
  }>
}

interface ProcessDetailsDashboardProps {
  processDetails: ProcessDetails | null
  pjeUrl?: string | null
  processNumber?: string | null
  isLoading?: boolean
}

export function ProcessDetailsDashboard({
  processDetails,
  pjeUrl,
  processNumber,
  isLoading = false,
}: ProcessDetailsDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-lg animate-pulse" />
          <div className="space-y-6">
            <div className="h-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-48 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!processDetails) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-900">Dados não disponíveis</p>
              <p className="text-sm text-orange-800 mt-1">
                Não foi possível carregar os detalhes completos do processo. Os dados podem estar indisponíveis na API do tribunal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'bg-green-100 text-green-700'
      case 'arquivado':
        return 'bg-slate-100 text-slate-700'
      case 'suspenso':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-blue-100 text-blue-700'
    }
  }

  const getTribunalUrl = (processNumber: string) => {
    // Extrair código do tribunal (posição 10-11 no formato NNNNNNN-DD.AAAA.J.TR.OOOO)
    const match = processNumber.match(/\.(\d)\.(\d{2})\./)
    if (!match) return null

    const state = match[2]
    const tribunalMap: Record<string, string> = {
      '05': 'https://pje.tjba.jus.br/pje/',
      '19': 'https://www.tjrj.jus.br/',
      '26': 'https://www.tjsp.jus.br/',
      '13': 'https://www.tjmg.jus.br/',
    }

    return tribunalMap[state]
  }

  const tribunalUrl = processNumber ? getTribunalUrl(processNumber) : null

  return (
    <div className="space-y-6">
      {/* Hero Section - Número do Processo e Badges */}
      <Card className="border-2 border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-mono mb-4 break-all">
                {processDetails.numero}
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {processDetails.status && (
                  <Badge className={`${getStatusColor(processDetails.status)} border px-3 py-1 text-sm`}>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {processDetails.status}
                  </Badge>
                )}
                <Badge variant="outline" className="px-3 py-1 text-sm border-slate-300">
                  <Gavel className="h-3 w-3 mr-1" />
                  {processDetails.classe}
                </Badge>
              </div>
              <p className="text-slate-700 text-sm font-medium">
                <span className="text-slate-600">Assunto:</span> {processDetails.assunto}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {tribunalUrl && (
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 whitespace-nowrap"
                  asChild
                >
                  <a href={tribunalUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Ver no Tribunal
                  </a>
                </Button>
              )}
              {pjeUrl && (
                <Button
                  variant="outline"
                  className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 whitespace-nowrap"
                  asChild
                >
                  <a href={pjeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar no PJe
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout de Colunas */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Esquerda - Timeline de Movimentações (66%) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Histórico de Movimentações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processDetails.movimentacoes && processDetails.movimentacoes.length > 0 ? (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6 pr-4">
                    {processDetails.movimentacoes.map((mov, index) => (
                      <div key={index} className="relative flex gap-4 pb-6">
                        {/* Timeline Connector */}
                        {index < processDetails.movimentacoes!.length - 1 && (
                          <div className="absolute left-3.5 top-8 w-0.5 h-12 bg-slate-200" />
                        )}

                        {/* Timeline Dot */}
                        <div className="relative flex-shrink-0 mt-1">
                          <div className="h-8 w-8 rounded-full border-3 border-white shadow-sm flex items-center justify-center" style={{
                            backgroundColor: index === 0 ? '#2563eb' : '#e2e8f0'
                          }}>
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: index === 0 ? '#fff' : '#64748b'
                              }}
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 text-sm md:text-base">
                                {mov.descricao}
                              </p>
                              {mov.detalhe && (
                                <p className="text-xs md:text-sm text-slate-600 mt-1">
                                  {mov.detalhe}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-mono text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap">
                                {mov.data}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>Nenhuma movimentação registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Informações (33%) */}
        <div className="space-y-6">
          {/* Partes Envolvidas */}
          {processDetails.partes && processDetails.partes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-slate-600" />
                  Partes Envolvidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {processDetails.partes.map((parte, index) => (
                  <div key={index} className="border-l-4 pl-4 py-2" style={{
                    borderColor: parte.tipo === 'Autor' ? '#3b82f6' : '#ef4444'
                  }}>
                    <div className="flex items-start gap-2 mb-2">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{
                          backgroundColor: parte.tipo === 'Autor' ? '#3b82f6' : '#ef4444'
                        }}
                      >
                        {parte.tipo === 'Autor' ? 'A' : 'R'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {parte.tipo}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 break-words ml-10">
                      {parte.nome}
                    </p>
                    {parte.advogado && (
                      <p className="text-xs text-slate-600 ml-10 mt-1 break-words">
                        {parte.advogado}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Detalhes do Processo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gavel className="h-5 w-5 text-slate-600" />
                Detalhes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {processDetails.valorCausa && (
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Valor da Causa</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {processDetails.valorCausa}
                    </p>
                  </div>
                </div>
              )}

              {processDetails.orgaoJulgador && (
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Órgão Julgador</p>
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                      {processDetails.orgaoJulgador}
                    </p>
                  </div>
                </div>
              )}

              {processDetails.juiz && (
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Gavel className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Magistrado Responsável</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {processDetails.juiz}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
