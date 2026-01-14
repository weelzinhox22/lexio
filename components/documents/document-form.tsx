"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TemplateRichEditor } from "../templates/template-rich-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Upload } from "lucide-react"

type Client = {
  id: string
  name: string
}

type Process = {
  id: string
  title: string
  process_number: string
}

export function DocumentForm({
  clients,
  processes,
  userId,
}: {
  clients: Client[]
  processes: Process[]
  userId: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!selectedFile) {
      setError("Por favor, selecione um arquivo")
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      const { error } = await supabase.from("documents").insert({
        user_id: userId,
        client_id: formData.get("client_id") ? (formData.get("client_id") as string) : null,
        process_id: formData.get("process_id") ? (formData.get("process_id") as string) : null,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        file_url: urlData.publicUrl,
        file_path: fileName,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        category: formData.get("category") as string,
      })

      if (error) throw error

      router.push("/dashboard/documents")
      router.refresh()
    } catch (err) {
      console.error("Erro ao adicionar documento:", err)
      if (err instanceof Error) {
        setError(err.message || "Erro ao adicionar documento")
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(String(err.message))
      } else {
        setError("Erro ao adicionar documento. Verifique se o bucket 'documents' existe no Supabase Storage.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Título do Documento *</Label>
          <Input id="title" name="title" placeholder="Ex: Petição Inicial" required />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="file">Arquivo *</Label>
          <div className="flex items-center gap-4">
            <Input
              id="file"
              name="file"
              type="file"
              onChange={handleFileChange}
              required
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Upload className="h-4 w-4" />
                {selectedFile.name}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select name="category">
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contrato">Contrato</SelectItem>
              <SelectItem value="peticao">Petição</SelectItem>
              <SelectItem value="certidao">Certidão</SelectItem>
              <SelectItem value="procuracao">Procuração</SelectItem>
              <SelectItem value="sentenca">Sentença</SelectItem>
              <SelectItem value="recurso">Recurso</SelectItem>
              <SelectItem value="acordao">Acórdão</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="process_id">Processo (opcional)</Label>
          <Select name="process_id">
            <SelectTrigger>
              <SelectValue placeholder="Vincular a processo" />
            </SelectTrigger>
            <SelectContent>
              {processes.map((process) => (
                <SelectItem key={process.id} value={process.id}>
                  {process.title} - {process.process_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="client_id">Cliente (opcional)</Label>
          <Select name="client_id">
            <SelectTrigger>
              <SelectValue placeholder="Vincular a cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <TemplateRichEditor
            content={""}
            onChange={() => {}}
            placeholder="Detalhes sobre o documento..."
            className="min-h-[120px]"
            readOnly={false}
          />
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white">
          {isLoading ? "Enviando..." : "Adicionar Documento"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
