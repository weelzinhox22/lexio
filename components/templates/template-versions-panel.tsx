'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { History, RotateCcw, Eye, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TemplateVersion {
  id: string
  template_id: string
  version_number: number
  content: string
  placeholders: string[]
  created_at: string
  created_by: string | null
}

interface TemplateVersionsPanelProps {
  templateId: string
  userId: string
  isAdmin?: boolean
}

export function TemplateVersionsPanel({
  templateId,
  userId,
  isAdmin = false,
}: TemplateVersionsPanelProps) {
  const [versions, setVersions] = useState<TemplateVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    loadVersions()
  }, [templateId])

  const loadVersions = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}/versions`)
      if (!response.ok) {
        throw new Error('Erro ao carregar versões')
      }

      const data = await response.json()
      setVersions(data.versions || [])
    } catch (error) {
      console.error('Erro ao carregar versões:', error)
      toast.error('Erro ao carregar versões')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (version: TemplateVersion) => {
    if (!confirm(`Deseja restaurar a versão ${version.version_number}?`)) {
      return
    }

    setRestoring(true)
    try {
      const response = await fetch(`/api/templates/${templateId}/versions/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version_number: version.version_number,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao restaurar versão')
      }

      toast.success('Versão restaurada com sucesso!')
      window.location.reload()
    } catch (error) {
      console.error('Erro ao restaurar versão:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao restaurar versão')
    } finally {
      setRestoring(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Versões
        </CardTitle>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            Nenhuma versão anterior encontrada
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Versões Anteriores</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedVersion?.id === version.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">
                          Versão {version.version_number}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {format(new Date(version.created_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedVersion(version)
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-7"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRestore(version)
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-7"
                          disabled={restoring}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restaurar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Preview da Versão</h3>
              <ScrollArea className="h-[400px] border border-slate-200 rounded-lg">
                {selectedVersion ? (
                  <div className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          Versão {selectedVersion.version_number}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(selectedVersion.created_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleRestore(selectedVersion)}
                        variant="outline"
                        size="sm"
                        disabled={restoring}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restaurar
                      </Button>
                    </div>
                    <pre className="whitespace-pre-wrap font-serif text-sm text-slate-900">
                      {selectedVersion.content}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-slate-500">Selecione uma versão para visualizar</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

