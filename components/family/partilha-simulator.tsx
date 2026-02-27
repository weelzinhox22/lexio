"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Scale,
  Plus,
  Trash2,
  Info,
  Copy,
  FileText,
  Landmark,
  TrendingDown,
  PieChart as PieChartIcon,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Coins
} from "lucide-react"
import { toast } from "sonner"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts"

interface Asset {
  id: string
  description: string
  value: number
  isSubrogated: boolean
  subrogationDetails: string
  ownership: "common" | "spouse_a" | "spouse_b"
  type: "imovel" | "movel" | "investimento" | "empresa" | "divida"
}

export function PartilhaSimulator() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [marriageRegime, setMarriageRegime] = useState("comunhao_parcial")

  // Form State
  const [newAsset, setNewAsset] = useState({
    description: "",
    value: "",
    isSubrogated: false,
    subrogationDetails: "",
    ownership: "common" as Asset["ownership"],
    type: "imovel" as Asset["type"]
  })

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (!digits) return ""
    const cents = parseInt(digits) / 100
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents)
  }

  const parseCurrency = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (!digits) return 0
    return parseInt(digits) / 100
  }

  const addAsset = () => {
    const numericValue = parseCurrency(newAsset.value)

    if (!newAsset.description || numericValue <= 0) {
      toast.error("Preencha a descrição e um valor válido para o bem")
      return
    }

    const asset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      description: newAsset.description,
      value: numericValue,
      isSubrogated: newAsset.isSubrogated,
      subrogationDetails: newAsset.subrogationDetails,
      ownership: newAsset.isSubrogated ? "spouse_a" : newAsset.ownership,
      type: newAsset.type
    }

    setAssets([...assets, asset])
    setNewAsset({
      description: "",
      value: "",
      isSubrogated: false,
      subrogationDetails: "",
      ownership: "common",
      type: "imovel"
    })
    toast.success("Ativo registrado com sucesso")
  }

  const removeAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id))
  }

  const totals = useMemo(() => {
    let common = 0
    let privateA = 0
    let privateB = 0
    let debts = 0

    assets.forEach(asset => {
      const val = asset.type === 'divida' ? -asset.value : asset.value

      if (asset.type === 'divida') {
        // Dívidas comuns são divididas, dívidas particulares ficam com o dono
        if (asset.ownership === 'common') {
          debts += asset.value
          common -= asset.value
        } else if (asset.ownership === 'spouse_a') {
          privateA -= asset.value
        } else {
          privateB -= asset.value
        }
        return
      }

      if (asset.ownership === "common") {
        common += asset.value
      } else if (asset.ownership === "spouse_a") {
        privateA += asset.value
      } else {
        privateB += asset.value
      }
    })

    // Lógica por regime
    let shareA = 0
    let shareB = 0

    if (marriageRegime === 'comunhao_parcial') {
      shareA = (common / 2) + privateA
      shareB = (common / 2) + privateB
    } else if (marriageRegime === 'comunhao_universal') {
      const totalCommon = common + privateA + privateB
      shareA = totalCommon / 2
      shareB = totalCommon / 2
    } else { // separacao_total
      shareA = privateA
      shareB = privateB
      // Em separação total, bens marcados como 'common' seriam um erro conceitual, mas dividimos 50/50 por prudência
      shareA += common / 2
      shareB += common / 2
    }

    return {
      common,
      privateA,
      privateB,
      debts,
      totalPatrimony: common + privateA + privateB,
      shareA,
      shareB
    }
  }, [assets, marriageRegime])

  const chartData = [
    { name: "Cota Cliente", value: Math.max(0, totals.shareA), color: "#4f46e5" },
    { name: "Cota Cônjuge", value: Math.max(0, totals.shareB), color: "#1e293b" }
  ]

  const subrogatedAssets = assets.filter(a => a.isSubrogated)

  const thesisText = useMemo(() => {
    if (subrogatedAssets.length === 0) return ""

    const assetsList = subrogatedAssets.map(a => `${a.description} (${a.subrogationDetails})`).join(", ")

    return `Quanto aos bens ${assetsList}, impera o reconhecimento da incomunicabilidade. Conforme o Art. 1.659, inciso II, do Código Civil, excluem-se da comunhão os bens adquiridos com valores exclusivamente pertencentes a um dos cônjuges em sub-rogação dos bens particulares. No caso em tela, restou demonstrado que tais ativos originaram-se de recursos pré-matrimoniais ou da alienação de patrimônio particular anterior ao enlace, não integrando, portanto, a massa comum partilhável entre os ex-consortes.`
  }, [subrogatedAssets])

  const itcmdAlert = useMemo(() => {
    // Se um cônjuge está saindo com muito mais meação do que o outro (não contando bens particulares)
    // O ITCMD incide sobre o excesso de meação
    const excess = Math.abs(totals.shareA - totals.shareB)
    if (excess > 10000 && marriageRegime !== 'separacao_total') {
      return {
        title: "Alerta de Excesso de Meação",
        text: "A divisão está desigual. Atente-se que o ITCMD pode incidir sobre o valor que exceder a cota parte legal de 50% dos bens comuns."
      }
    }
    return null
  }, [totals, marriageRegime])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Estratégico */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Arquiteto de Partilha</h1>
          <p className="text-slate-500">Desenho estratégico da divisão patrimonial e defesas de incomunicabilidade.</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Regime Dominante</Label>
          <Select value={marriageRegime} onValueChange={setMarriageRegime}>
            <SelectTrigger className="w-[240px] bg-slate-50 border-slate-200 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comunhao_parcial">Comunhão Parcial de Bens</SelectItem>
              <SelectItem value="comunhao_universal">Comunhão Universal de Bens</SelectItem>
              <SelectItem value="separacao_total">Separação Total de Bens</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Painel de Inventário */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className="bg-slate-900 p-4">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" /> Registrar Patrimônio
              </CardTitle>
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Tipo de Ativo</Label>
                <Select value={newAsset.type} onValueChange={(val: any) => setNewAsset({ ...newAsset, type: val })}>
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imovel">Imóvel (Casa/Apto)</SelectItem>
                    <SelectItem value="movel">Móvel (Carro/Joias)</SelectItem>
                    <SelectItem value="investimento">Investimento/Dinheiro</SelectItem>
                    <SelectItem value="empresa">Quotas Societárias</SelectItem>
                    <SelectItem value="divida">Dívida / Passivo (–)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Descrição do Bem</Label>
                <Input
                  placeholder="Ex: Terreno em Lauro de Freitas"
                  value={newAsset.description}
                  onChange={e => setNewAsset({ ...newAsset, description: e.target.value })}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Valor Comercial</Label>
                <Input
                  placeholder="R$ 0,00"
                  value={newAsset.value}
                  onChange={e => setNewAsset({ ...newAsset, value: formatCurrency(e.target.value) })}
                  className="h-9 font-bold text-indigo-600"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-blue-50/50 border border-blue-100 mb-3">
                  <Checkbox
                    id="sub-check"
                    checked={newAsset.isSubrogated}
                    onCheckedChange={(checked) => setNewAsset({ ...newAsset, isSubrogated: checked === true })}
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label htmlFor="sub-check" className="text-[11px] font-bold text-blue-900 cursor-pointer">
                      Sub-rogação Particular?
                    </label>
                    <p className="text-[9px] text-blue-600">Recurso de antes do casamento</p>
                  </div>
                </div>

                {newAsset.isSubrogated ? (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1 mb-4">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Prova da Origem</Label>
                    <Input
                      placeholder="Ex: Valor da venda de veículo pré-nupcial"
                      value={newAsset.subrogationDetails}
                      onChange={e => setNewAsset({ ...newAsset, subrogationDetails: e.target.value })}
                      className="h-8 text-xs italic"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Titularidade</Label>
                    <Select value={newAsset.ownership} onValueChange={(val: any) => setNewAsset({ ...newAsset, ownership: val })}>
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="common">Comum (Meação)</SelectItem>
                        <SelectItem value="spouse_a">Particular do Cliente</SelectItem>
                        <SelectItem value="spouse_b">Particular do Cônjuge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100" onClick={addAsset}>
                Inserir na Partilha
              </Button>
            </CardContent>
          </Card>

          {itcmdAlert && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4 space-y-2">
                <h4 className="flex items-center gap-2 text-xs font-bold text-orange-900">
                  <AlertTriangle className="h-4 w-4" /> {itcmdAlert.title}
                </h4>
                <p className="text-[10px] text-orange-800 leading-relaxed">
                  {itcmdAlert.text}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Listagem e Gráfico */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribuição Visual */}
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-indigo-600" /> Visão Geral da Divisão
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-[220px]">
                {assets.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-300 italic text-xs">
                    Aguardando dados patrimoniais...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: number) => `R$ ${val.toLocaleString("pt-BR")}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Scale className="h-24 w-24" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Cliente (Líquido)</p>
                <h2 className="text-4xl font-black mt-1">R$ {totals.shareA.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h2>
                <div className="mt-4 flex gap-4 text-[10px]">
                  <span className="flex items-center gap-1"><Coins className="h-3 w-3" /> Particular: R$ {totals.privateA.toLocaleString("pt-BR")}</span>
                  <span className="flex items-center gap-1 opacity-70">Meação: R$ {(totals.common / 2).toLocaleString("pt-BR")}</span>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Scale className="h-24 w-24" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Cônjuge (Líquido)</p>
                <h2 className="text-4xl font-black mt-1">R$ {totals.shareB.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h2>
                <div className="mt-4 flex gap-4 text-[10px]">
                  <span className="flex items-center gap-1 opacity-60">Massa Crítica: R$ {totals.totalPatrimony.toLocaleString("pt-BR")}</span>
                  <span className="flex items-center gap-1 text-red-400">Dívidas: R$ {totals.debts.toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-slate-700">
                <Landmark className="h-4 w-4" /> Detalhamento do Inventário Partilhável
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {assets.length} Itens Mapeados
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-[10px] uppercase">Identificação / Tipo</TableHead>
                    <TableHead className="text-[10px] uppercase">Natureza Jurídica</TableHead>
                    <TableHead className="text-right text-[10px] uppercase">Valor Mercado</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-16 text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 opacity-20" />
                          <p className="text-xs italic">Nenhum ativo ou passivo listado no inventário estratégico.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.map((asset) => (
                      <TableRow key={asset.id} className="hover:bg-slate-50 transition-colors group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${asset.type === 'divida' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                              {asset.type === 'imovel' && <Landmark className="h-4 w-4" />}
                              {asset.type === 'movel' && <Plus className="h-4 w-4" />}
                              {asset.type === 'investimento' && <Coins className="h-4 w-4" />}
                              {asset.type === 'empresa' && <Scale className="h-4 w-4" />}
                              {asset.type === 'divida' && <TrendingDown className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{asset.description}</div>
                              <div className="text-[10px] text-slate-400 capitalize">{asset.type}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {asset.isSubrogated ? (
                              <Badge className="bg-blue-600 text-white border-0 text-[9px] w-fit">Sub-rogado (Particular)</Badge>
                            ) : asset.ownership === 'common' ? (
                              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-[9px] w-fit">Comunicável (Meação)</Badge>
                            ) : (
                              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-[9px] w-fit">Particular</Badge>
                            )}
                            {asset.isSubrogated && <span className="text-[9px] text-slate-400 italic">Origem: {asset.subrogationDetails}</span>}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-bold ${asset.type === 'divida' ? 'text-red-600' : 'text-slate-900'}`}>
                          {asset.type === 'divida' ? '-' : ''} R$ {asset.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50" onClick={() => removeAsset(asset.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tese de Incomunicabilidade */}
            {thesisText && (
              <Card className="border-blue-200 bg-white shadow-xl shadow-blue-50 overflow-hidden group">
                <div className="bg-indigo-600 p-4 flex items-center justify-between">
                  <CardTitle className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Tese de Incomunicabilidade (Art. 1.659, II)
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-white/50 hover:text-white" onClick={() => {
                    navigator.clipboard.writeText(thesisText)
                    toast.success("Tese copiada!")
                  }}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <CardContent className="p-6 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed italic border-l-4 border-indigo-100 pl-4 py-1 line-clamp-6">
                    "{thesisText}"
                  </p>
                  <Button className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 text-xs font-bold py-5" onClick={() => {
                    navigator.clipboard.writeText(thesisText)
                    toast.success("Tese copiada com sucesso!")
                  }}>
                    <Copy className="h-3.5 w-3.5" mr-2 /> Copiar para a Inicial/Contestação
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Dicas Estratégicas */}
            <Card className="border-slate-800 bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-400">
                  <Info className="h-4 w-4" /> Notas Estratégicas IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Meação vs. Herança</strong>: No falecimento, a meação não é herança. O cônjuge retira seus 50% dos bens comuns e concorre como herdeiro apenas nos bens particulares (conforme regime).
                  </p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Provas de Sub-rogação</strong>: A tese gerada exige o nexo causal. Recomende ao cliente buscar a escritura onde consta que o dinheiro veio de 'bem particular'.
                  </p>
                </div>
                <div className="border-t border-slate-800 pt-4 flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Landmark className="h-5 w-5 text-indigo-400" />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Cálculos baseados no Código Civil de 2002. Atende-se para a Súmula 377 do STF caso o regime seja Separação Obrigatória.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
