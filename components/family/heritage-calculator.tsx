"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Home, Users, Landmark, Scale, Info, Copy, FileText, AlertCircle, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

type Regime = 'comunhao_parcial' | 'comunhao_universal' | 'separacao_total' | 'separacao_obrigatoria'

export function HeritageCalculator() {
  const [marriageRegime, setMarriageRegime] = useState<Regime>("comunhao_parcial")
  const [totalCommonAssets, setTotalCommonAssets] = useState("")
  const [totalPrivateAssets, setTotalPrivateAssets] = useState("")
  const [numDescendants, setNumDescendants] = useState("2")
  const [hasOnlyOneResidence, setHasOnlyOneResidence] = useState(false)

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

  const results = useMemo(() => {
    const common = parseCurrency(totalCommonAssets)
    const privateAssets = parseCurrency(totalPrivateAssets)
    const descendants = parseInt(numDescendants) || 0
    
    let spouseMeação = 0
    let spouseHerança = 0
    let descendantsTotal = 0

    // Lógica Simplificada baseada no Código Civil Brasileiro
    switch (marriageRegime) {
      case 'comunhao_parcial':
        // Meeiro nos bens comuns, Herdeiro nos bens particulares
        spouseMeação = common / 2
        // Concorre com descendentes nos bens particulares
        if (descendants > 0) {
          spouseHerança = privateAssets / (descendants + 1)
          descendantsTotal = (common / 2) + (privateAssets - spouseHerança)
        } else {
          spouseHerança = privateAssets
          descendantsTotal = 0
        }
        break

      case 'comunhao_universal':
        // Meeiro em tudo, Geralmente não herda se houver descendentes (há debates, mas a regra geral é meação)
        spouseMeação = (common + privateAssets) / 2
        spouseHerança = 0
        descendantsTotal = (common + privateAssets) / 2
        break

      case 'separacao_total':
        // Não é meeiro, mas herda em concorrência com descendentes em TODO o patrimônio
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
        // Súmula 377 STF: meação apenas dos bens adquiridos onerosamente na constância (simplificado aqui como common)
        spouseMeação = common / 2
        spouseHerança = 0 // Geralmente não concorre
        descendantsTotal = (common / 2) + privateAssets
        break
    }

    return {
      spouseTotal: spouseMeação + spouseHerança,
      spouseMeação,
      spouseHerança,
      descendantsTotal,
      descendantEach: descendants > 0 ? descendantsTotal / descendants : 0,
      totalPatrimony: common + privateAssets
    }
  }, [marriageRegime, totalCommonAssets, totalPrivateAssets, numDescendants])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Cálculo de Sucessão e Herança
          </h1>
          <p className="text-slate-500">Simule a concorrência entre cônjuge e herdeiros com inteligência sucessória.</p>
        </div>
      </div>

      <Card className="border-amber-100 bg-amber-50/50">
        <CardContent className="p-4 flex items-start gap-4">
          <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-900">Aviso Legal de Responsabilidade</p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Esta é uma ferramenta de simulação pedagógica baseada em interpretações gerais do Código Civil. Os resultados não substituem o parecer jurídico de um advogado especializado. **Todos os dados e cálculos devem ser revisados e validados pelo profissional responsável precedendo qualquer ato jurídico ou orientação a clientes.**
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parâmetros do Caso */}
        <Card className="lg:col-span-1 border-slate-200 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Landmark className="h-5 w-5 text-blue-600" />
              Parâmetros do Caso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Regime de Bens</Label>
              <Select value={marriageRegime} onValueChange={(v: Regime) => setMarriageRegime(v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comunhao_parcial">Comunhão Parcial</SelectItem>
                  <SelectItem value="comunhao_universal">Comunhão Universal</SelectItem>
                  <SelectItem value="separacao_total">Separação Total (Convencional)</SelectItem>
                  <SelectItem value="separacao_obrigatoria">Separação Obrigatória</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bens Comuns (Meação) - R$</Label>
              <Input 
                placeholder="R$ 0,00" 
                value={totalCommonAssets}
                onChange={e => setTotalCommonAssets(formatCurrency(e.target.value))}
                className="font-medium"
              />
              <p className="text-[10px] text-slate-500">Adquiridos durante o casamento de forma onerosa.</p>
            </div>

            <div className="space-y-2">
              <Label>Bens Particulares - R$</Label>
              <Input 
                placeholder="R$ 0,00" 
                value={totalPrivateAssets}
                onChange={e => setTotalPrivateAssets(formatCurrency(e.target.value))}
                className="font-medium"
              />
              <p className="text-[10px] text-slate-500">Herança, doação ou bens trazidos de antes do casamento.</p>
            </div>

            <div className="space-y-2">
              <Label>Número de Descendentes (Filhos/Netos)</Label>
              <Input 
                type="number" 
                min="0"
                value={numDescendants}
                onChange={e => setNumDescendants(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <Checkbox 
                id="single-residence" 
                checked={hasOnlyOneResidence}
                onCheckedChange={(checked) => setHasOnlyOneResidence(checked === true)}
              />
              <div className="grid gap-1 leading-none">
                <label htmlFor="single-residence" className="text-sm font-medium">
                  Único imóvel residencial?
                </label>
                <p className="text-[10px] text-blue-600 italic">
                  Ativa o Alerta de Direito Real de Habitação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados e Inteligência */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-200 bg-white shadow-sm overflow-hidden border-l-4 border-l-blue-600">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Cônjuge Sobrevivente</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">R$ {results.spouseTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <Users className="h-6 w-6 text-blue-600 opacity-20" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Meação (Direito Próprio):</span>
                    <span className="font-semibold text-slate-900">R$ {results.spouseMeação.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Herança (Concorrência):</span>
                    <span className="font-semibold text-blue-600">R$ {results.spouseHerança.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden border-l-4 border-l-slate-800">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Massa dos Descendentes</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">R$ {results.descendantsTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <Scale className="h-6 w-6 text-slate-400 opacity-20" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total de Filhos:</span>
                    <span className="font-semibold text-slate-900">{numDescendants}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Cota por Filho:</span>
                    <span className="font-semibold text-slate-900">R$ {results.descendantEach.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inteligência Sucessória e Alertas */}
          <div className="space-y-4">
            {hasOnlyOneResidence && (
              <Card className="border-indigo-200 bg-indigo-50/50">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="h-10 w-10 min-w-[40px] rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md">
                    <Home className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-indigo-900 font-bold flex items-center gap-2">
                      Direito Real de Habitação Detectado!
                      <Badge className="bg-indigo-600">Art. 1.831 CC</Badge>
                    </h4>
                    <p className="text-sm text-indigo-800 leading-relaxed">
                      Mesmo que os herdeiros tornem-se proprietários da fração ideal do imóvel, ao cônjuge sobrevivente é assegurado o direito real de habitação relativamente ao imóvel destinado à residência da família, desde que seja o único daquela natureza a inventariar. **Isso impede que os filhos exijam aluguel ou a venda imediata do bem para partilha física contra a vontade do cônjuge.**
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-200 bg-slate-50/50">
              <CardHeader className="pb-3 border-b border-slate-200/60">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Alerta de Concorrência e Regime
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase">Cenário Atual:</p>
                    <div className="p-3 rounded-lg bg-white border border-slate-200">
                      <p className="text-sm font-semibold text-slate-900">
                        {marriageRegime === 'comunhao_parcial' && "O cônjuge só concorre na herança sobre os bens particulares (aqueles em que ele não tem meação)."}
                        {marriageRegime === 'separacao_total' && "Regime hibridizado pelo STJ: não há meação, mas há concorrência em todo o patrimônio com os descendentes."}
                        {marriageRegime === 'comunhao_universal' && "O cônjuge já leva metade de tudo. Conforme Art. 1.829, I, não há herança sobre a massa que já sofreu meação."}
                        {marriageRegime === 'separacao_obrigatoria' && "A meação restringe-se aos bens adquiridos onerosamente no casamento (Súmula 377 STF) e não há concorrência hereditária."}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase">Sugestão de Petição:</p>
                    <Button variant="outline" className="w-full text-blue-600 gap-2 border-blue-100 hover:bg-blue-50" size="sm" onClick={() => {
                        toast.success("Fundamentação copiada!")
                        navigator.clipboard.writeText(`Conforme o Art. 1.829 do Código Civil, no regime de ${marriageRegime.replace('_', ' ')}, a sucessão defere-se na seguinte ordem...`)
                    }}>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar Fundamentação Legal
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200 border-dashed">
                  <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                  <p>
                    A concorrência sucessória é um dos temas mais complexos do Direito de Família. Este simulador considera a regra geral do Art. 1.829, I. Lembre-se que em divórcios anteriores, pactos antenupciais ou existência de ascendentes vivos, as regras mudam drasticamente.
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
