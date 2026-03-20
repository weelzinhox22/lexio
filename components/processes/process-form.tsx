"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import {
  Search, Loader2, CheckCircle2, XCircle, Landmark, Building2,
  Gavel, FileText, Calendar, DollarSign, AlertCircle
} from "lucide-react"

type Client = {
  id: string
  name: string
}

type DataJudResult = {
  detectedTribunal: string | null
  found: boolean
  data?: {
    court: string
    classe: string | null
    assunto: string | null
    orgaoJulgador: string | null
    distributionDate: string | null
    lastMovementDate: string | null
    movementsCount: number
    movements: Array<{ date: string | null; name: string | null; code: number | null }>
    parties: Array<{ name: string; pole: string | null }>
  }
  error?: string
}

export function ProcessForm({ clients, userId }: { clients: Client[]; userId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // DataJud enrichment
  const [enriching, setEnriching] = useState(false)
  const [enrichResult, setEnrichResult] = useState<DataJudResult | null>(null)
  const [enrichedFields, setEnrichedFields] = useState<Record<string, string>>({})
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Formatted process number
  const [processNumber, setProcessNumber] = useState("")

  // Format as CNJ pattern: NNNNNNN-DD.AAAA.J.TR.OOOO
  const formatCNJ = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 20)
    let formatted = digits

    if (digits.length > 7) formatted = digits.slice(0, 7) + "-" + digits.slice(7)
    if (digits.length > 9) formatted = formatted.slice(0, 10) + "." + digits.slice(9)
    if (digits.length > 13) formatted = formatted.slice(0, 15) + "." + digits.slice(13)
    if (digits.length > 14) formatted = formatted.slice(0, 17) + "." + digits.slice(14)
    if (digits.length > 16) formatted = formatted.slice(0, 20) + "." + digits.slice(16)

    return formatted
  }

  // Category state
  const [processCategory, setProcessCategory] = useState<"judicial" | "inquerito">("judicial")

  const handleProcessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (processCategory === "inquerito") {
      setProcessNumber(raw)
      return
    }

    const formatted = formatCNJ(raw)
    setProcessNumber(formatted)

    // Auto-enrich when 20 digits are entered
    const digits = raw.replace(/\D/g, "")
    if (digits.length === 20) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        enrichFromDataJud(formatted)
      }, 500)
    } else {
      setEnrichResult(null)
    }
  }

  const enrichFromDataJud = useCallback(async (number: string) => {
    setEnriching(true)
    setEnrichResult(null)

    try {
      const res = await fetch(`/api/datajud/enrich?processNumber=${encodeURIComponent(number)}`)
      const data: DataJudResult = await res.json()
      setEnrichResult(data)

      // Auto-fill fields if data found
      if (data.found && data.data) {
        const d = data.data
        const fields: Record<string, string> = {}

        if (d.court) fields.court = d.court
        if (d.orgaoJulgador) fields.vara = d.orgaoJulgador
        if (d.classe) fields.process_type = d.classe
        if (d.assunto) fields.matter = d.assunto
        if (d.distributionDate) {
          fields.start_date = new Date(d.distributionDate).toISOString().split("T")[0]
        }

        setEnrichedFields(fields)
      }
    } catch (err) {
      console.error("[Enrich] error:", err)
      setEnrichResult({
        detectedTribunal: null,
        found: false,
        error: "Erro de conexão ao buscar no DataJud",
      })
    } finally {
      setEnriching(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const valorCausa = formData.get("valor_causa") as string
      const percentualHonorario = formData.get("percentual_honorario") as string

      const insertData: any = {
        user_id: userId,
        client_id: formData.get("client_id") as string,
        process_number: processNumber,
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || null,
        court: (formData.get("court") as string) || null,
        vara: (formData.get("vara") as string) || null,
        judge: (formData.get("judge") as string) || null,
        process_type: processCategory === "inquerito" ? "Inquérito Policial" : ((formData.get("process_type") as string) || null),
        matter: (formData.get("matter") as string) || null,
        priority: formData.get("priority") as string,
        polo: formData.get("polo") as string,
        start_date: (formData.get("start_date") as string) || null,
        estimated_end_date: (formData.get("estimated_end_date") as string) || null,
        status: "active",
        status_ganho: "em_andamento",
      }

      if (valorCausa) insertData.valor_causa = parseFloat(valorCausa.replace(/\./g, "").replace(",", "."))
      if (percentualHonorario) insertData.percentual_honorario = parseFloat(percentualHonorario)

      const { data: newProcess, error } = await supabase
        .from("processes")
        .insert(insertData)
        .select("id")
        .single()

      if (error) throw error

      // Se tem movimentações do DataJud, salvar como atualizações do processo
      if (processCategory === "judicial" && enrichResult?.found && enrichResult.data?.movements && newProcess) {
        const movements = enrichResult.data.movements.slice(0, 50).map((m) => ({
          user_id: userId,
          process_id: newProcess.id,
          title: m.name || "Movimentação",
          update_type: m.code ? `Código ${m.code}` : "datajud",
          update_date: m.date || new Date().toISOString(),
          description: `Importado do DataJud (${enrichResult.detectedTribunal})`,
        }))

        if (movements.length > 0) {
          await supabase.from("process_updates").insert(movements)
        }
      }

      router.push(`/dashboard/processes/${newProcess?.id || ""}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar processo")
    } finally {
      setIsLoading(false)
    }
  }

  // Resolve enriched value or empty
  const ev = (field: string) => enrichedFields[field] || ""

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Category Toggle */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit">
        <button
          type="button"
          onClick={() => {
            setProcessCategory("judicial")
            setProcessNumber("")
          }}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${processCategory === "judicial"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
            }`}
        >
          Processo Judicial
        </button>
        <button
          type="button"
          onClick={() => {
            setProcessCategory("inquerito")
            setProcessNumber("")
          }}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${processCategory === "inquerito"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
            }`}
        >
          Inquérito Policial (IP)
        </button>
      </div>

      {/* Seção 1: Número do Processo / IP + Enriquecimento DataJud */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-600" />
            {processCategory === "judicial" ? "Número do Processo" : "Número do Inquérito"}
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            {processCategory === "judicial"
              ? "Digite o número CNJ completo. O sistema detectará automaticamente o tribunal e buscará dados no DataJud."
              : "Digite o número ou identificador interno do Inquérito Policial."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="process_number">{processCategory === "judicial" ? "Número CNJ *" : "Número/ID do Inquérito *"}</Label>
              <div className="relative">
                <Input
                  id="process_number"
                  name="process_number_display"
                  value={processNumber}
                  onChange={handleProcessNumberChange}
                  placeholder={processCategory === "judicial" ? "0000000-00.0000.0.00.0000" : "S/N ou nº do IP"}
                  className={`font-mono text-base pr-10 ${processCategory === "inquerito" ? "uppercase" : ""}`}
                  required
                />
                {/* Hidden real input */}
                <input type="hidden" name="process_number" value={processNumber} />
                {processCategory === "judicial" && enriching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
                )}
              </div>
            </div>

            {processCategory === "judicial" && (
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => enrichFromDataJud(processNumber)}
                  disabled={enriching || processNumber.replace(/\D/g, "").length < 20}
                  className="w-full sm:w-auto"
                >
                  {enriching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar no DataJud
                </Button>
              </div>
            )}
          </div>

          {/* Resultado da busca */}
          {processCategory === "judicial" && enrichResult && (
            <div className={`rounded-lg p-3 border text-sm ${enrichResult.found
              ? "bg-green-50 border-green-200 text-green-800"
              : enrichResult.error
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
              }`}>
              <div className="flex items-center gap-2 mb-1">
                {enrichResult.found ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0" />
                )}
                <span className="font-semibold">
                  {enrichResult.found
                    ? `✅ Dados encontrados! Tribunal: ${enrichResult.detectedTribunal}`
                    : enrichResult.error
                      ? `Erro: ${enrichResult.error}`
                      : `Processo não encontrado no DataJud (Tribunal: ${enrichResult.detectedTribunal})`
                  }
                </span>
              </div>
              {enrichResult.found && enrichResult.data && (
                <div className="mt-2 space-y-1 text-xs">
                  <p>📋 <strong>Classe:</strong> {enrichResult.data.classe || "—"}</p>
                  <p>📜 <strong>Assunto:</strong> {enrichResult.data.assunto || "—"}</p>
                  <p>🏛️ <strong>Órgão Julgador:</strong> {enrichResult.data.orgaoJulgador || "—"}</p>
                  <p>📅 <strong>Distribuição:</strong> {enrichResult.data.distributionDate ? new Date(enrichResult.data.distributionDate).toLocaleDateString("pt-BR") : "—"}</p>
                  <p>📊 <strong>Movimentações:</strong> {enrichResult.data.movementsCount} (serão importadas automaticamente)</p>
                  {enrichResult.data.parties.length > 0 && (
                    <p>👥 <strong>Partes:</strong> {enrichResult.data.parties.map(p => `${p.name} (${p.pole || "—"})`).join(", ")}</p>
                  )}
                  <Badge className="bg-green-600 text-white mt-2 text-[11px]">
                    Campos preenchidos automaticamente ↓
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção 2: Informações Básicas */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-600" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente *</Label>
              <Select name="client_id" required>
                <SelectTrigger>
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
              <Label htmlFor="polo">{processCategory === "judicial" ? "Polo do Cliente *" : "Condição do Cliente *"}</Label>
              <Select name="polo" defaultValue={processCategory === "judicial" ? "ativo" : "investigado"} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {processCategory === "judicial" ? (
                    <>
                      <SelectItem value="ativo">Polo Ativo (Autor)</SelectItem>
                      <SelectItem value="passivo">Polo Passivo (Réu)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="investigado">Investigado / Indiciado</SelectItem>
                      <SelectItem value="vitima">Vítima / Ofendido</SelectItem>
                      <SelectItem value="testemunha">Testemunha</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">{processCategory === "judicial" ? "Título do Processo *" : "Título da Investigação *"}</Label>
              <Input
                id="title"
                name="title"
                placeholder={processCategory === "judicial" ? "Ex: Ação de Indenização por Danos Morais" : "Ex: IP Furto Qualificado - Loja Centro"}
                defaultValue={ev("classe")}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descrição / Observações</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={processCategory === "judicial" ? "Anotações sobre o processo..." : "Breve resumo dos fatos investigados..."}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Dados do Tribunal / Delegacia */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Landmark className={`h-4 w-4 ${processCategory === "judicial" ? "text-blue-600" : "text-slate-900"}`} />
            {processCategory === "judicial" ? "Dados do Tribunal" : "Dados da Delegacia / Autoridade"}
            {processCategory === "judicial" && enrichResult?.found && (
              <Badge className="bg-green-100 text-green-700 text-[10px]">Auto-preenchido</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="court">{processCategory === "judicial" ? "Tribunal *" : "Delegacia *"}</Label>
              <Input
                id="court"
                name="court"
                placeholder={processCategory === "judicial" ? "Ex: TJBA, TJSP, TRF1" : "Ex: 1ª Delegacia Territorial / DECECAP"}
                defaultValue={ev("court")}
                key={`court-${ev("court")}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vara">{processCategory === "judicial" ? "Vara / Órgão Julgador" : "Setor / Investigador"}</Label>
              <Input
                id="vara"
                name="vara"
                placeholder={processCategory === "judicial" ? "Ex: 1ª Vara Cível" : "Ex: Setor de Fraudes"}
                defaultValue={ev("vara")}
                key={`vara-${ev("vara")}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="judge">{processCategory === "judicial" ? "Juiz" : "Delegado(a) Titular"}</Label>
              <Input
                id="judge"
                name="judge"
                placeholder={processCategory === "judicial" ? "Nome do juiz responsável" : "Nome do delegado condutor"}
              />
            </div>

            {processCategory === "judicial" && (
              <div className="space-y-2">
                <Label htmlFor="process_type">Classe / Tipo</Label>
                <Input
                  id="process_type"
                  name="process_type"
                  placeholder="Ex: Ação Penal, Procedimento Ordinário"
                  defaultValue={ev("process_type")}
                  key={`type-${ev("process_type")}`}
                />
              </div>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="matter">{processCategory === "judicial" ? "Matéria / Assunto" : "Tipificação Penal Preventiva"}</Label>
              <Input
                id="matter"
                name="matter"
                placeholder={processCategory === "judicial" ? "Ex: Receptação, Dano Moral" : "Ex: Art. 155 (Furto), Art. 33 (Tráfico)"}
                defaultValue={ev("matter")}
                key={`matter-${ev("matter")}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 4: Datas + Prioridade */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" />
            Datas e Prioridade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Distribuição</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={ev("start_date")}
                key={`date-${ev("start_date")}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_end_date">Previsão de Término</Label>
              <Input
                id="estimated_end_date"
                name="estimated_end_date"
                type="date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      {/* Seção 5: Financeiro */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            Informações Financeiras
            <span className="text-xs font-normal text-slate-400">(opcional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="valor_causa">Valor da Causa (R$)</Label>
              <Input
                id="valor_causa"
                name="valor_causa"
                type="text"
                placeholder="Ex: 50000.00"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentual_honorario">Percentual de Honorários (%)</Label>
              <Input
                id="percentual_honorario"
                name="percentual_honorario"
                type="text"
                placeholder="Ex: 20"
                inputMode="decimal"
              />
              <p className="text-xs text-slate-400">O honorário será calculado automaticamente quando o processo for ganho ou alvará expedido.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erros */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Info sobre importação de movimentações */}
      {enrichResult?.found && enrichResult.data && enrichResult.data.movementsCount > 0 && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              {enrichResult.data.movementsCount} movimentações serão importadas do DataJud
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              As movimentações encontradas no DataJud serão salvas automaticamente ao criar o processo.
            </p>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-slate-900 hover:bg-slate-800 text-white order-1 sm:order-none"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Processo"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} size="lg">
          Cancelar
        </Button>
      </div>
    </form>
  )
}
