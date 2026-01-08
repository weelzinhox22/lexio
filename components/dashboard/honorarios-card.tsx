'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, DollarSign, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Process {
  id: string
  title: string
  process_number: string
  valor_causa: number
  percentual_honorario: number
  honorario_calculado: number
}

interface HonorariosCardProps {
  processes: Process[]
  totalHonorarios: number
}

export function HonorariosCard({ processes, totalHonorarios }: HonorariosCardProps) {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
      <CardHeader className="border-b border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900">Honorários Calculados</CardTitle>
              <CardDescription className="text-slate-600">
                Processos ganhos com honorários automáticos
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="hover:bg-green-100"
          >
            {isVisible ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Ocultar
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Mostrar
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isVisible && (
        <CardContent className="pt-6">
          {/* Total */}
          <div className="mb-6 p-4 rounded-lg bg-white border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total de Honorários</p>
                <p className="text-3xl font-bold text-green-600">
                  R$ {totalHonorarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mb-1">Processos Ganhos</p>
                <p className="text-2xl font-bold text-slate-900">{processes.length}</p>
              </div>
            </div>
          </div>

          {/* Lista de Processos */}
          {processes.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 mb-3">Detalhamento:</p>
              {processes.slice(0, 5).map((process) => (
                <div
                  key={process.id}
                  className="p-3 rounded-lg bg-white border border-slate-200 hover:border-green-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{process.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{process.process_number}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Valor: R$ {Number(process.valor_causa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {process.percentual_honorario}%
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500 mb-1">Honorário</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {Number(process.honorario_calculado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {processes.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="link" className="text-green-600 hover:text-green-700" asChild>
                    <a href="/dashboard/financial">
                      Ver todos os {processes.length} processos
                      <TrendingUp className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">Nenhum processo ganho com honorários calculados ainda.</p>
              <Button variant="link" className="text-green-600 hover:text-green-700 mt-2" asChild>
                <a href="/dashboard/processes">Ir para Processos</a>
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

