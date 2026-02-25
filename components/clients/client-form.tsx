"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MaskedInput } from "@/components/ui/masked-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { unformat } from "@/lib/utils/masks"

export function ClientForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const addressLine = (formData.get("address") as string)?.trim()
      const city = (formData.get("city") as string)?.trim()
      const address =
        addressLine || city
          ? {
            line1: addressLine || null,
            city: city || null,
          }
          : null

      const { error } = await supabase.from("clients").insert({
        user_id: userId,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: unformat(formData.get("phone") as string),
        cpf_cnpj: unformat(formData.get("cpf_cnpj") as string),
        client_type: formData.get("client_type") as string,
        status: formData.get("status") as string,
        notes: formData.get("notes") as string,
        address,
      })

      if (error) {
        console.error(error)
        throw error
      }

      router.push("/dashboard/clients")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar cliente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name" className="text-slate-700 font-medium">Nome Completo / Razão Social *</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ex: João da Silva ou Empresa XYZ Ltda"
            required
            className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_type" className="text-slate-700 font-medium">Tipo de Cliente *</Label>
          <Select name="client_type" defaultValue="person">
            <SelectTrigger className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="person">👤 Pessoa Física</SelectItem>
              <SelectItem value="company">🏢 Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf_cnpj" className="text-slate-700 font-medium">CPF / CNPJ</Label>
          <MaskedInput
            id="cpf_cnpj"
            name="cpf_cnpj"
            mask="cpf-cnpj"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="cliente@email.com"
            className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-700 font-medium">Telefone</Label>
          <MaskedInput
            id="phone"
            name="phone"
            mask="phone"
            placeholder="(00) 00000-0000"
            className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-slate-700 font-medium">Endereço</Label>
          <Input
            id="address"
            name="address"
            placeholder="Rua, número, bairro"
            className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-slate-700 font-medium">Cidade / Estado</Label>
          <Input
            id="city"
            name="city"
            placeholder="Salvador - BA"
            className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-slate-700 font-medium">Status</Label>
          <Select name="status" defaultValue="active">
            <SelectTrigger className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">✅ Ativo</SelectItem>
              <SelectItem value="inactive">⏸️ Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_date" className="text-slate-700 font-medium">Data de Nascimento / Fundação</Label>
          <Input
            id="birth_date"
            name="birth_date"
            type="date"
            className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 shadow-sm"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes" className="text-slate-700 font-medium">Observações</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Informações adicionais sobre o cliente, histórico, preferências de contato, etc..."
            rows={4}
            className="border-slate-300 focus:border-blue-400 focus:ring-blue-200 shadow-sm max-h-40"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 flex items-start gap-2">
          <svg className="h-5 w-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-4 pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow hover:-translate-y-0.5 px-6 font-semibold transition-all duration-300"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Criando...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Criar Cliente
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="rounded-full shadow-sm border-slate-200 hover:bg-slate-50 font-semibold px-6"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
