'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Download, FileText, Wand2, FileType } from 'lucide-react'
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
  const [userData, setUserData] = useState<any>(null)
  const [exportFormat, setExportFormat] = useState<'txt' | 'pdf' | 'docx'>('txt')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
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
      const autoFill: Record<string, string> = {
        NOME_ADVOGADO: profile.full_name || '',
        NUMERO_OAB: profile.oab_number || '',
        UF_OAB: profile.oab_state || 'BA',
      }
      setPlaceholderValues((prev) => ({ ...prev, ...autoFill }))
    }

    // Buscar último cliente
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
    let content = template.content
    Object.entries(placeholderValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      content = content.replace(regex, value || `{{${key}}}`)
    })
    
    const today = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    content = content.replace(/{{DATA_ATUAL}}/g, today)
    
    setFilledContent(content)
  }, [placeholderValues, template.content])

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      if (exportFormat === 'txt') {
        // Exportar como TXT
        const blob = new Blob([filledContent], { type: 'text/plain;charset=utf-8' })
        downloadBlob(blob, `${template.name}.txt`)
      } else if (exportFormat === 'pdf') {
        // Exportar como PDF
        await exportAsPDF()
      } else if (exportFormat === 'docx') {
        // Exportar como DOCX
        await exportAsWord()
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Erro ao exportar documento. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportAsPDF = async () => {
    // Usar html2pdf ou jsPDF
    const { default: html2pdf } = await import('html2pdf.js')
    
    const element = document.createElement('div')
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; white-space: pre-wrap;">
        ${filledContent}
      </div>
    `
    
    const opt = {
      margin: 1,
      filename: `${template.name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }
    
    html2pdf().set(opt).from(element).save()
  }

  const exportAsWord = async () => {
    // Usar docx
    const { Document, Paragraph, TextRun, Packer } = await import('docx')
    
    const paragraphs = filledContent.split('\n').map(line => 
      new Paragraph({
        children: [new TextRun(line || ' ')],
      })
    )
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    })
    
    const blob = await Packer.toBlob(doc)
    downloadBlob(blob, `${template.name}.docx`)
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
        <div className="flex items-center gap-2">
          <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="txt">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  TXT
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileType className="h-4 w-4" />
                  PDF
                </div>
              </SelectItem>
              <SelectItem value="docx">
                <div className="flex items-center gap-2">
                  <FileType className="h-4 w-4" />
                  Word
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={isExporting} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exportando...' : `Exportar ${exportFormat.toUpperCase()}`}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário */}
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

        {/* Visualização */}
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
