"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  Home,
  Users,
  Landmark,
  Scale,
  Info,
  Copy,
  FileText,
  AlertCircle,
  ShieldAlert,
  TrendingUp,
  PieChart as PieChartIcon,
  ArrowRight,
  Gavel,
  CheckCircle2,
  Coins
} from "lucide-react"
import { toast } from "sonner"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts"

type Regime = 'comunhao_parcial' | 'comunhao_universal' | 'separacao_total' | 'separacao_obrigatoria'

interface CalculationResult {
  regimeName: string
  spouseTotal: number
  spouseMeação: number
  spouseHerança: number
  descendantsTotal: number
  descendantEach: number
  totalPatrimony: number
}

export function HeritageCalculator() {
  const [marriageRegime, setMarriageRegime] = useState<Regime>("comunhao_parcial")
  const [totalCommonAssets, setTotalCommonAssets] = useState("")
  const [totalPrivateAssets, setTotalPrivateAssets] = useState("")
  const [numDescendants, setNumDescendants] = useState("2")
  const [hasOnlyOneResidence, setHasOnlyOneResidence] = useState(false)
  const [activeTab, setActiveTab] = useState("simulador")

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

  const calculateForRegime = (regime: Regime, common: number, privateAssets: number, descendants: number): CalculationResult => {
    let spouseMeação = 0
    let spouseHerança = 0
    let descendantsTotal = 0
    let regimeName = ""

    switch (regime) {
      case 'comunhao_parcial':
        regimeName = "Comunhão Parcial"
        spouseMeação = common / 2
        if (descendants > 0) {
          spouseHerança = privateAssets / (descendants + 1)
          descendantsTotal = (common / 2) + (privateAssets - spouseHerança)
        } else {
          spouseHerança = privateAssets
          descendantsTotal = 0
        }
        break
      case 'comunhao_universal':
        regimeName = "Comunhão Universal"
        spouseMeação = (common + privateAssets) / 2
        spouseHerança = 0
        descendantsTotal = (common + privateAssets) / 2
        break
      case 'separacao_total':
        regimeName = "Separação Total"
        spouseMeação = 0
        if (descendants > 0) {
          spouseHerança = (common + privateAssets) / (descendants + 1)
          descendantsTotal = (common + privateAssets) - spouseHerança
        } else {
          spouseHerança = common + privateAssets
          descendantsTotal = 0
        }
        break
      case 'separacao_obrigatoria':
        regimeName = "Separação Obrigatória"
        spouseMeação = common / 2
        spouseHerança = 0
        descendantsTotal = (common / 2) + privateAssets
        break
    }

    return {
      regimeName,
      spouseTotal: spouseMeação + spouseHerança,
      spouseMeação,
      spouseHerança,
      descendantsTotal,
      descendantEach: descendants > 0 ? descendantsTotal / descendants : 0,
      totalPatrimony: common + privateAssets
    }
  }

  const results = useMemo(() => {
    const common = parseCurrency(totalCommonAssets)
    const privateAssets = parseCurrency(totalPrivateAssets)
    const descendants = parseInt(numDescendants) || 0
    return calculateForRegime(marriageRegime, common, privateAssets, descendants)
  }, [marriageRegime, totalCommonAssets, totalPrivateAssets, numDescendants])

  const comparisonData = useMemo(() => {
    const common = parseCurrency(totalCommonAssets)
    const privateAssets = parseCurrency(totalPrivateAssets)
    const descendants = parseInt(numDescendants) || 0

    const regimes: Regime[] = ['comunhao_parcial', 'comunhao_universal', 'separacao_total', 'separacao_obrigatoria']
    return regimes.map(r => {
      const res = calculateForRegime(r, common, privateAssets, descendants)
      return {
        name: res.regimeName,
        "Cônjuge": res.spouseTotal,
        "Descendentes": res.descendantsTotal
      }
    })
  }, [totalCommonAssets, totalPrivateAssets, numDescendants])

  const pieData = [
    { name: "Cônjuge", value: Math.max(0, results.spouseTotal), color: "#4f46e5" },
    { name: "Descendentes", value: Math.max(0, results.descendantsTotal), color: "#1e293b" }
  ]

  const copyLegalText = () => {
    let text = `De acordo com o Art. 1.829, I, do Código Civil, no regime de ${results.regimeName}, a sucessão ocorre da seguinte forma: \n`
    text += `- Meação do Cônjuge: R$ ${results.spouseMeação.toLocaleString("pt-BR")}\n`
    text += `- Herança do Cônjuge: R$ ${results.spouseHerança.toLocaleString("pt-BR")}\n`
    text += `- Quinhão dos Descendentes: R$ ${results.descendantsTotal.toLocaleString("pt-BR")}\n`

    if (hasOnlyOneResidence) {
      text += `\nIMPORTANTE: Aplica-se o Direito Real de Habitação (Art. 1.831 CC) sobre o único imóvel residencial, garantindo a permanência do sobrevivente.`
    }

    navigator.clipboard.writeText(text)
    toast.success("Fundamentação jurídica copiada!")
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header com Estilo Premium */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Inteligência Sucessória</h1>
          <p className="text-slate-500 font-medium">Arquitetura de herança e concorrência hereditária de ponta.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 px-4 py-1.5 rounded-xl font-bold">
            CC/2002 Atualizado
          </Badge>
          <Badge className="bg-indigo-600 text-white border-0 px-4 py-1.5 rounded-xl font-bold">
            PRO
          </Badge>
        </div>
      </div>

      <Card className="border-amber-100 bg-amber-50/70 overflow-hidden relative">
        <div className="absolute -right-4 -bottom-4 opacity-5">
          <ShieldAlert className="h-24 w-24 text-amber-900" />
        </div>
        <CardContent className="p-5 flex items-start gap-4 relative z-10">
          <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-900 italic">Cláusula de Resguardo Jurídico</p>
            <p className="text-[11px] text-amber-800 leading-relaxed max-w-4xl">
              Esta ferramenta provê cálculos baseados na regra geral do Art. 1.829, I, do CC. **Atenção**: Fatos como doações em vida (antecipação de legítima), dívidas do espólio ou disposições testamentárias podem alterar drasticamente estes valores. Os dados devem ser obrigatoriamente revisados por um advogado antes de qualquer uso oficial.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-2xl mb-6">
          <TabsTrigger value="simulador" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-8 py-3 font-bold">
            Calculadora Dinâmica
          </TabsTrigger>
          <TabsTrigger value="cenarios" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-8 py-3 font-bold">
            Dashboard de Cenários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulador" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* INPUTS */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
                <CardHeader className="bg-slate-50/50">
                  <CardTitle className="text-sm font-black uppercase tracking-tight text-slate-700 flex items-center gap-2">
                    <Coins className="h-4 w-4 text-indigo-600" /> Dados do Espólio
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Regime de Bens</Label>
                    <Select value={marriageRegime} onValueChange={(v: Regime) => setMarriageRegime(v)}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comunhao_parcial">Comunhão Parcial</SelectItem>
                        <SelectItem value="comunhao_universal">Comunhão Universal</SelectItem>
                        <SelectItem value="separacao_total">Separação Total</SelectItem>
                        <SelectItem value="separacao_obrigatoria">Separação Obrigatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Patrimônio Comum (R$)</Label>
                    <Input
                      placeholder="R$ 0,00"
                      value={totalCommonAssets}
                      onChange={e => setTotalCommonAssets(formatCurrency(e.target.value))}
                      className="font-bold text-indigo-600 focus:ring-indigo-500"
                    />
                    <p className="text-[9px] text-slate-400 italic">Bens adquiridos após o matrimônio.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Bens Particulares (R$)</Label>
                    <Input
                      placeholder="R$ 0,00"
                      value={totalPrivateAssets}
                      onChange={e => setTotalPrivateAssets(formatCurrency(e.target.value))}
                      className="font-bold text-indigo-600"
                    />
                    <p className="text-[9px] text-slate-400 italic">Bens de antes ou recebidos p/ doação/herança.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Qtd de Descendentes</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="0"
                        value={numDescendants}
                        onChange={e => setNumDescendants(e.target.value)}
                        className="font-bold w-full"
                      />
                      <Users className="h-5 w-5 text-slate-300" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center space-x-2 p-3 rounded-2xl bg-indigo-50 border border-indigo-100 group cursor-pointer" onClick={() => setHasOnlyOneResidence(!hasOnlyOneResidence)}>
                      <Checkbox
                        id="one-res"
                        checked={hasOnlyOneResidence}
                        onCheckedChange={() => { }} // Handle in div
                      />
                      <div className="grid gap-0.5 leading-none">
                        <label className="text-[11px] font-bold text-indigo-900 cursor-pointer">Único Imóvel?</label>
                        <p className="text-[9px] text-indigo-600/70">Direito Real de Habitação</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* OUTPUTS CENTRAL */}
            <div className="lg:col-span-3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-indigo-600 text-white rounded-3xl border-0 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                    <Landmark className="h-40 w-40" />
                  </div>
                  <CardContent className="p-8 space-y-4 relative z-10">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Cônjuge Sobrevivente</p>
                    <h2 className="text-5xl font-black tabular-nums">R$ {results.spouseTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h2>
                    <div className="flex gap-6 mt-6 pt-6 border-t border-white/10 text-[11px]">
                      <div className="space-y-1">
                        <span className="opacity-60 block uppercase font-bold text-[9px]">Meação</span>
                        <span className="font-bold">R$ {results.spouseMeação.toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="opacity-60 block uppercase font-bold text-[9px]">Herança</span>
                        <span className="font-bold">R$ {results.spouseHerança.toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white rounded-3xl border-0 shadow-2xl relative overflow-hidden group font-sans">
                  <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                    <Users className="h-40 w-40" />
                  </div>
                  <CardContent className="p-8 space-y-4 relative z-10">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60 text-slate-400">Massa dos Descendentes</p>
                    <h2 className="text-5xl font-black tabular-nums">R$ {results.descendantsTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h2>
                    <div className="flex justify-between mt-6 pt-6 border-t border-white/10">
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-slate-400">Cota Individual ({numDescendants} herdeiros)</span>
                        <p className="text-xl font-bold text-indigo-400">R$ {results.descendantEach.toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gráfico de Pizza */}
                <Card className="border-slate-200 border-2 rounded-3xl overflow-hidden shadow-sm bg-white">
                  <CardHeader className="py-4 border-b border-slate-50">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <PieChartIcon className="h-4 w-4 text-indigo-600" /> Proporção da Partilha
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: number) => `R$ ${val.toLocaleString("pt-BR")}`} />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Inteligência e Alertas */}
                <div className="space-y-4">
                  {hasOnlyOneResidence && (
                    <Card className="bg-indigo-900 text-white rounded-3xl border-0 overflow-hidden group">
                      <CardContent className="p-6 flex items-start gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                          <Home className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                            Direito Real de Habitação <AlertCircle className="h-3 w-3" />
                          </h4>
                          <p className="text-[11px] leading-relaxed text-slate-300">
                            Assure ao sobrevivente o direito de morar vitaliciamente no imóvel, independentemente da partilha. Protege contra expulsão ou venda forçada pelos filhos.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-slate-200 bg-slate-50/50 rounded-3xl shadow-inner h-full">
                    <CardHeader className="py-4 border-b border-slate-200/50">
                      <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                        <Gavel className="h-4 w-4" /> Fundamentação Estratégica
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 border-dashed">
                        <p className="text-[11px] text-slate-600 leading-relaxed italic">
                          "Conforme o Art. 1.829, I do CC, no regime de {results.regimeName}, a sucessão defere-se aos descendentes, em concorrência com o cônjuge sobrevivente..."
                        </p>
                      </div>
                      <Button className="w-full bg-slate-900 hover:bg-black text-xs font-bold py-6 rounded-2xl gap-2 shadow-xl shadow-slate-200" onClick={copyLegalText}>
                        <Copy className="h-4 w-4" /> Copiar Tese Jurídica
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cenarios" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-slate-200 rounded-3xl shadow-xl shadow-slate-200/40 bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-8">
              <CardTitle className="text-2xl font-black flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-indigo-400" />
                Matriz Comparativa Sucessória
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium">
                Visualize o impacto do regime de bens na partilha final.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `R$ ${val / 1000}k`} />
                    <Tooltip
                      formatter={(val: number) => `R$ ${val.toLocaleString("pt-BR")}`}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="Cônjuge" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Descendentes" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {comparisonData.map((d, i) => (
                  <div key={i} className={`p-5 rounded-2xl border-2 transition-all hover:scale-105 ${d.name === results.regimeName ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50' : 'border-slate-100 bg-slate-50/50'}`}>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{d.name}</p>
                    <p className="text-sm font-bold text-slate-900 mb-3">Share do Cônjuge:</p>
                    <p className={`text-xl font-black ${d.name === results.regimeName ? 'text-indigo-600' : 'text-slate-700'}`}>
                      R$ {d["Cônjuge"].toLocaleString("pt-BR")}
                    </p>
                    {d.name === results.regimeName && (
                      <div className="mt-3 text-[9px] font-bold text-indigo-700 bg-indigo-100 rounded-full px-3 py-1 w-fit flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Regime Atual
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-4 p-8 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Info className="h-24 w-24" />
        </div>
        <div className="space-y-4 relative z-10 w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Scale className="h-5 w-5 text-indigo-400" />
            </div>
            <h4 className="text-lg font-black tracking-tight">Análise Estratégica da Sucessão</h4>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>1. Meação vs Herança</strong>: A meação é um direito prévio do cônjuge sobre o patrimônio comum. A herança incide sobre o que sobra (a legítima e a parte disponível). Misturar os conceitos é o erro mais comum em inventários de alto valor.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>2. Concorrência Híbrida</strong>: No regime de Comunhão Parcial, o STJ pacificou que a concorrência do cônjuge com os filhos ocorre **apenas** sobre os bens particulares. Nos comuns, o cônjuge já tem a meação e não herda.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>3. Planejamento Sucessório</strong>: Visualizar outros cenários permite ao advogado sugerir doações com reserva de usufruto ou pactos antenupciais pós-nupciais para clientes que desejam blindar o sobrevivente ou os herdeiros.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
