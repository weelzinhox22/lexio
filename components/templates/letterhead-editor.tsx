'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Letterhead = {
  id?: string
  name: string
  logo_url: string | null
  header_text: string | null
  footer_text: string | null
  header_color: string
  footer_color: string
  font_family: string
  is_default: boolean
}

export function LetterheadEditor({
  letterhead,
  onClose,
  userId,
}: {
  letterhead: Letterhead | null
  onClose: () => void
  userId: string
}) {
  const [formData, setFormData] = useState<Letterhead>(
    letterhead || {
      name: '',
      logo_url: null,
      header_text: null,
      footer_text: null,
      header_color: '#000000',
      footer_color: '#666666',
      font_family: 'Arial',
      is_default: false,
    }
  )
  const [isSaving, setIsSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const handleLogoUpload = async () => {
    if (!logoFile) return null

    const supabase = createClient()
    const fileExt = logoFile.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('letterheads')
      .upload(fileName, logoFile)

    if (error) {
      console.error('Erro ao fazer upload:', error)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('letterheads')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  }

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()

    try {
      let logoUrl = formData.logo_url

      if (logoFile) {
        logoUrl = await handleLogoUpload()
        if (!logoUrl) {
          alert('Erro ao fazer upload do logo. Tente novamente.')
          setIsSaving(false)
          return
        }
      }

      const dataToSave = {
        ...formData,
        logo_url: logoUrl,
        user_id: userId,
      }

      if (letterhead?.id) {
        const { error } = await supabase
          .from('letterheads')
          .update(dataToSave)
          .eq('id', letterhead.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('letterheads')
          .insert(dataToSave)

        if (error) throw error
      }

      alert('Papel timbrado salvo com sucesso!')
      onClose()
      window.location.reload()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onClose} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">
            {letterhead ? 'Editar Papel Timbrado' : 'Novo Papel Timbrado'}
          </h2>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Papel Timbrado *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Papel Timbrado Oficial"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo do Escritório</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
              {formData.logo_url && (
                <div className="mt-2 w-full h-24 bg-slate-100 rounded flex items-center justify-center">
                  <img src={formData.logo_url} alt="Logo atual" className="max-h-20 object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="header_text">Texto do Cabeçalho</Label>
              <Textarea
                id="header_text"
                value={formData.header_text || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, header_text: e.target.value }))}
                placeholder="Ex: Escritório de Advocacia Silva & Santos&#10;Rua Exemplo, 123 - Salvador/BA"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer_text">Texto do Rodapé</Label>
              <Textarea
                id="footer_text"
                value={formData.footer_text || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, footer_text: e.target.value }))}
                placeholder="Ex: OAB/BA 12345 | contato@escritorio.com | (71) 99999-9999"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="header_color">Cor do Cabeçalho</Label>
                <Input
                  id="header_color"
                  type="color"
                  value={formData.header_color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, header_color: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer_color">Cor do Rodapé</Label>
                <Input
                  id="footer_color"
                  type="color"
                  value={formData.footer_color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, footer_color: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_default: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_default" className="cursor-pointer">
                Definir como padrão
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-slate-300 rounded-lg bg-white p-6 min-h-[600px]">
              {/* Cabeçalho */}
              <div
                className="border-b-2 pb-4 mb-6 text-center"
                style={{ color: formData.header_color, borderColor: formData.header_color }}
              >
                {formData.logo_url && (
                  <img src={formData.logo_url} alt="Logo" className="h-16 mx-auto mb-2 object-contain" />
                )}
                {formData.header_text && (
                  <div
                    className="text-sm whitespace-pre-line font-semibold"
                    style={{ fontFamily: formData.font_family }}
                  >
                    {formData.header_text}
                  </div>
                )}
              </div>

              {/* Conteúdo fictício */}
              <div className="space-y-4 text-sm text-slate-700" style={{ fontFamily: formData.font_family }}>
                <p className="font-semibold">EXMO. SR. DR. JUIZ DE DIREITO...</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              </div>

              {/* Rodapé */}
              {formData.footer_text && (
                <div
                  className="border-t-2 pt-4 mt-6 text-center text-xs"
                  style={{ color: formData.footer_color, borderColor: formData.footer_color, fontFamily: formData.font_family }}
                >
                  <div className="whitespace-pre-line">{formData.footer_text}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

