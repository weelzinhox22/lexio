'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Download, FileText, Wand2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Template = {
  id: string
  name: string
  content: string
  placeholders: string[]
}

export function TemplateViewer({
  template,
  onClose,
  userId,
}: {
  template: Template
  onClose: () => void
  userId: string
}) {
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({})
  const [filledContent, setFilledContent] = useState('')
  const [clientData, setClientData] = useState<any>(null)
  const [processData, setProcessData] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Carregar dados do usuário para preencher automaticamente
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const supabase = createClient()
    
    // Dados do advogado
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (profile) {
      setUserData(profile)
      // Preencher dados do advogado automaticamente
      const autoFill: Record<string, string> = {
        NOME_ADVOGADO: profile.full_name || '',
        NUMERO_OAB: profile.oab_number || '',
        UF_OAB: profile.oab_state || 'BA',
        // Adicionar mais campos conforme necessário
      }
      setPlaceholderValues((prev) => ({ ...prev, ...autoFill }))
    }

    // Buscar último cliente para sugestão
    const { data: lastClient } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (lastClient) {
      setClientData(lastClient)
    }
  }

  const autoFillFromClient = () => {
    if (!clientData) return
    
    const autoFill: Record<string, string> = {
      NOME_CLIENTE: clientData.name || '',
      CPF_CLIENTE: clientData.cpf || '',
      RG_CLIENTE: clientData.rg || '',
      ENDERECO_CLIENTE: clientData.address || '',
      CIDADE_CLIENTE: clientData.city || '',
      ESTADO_CLIENTE: clientData.state || '',
      TELEFONE_CLIENTE: clientData.phone || '',
      EMAIL_CLIENTE: clientData.email || '',
    }
    
    setPlaceholderValues((prev) => ({ ...prev, ...autoFill }))
  }

  useEffect(() => {
    // Preencher template com os valores
    let content = template.content
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      content = content.replace(regex, value || `{{${key}}}`)
    })
    
    // Preencher DATA_ATUAL automaticamente
    const today = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    content = content.replace(/{{DATA_ATUAL}}/g, today)
    
    setFilledContent(content)
  }, [placeholderValues, template.content])

  const handleExport = () => {
    const blob = new Blob([filledContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const placeholders = (template.placeholders as string[]) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onClose} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">{template.name}</h2>
          <p className="text-sm text-slate-600">Preencha os campos para gerar o documento</p>
        </div>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário de preenchimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Campos do Documento
              </span>
              {clientData && (
                <Button onClick={autoFillFromClient} size="sm" variant="outline">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Auto-preencher
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
            {placeholders.map((placeholder) => {
              const isMultiline = placeholder.includes('DESCRICAO') || placeholder.includes('TEXTO')
              
              return (
                <div key={placeholder} className="space-y-2">
                  <Label htmlFor={placeholder} className="text-xs font-semibold text-slate-700">
                    {placeholder.replace(/_/g, ' ')}
                  </Label>
                  {isMultiline ? (
                    <Textarea
                      id={placeholder}
                      value={placeholderValues[placeholder] || ''}
                      onChange={(e) =>
                        setPlaceholderValues((prev) => ({ ...prev, [placeholder]: e.target.value }))
                      }
                      placeholder={`Digite ${placeholder.toLowerCase().replace(/_/g, ' ')}`}
                      rows={3}
                      className="text-sm"
                    />
                  ) : (
                    <Input
                      id={placeholder}
                      value={placeholderValues[placeholder] || ''}
                      onChange={(e) =>
                        setPlaceholderValues((prev) => ({ ...prev, [placeholder]: e.target.value }))
                      }
                      placeholder={`Digite ${placeholder.toLowerCase().replace(/_/g, ' ')}`}
                      className="text-sm"
                    />
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Visualização do documento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pré-visualização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white border-2 border-slate-200 rounded-lg p-6 min-h-[600px] max-h-[600px] overflow-y-auto font-mono text-sm whitespace-pre-wrap">
              {filledContent}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

