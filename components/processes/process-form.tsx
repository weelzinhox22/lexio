"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MaskedInput } from "@/components/ui/masked-input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { unformat } from "@/lib/utils/masks"
import { Percent, DollarSign, Scale } from "lucide-react"

type Client = {
  id: string
  name: string
}

export function ProcessForm({ clients, userId }: { clients: Client[]; userId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [valorCausa, setValorCausa] = useState(0)
  const [percentualHonorario, setPercentualHonorario] = useState(0)
  const [currency, setCurrency] = useState('BRL')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const polo = formData.get("polo") as string
      const statusGanho = formData.get("status_ganho") as string
      
      const insertData: any = {
        user_id: userId,
        client_id: formData.get("client_id") as string,
        process_number: unformat(formData.get("process_number") as string),
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        court: formData.get("court") as string,
        vara: formData.get("vara") as string,
        process_type: formData.get("process_type") as string,
        matter: formData.get("matter") as string,
        priority: formData.get("priority") as string,
        status: "active",
        polo: polo || "ativo",
        status_ganho: statusGanho || "em_andamento",
      }

      // Adicionar valor da causa se informado
      if (valorCausa > 0) {
        insertData.valor_causa = valorCausa
      }

      // Adicionar percentual de honorário se informado
      if (percentualHonorario > 0) {
        insertData.percentual_honorario = percentualHonorario
      }

      // Calcular honorário se causa ganha e ambos valores existirem
      if (statusGanho === "ganho" && valorCausa > 0 && percentualHonorario > 0) {
        insertData.honorario_calculado = valorCausa * (percentualHonorario / 100)
      }

      const { error } = await supabase.from("processes").insert(insertData)

      if (error) {
        // Verificar se é erro de duplicação de processo
        if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('already exists')) {
          throw new Error('⚠️ Já existe um processo cadastrado com este número. Por favor, verifique o número do processo ou utilize outro.')
        }
        throw error
      }

      // Buscar publicações automaticamente para o processo recém-criado
      if (insertData.process_number) {
        try {
          // Chamar API de busca de publicações em background (não bloquear o fluxo)
          fetch('/api/jusbrasil/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ processNumber: insertData.process_number }),
          }).catch(err => console.error('Erro ao buscar publicações:', err))
        } catch (err) {
          // Ignorar erros na busca automática
          console.error('Erro ao buscar publicações automaticamente:', err)
        }
      }

      router.push("/dashboard/processes")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar processo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Informações do Processo
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="client_id" className="text-slate-700 font-medium">Cliente *</Label>
                <Select name="client_id" required>
                  <SelectTrigger className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200">
                    <SelectValue placeholder="Selecione o cliente" />
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

              <div className="space-y-2">
                <Label htmlFor="process_number" className="text-slate-700 font-medium">Número do Processo *</Label>
                <MaskedInput 
                  id="process_number" 
                  name="process_number" 
                  mask="process" 
                  placeholder="0000000-00.0000.0.00.0000" 
                  required
                  className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="polo" className="text-slate-700 font-medium flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Polo *
                </Label>
                <Select name="polo" defaultValue="ativo" required>
                  <SelectTrigger className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">⚖️ Ativo</SelectItem>
                    <SelectItem value="passivo">⚖️ Passivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title" className="text-slate-700 font-medium">Título *</Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Ex: Ação de Indenização por Danos Morais" 
                  required
                  className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-slate-700 font-medium">Descrição</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Descreva detalhes do processo, contexto, histórico, etc..." 
                  rows={4}
                  className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="process_type" className="text-slate-700 font-medium">Tipo de Processo</Label>
                <Select name="process_type">
                  <SelectTrigger className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="civel">⚖️ Cível</SelectItem>
                    <SelectItem value="trabalhista">💼 Trabalhista</SelectItem>
                    <SelectItem value="criminal">🚨 Criminal</SelectItem>
                    <SelectItem value="tributario">💰 Tributário</SelectItem>
                    <SelectItem value="familia">👨‍👩‍👧 Família</SelectItem>
                    <SelectItem value="empresarial">🏢 Empresarial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-slate-700 font-medium">Prioridade</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Baixa</SelectItem>
                    <SelectItem value="medium">🟡 Média</SelectItem>
                    <SelectItem value="high">🟠 Alta</SelectItem>
                    <SelectItem value="urgent">🔴 Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="court" className="text-slate-700 font-medium">Tribunal/Fórum</Label>
                <Input 
                  id="court" 
                  name="court" 
                  placeholder="Ex: Tribunal de Justiça de SP"
                  className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vara" className="text-slate-700 font-medium">Vara</Label>
                <Input 
                  id="vara" 
                  name="vara" 
                  placeholder="Ex: 1ª Vara Cível"
                  className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="matter" className="text-slate-700 font-medium">Matéria/Assunto</Label>
                <Input 
                  id="matter" 
                  name="matter" 
                  placeholder="Ex: Responsabilidade Civil, Danos Morais, etc."
                  className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status_ganho" className="text-slate-700 font-medium">Status da Causa</Label>
                <Select name="status_ganho" defaultValue="em_andamento">
                  <SelectTrigger className="border-slate-300 focus:border-indigo-400 focus:ring-indigo-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_andamento">⏳ Em Andamento</SelectItem>
                    <SelectItem value="ganho">✅ Ganho</SelectItem>
                    <SelectItem value="perdido">❌ Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Informações Financeiras
            </h3>
            <div className="grid gap-6 md:grid-cols-2">

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="valor_causa" className="text-slate-700 font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor da Causa (opcional)
                </Label>
                <CurrencyInput
                  id="valor_causa"
                  value={valorCausa}
                  onChange={setValorCausa}
                  currency={currency}
                  onCurrencyChange={setCurrency}
                />
                <p className="text-xs text-slate-500">Valor total da causa judicial</p>
              </div>

              {valorCausa > 0 && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="percentual_honorario" className="text-slate-700 font-medium flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Percentual de Honorário (opcional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="percentual_honorario"
                      name="percentual_honorario"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={percentualHonorario || ''}
                      onChange={(e) => setPercentualHonorario(parseFloat(e.target.value) || 0)}
                      placeholder="20.00"
                      className="flex-1 border-slate-300 focus:border-indigo-400 focus:ring-indigo-200"
                    />
                    <span className="text-slate-600 font-medium">%</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Percentual sobre o valor da causa quando ganha
                  </p>
                  {percentualHonorario > 0 && valorCausa > 0 && (
                    <div className="mt-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <p className="text-base text-green-700 font-bold">
                        💰 Honorário calculado: {currency === 'BRL' ? 'R$' : currency}{' '}
                        {(valorCausa * (percentualHonorario / 100)).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        ⚠️ Calcule apenas se a causa for ganha (mude o status para "Ganho")
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6 h-fit">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">💡 Dicas</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900 mb-1">Preencha corretamente:</p>
              <ul className="space-y-1 list-disc list-inside text-slate-600">
                <li>Número do processo no formato correto</li>
                <li>Polo (ativo ou passivo)</li>
                <li>Tribunal e vara</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-indigo-200">
              <p className="font-semibold text-slate-900 mb-1">Honorários:</p>
              <p className="text-slate-600">Preencha valor da causa e percentual apenas se a causa for ganha. O sistema calculará automaticamente.</p>
            </div>
          </div>
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 hover:scale-105 transition-all duration-200"
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
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Criar Processo
            </>
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          className="border-slate-300 hover:bg-slate-50"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
