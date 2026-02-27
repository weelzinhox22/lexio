"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    Gavel,
    AlertCircle,
    BarChart3,
    Scale,
    Copy,
    Search,
    ShieldAlert,
    Info,
    Plane,
    Zap,
    CreditCard,
    Box,
    TrendingUp,
    FileText
} from "lucide-react"
import { toast } from "sonner"
import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    Cell,
    CartesianGrid
} from "recharts"

type Scenario = 'negativacao' | 'atraso_voo' | 'corte_energia' | 'vicio_produto' | 'outro'

interface ScenarioData {
    title: string
    range: [number, number]
    icon: any
    description: string
    courtData: { x: number, y: number, court: string }[]
}

const SCENARIOS: Record<Scenario, ScenarioData> = {
    negativacao: {
        title: "Negativação Indevida",
        range: [5000, 15000],
        icon: CreditCard,
        description: "Inscrição injustificada em órgãos de proteção ao crédito (SPC/SERASA).",
        courtData: [
            { x: 5000, y: 15, court: "TJSP" },
            { x: 8000, y: 45, court: "TJBA" },
            { x: 10000, y: 30, court: "TJRJ" },
            { x: 12000, y: 8, court: "TJMG" },
            { x: 15000, y: 2, court: "TJRS" }
        ]
    },
    atraso_voo: {
        title: "Atraso de Voo (+4h)",
        range: [3000, 10000],
        icon: Plane,
        description: "Falha na prestação de serviço aéreo com atraso significativo ou cancelamento.",
        courtData: [
            { x: 3000, y: 20, court: "TJSP" },
            { x: 5000, y: 40, court: "TJBA" },
            { x: 7000, y: 25, court: "TJRJ" },
            { x: 10000, y: 15, court: "STJ" }
        ]
    },
    corte_energia: {
        title: "Corte de Energia Indevido",
        range: [4000, 12000],
        icon: Zap,
        description: "Interrupção de serviço essencial sem aviso prévio ou por débito inexistente.",
        courtData: [
            { x: 4000, y: 10, court: "TJSP" },
            { x: 6000, y: 50, court: "TJBA" },
            { x: 8000, y: 30, court: "TJRJ" },
            { x: 12000, y: 10, court: "TJMG" }
        ]
    },
    vicio_produto: {
        title: "Vício de Produto (Não resolvido)",
        range: [2000, 8000],
        icon: Box,
        description: "Produto com defeito não reparado no prazo de 30 dias (Art. 18 CDC).",
        courtData: [
            { x: 2000, y: 30, court: "TJSP" },
            { x: 4000, y: 50, court: "TJBA" },
            { x: 6000, y: 15, court: "TJRJ" },
            { x: 8000, y: 5, court: "TJRS" }
        ]
    },
    outro: {
        title: "Outras Falhas de Serviço",
        range: [1000, 10000],
        icon: Gavel,
        description: "Situações genéricas de má prestação de serviço ao consumidor.",
        courtData: [
            { x: 2000, y: 40, court: "TJSP" },
            { x: 5000, y: 40, court: "TJRJ" },
            { x: 10000, y: 20, court: "STJ" }
        ]
    }
}

export function DamagesSimulator() {
    const [scenario, setScenario] = useState<Scenario>('negativacao')
    const [hasPreExistingListings, setHasPreExistingListings] = useState(false)
    const [preExistingIsSubsequent, setPreExistingIsSubsequent] = useState(false)
    const [selectedCourt, setSelectedCourt] = useState('TJBA')

    const activeScenario = SCENARIOS[scenario]

    const sumula385Analysis = useMemo(() => {
        if (scenario !== 'negativacao') return null

        if (!hasPreExistingListings) {
            return {
                type: 'success',
                title: "Dano Moral Configurado (In Re Ipsa)",
                text: "O STJ entende que a negativação indevida gera dano moral presumido quando inexistem outras anotações legítimas prévias."
            }
        }

        if (preExistingIsSubsequent) {
            return {
                type: 'warning',
                title: "Concorrência de Negativações (Posteriais)",
                text: "Como as outras negativações são POSTERIORES à discutida na lide, a Súmula 385 não se aplica totalmente. Persiste o dever de indenizar, mas o valor pode ser reduzido."
            }
        }

        return {
            type: 'danger',
            title: "Risco de Súmula 385 do STJ",
            text: "Atenção: A existência de negativação legítima ANTERIOR impede a concessão de danos morais (Súmula 385/STJ). O pedido deve focar apenas na exclusão do débito e baixa da anotação indevida."
        }
    }, [scenario, hasPreExistingListings, preExistingIsSubsequent])

    const copyThesis = () => {
        let thesis = `Desta forma, considerando o caráter punitivo-pedagógico do dano moral, e diante da falha flagrante na prestação do serviço (${activeScenario.description}), requer a condenação da Ré ao pagamento de indenização por danos morais no importe sugerido de R$ ${(activeScenario.range[0] + activeScenario.range[1]) / 2}, em consonância com os precedentes deste Egrégio Tribunal.`

        if (sumula385Analysis?.type === 'success' && scenario === 'negativacao') {
            thesis += ` Ressalte-se que o dano, in casu, é in re ipsa, prescindindo de prova de prejuízo, conforme remansosa jurisprudência do STJ.`
        }

        navigator.clipboard.writeText(thesis)
        toast.success("Tese estratégica copiada!")
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-2xl">
                    <p className="text-xs font-bold">{payload[0].payload.court}</p>
                    <p className="text-sm">Valor: R$ {payload[0].value.toLocaleString("pt-BR")}</p>
                    <p className="text-[10px] text-slate-400">Freqüência nas Sentenças: {payload[1].value}%</p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Simulador de Danos Morais</h1>
                    <p className="text-slate-500">Estimativas baseadas em precedentes e análise de Súmulas do STJ.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 px-3 py-1">
                        Base de Dados: Fev/2024
                    </Badge>
                </div>
            </div>

            <Card className="border-indigo-100 bg-indigo-50/50 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Scale className="h-20 w-20 text-indigo-900" />
                </div>
                <CardContent className="p-4 flex items-start gap-4 relative z-10">
                    <ShieldAlert className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-indigo-900 italic">Termômetro Jurisprudencial Ativo</p>
                        <p className="text-xs text-indigo-800 leading-relaxed max-w-2xl">
                            Valores sugeridos com base no princípio da razoabilidade e proporcionalidade. Esta ferramenta utiliza dados estatísticos de tribunais estaduais para sugerir o "quantum" indenizatório com maior chance de êxito.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuração do Caso */}
                <div className="space-y-6 lg:col-span-1">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Search className="h-5 w-5 text-blue-600" />
                                Configuração do Caso
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label>Cenário do Problema</Label>
                                <Select value={scenario} onValueChange={(v: any) => setScenario(v)}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="negativacao">Negativação Indevida</SelectItem>
                                        <SelectItem value="atraso_voo">Atraso de Voo (+4h)</SelectItem>
                                        <SelectItem value="corte_energia">Corte de Energia</SelectItem>
                                        <SelectItem value="vicio_produto">Vício de Produto</SelectItem>
                                        <SelectItem value="outro">Outro Falha no Serviço</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Tribunal Alvo</Label>
                                <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TJBA">TJBA (Bahia)</SelectItem>
                                        <SelectItem value="TJSP">TJSP (São Paulo)</SelectItem>
                                        <SelectItem value="TJRJ">TJRJ (Rio de Janeiro)</SelectItem>
                                        <SelectItem value="TJMG">TJMG (Minas Gerais)</SelectItem>
                                        <SelectItem value="STJ">STJ (Brasília)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {scenario === 'negativacao' && (
                                <div className="space-y-4 pt-2 border-t border-slate-100">
                                    <Label className="text-xs font-bold uppercase text-slate-500">Análise de Súmula 385</Label>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="old-list"
                                                checked={hasPreExistingListings}
                                                onCheckedChange={(checked) => setHasPreExistingListings(checked === true)}
                                            />
                                            <label htmlFor="old-list" className="text-sm">Possui outras negativações?</label>
                                        </div>
                                        {hasPreExistingListings && (
                                            <div className="flex items-center space-x-2 pl-6 animate-in fade-in slide-in-from-left-2">
                                                <Checkbox
                                                    id="subsequent"
                                                    checked={preExistingIsSubsequent}
                                                    onCheckedChange={(checked) => setPreExistingIsSubsequent(checked === true)}
                                                />
                                                <label htmlFor="subsequent" className="text-sm text-slate-600 italic">São todas posteriores a esta lide?</label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <Button className="w-full bg-slate-900 hover:bg-slate-800 gap-2" onClick={() => toast.success("Simulação atualizada")}>
                                <TrendingUp className="h-4 w-4" /> Simular Quantum
                            </Button>
                        </CardContent>
                    </Card>

                    {sumula385Analysis && (
                        <Card className={`border-0 shadow-lg ${sumula385Analysis.type === 'success' ? 'bg-green-600' :
                            sumula385Analysis.type === 'warning' ? 'bg-amber-500' : 'bg-red-600'
                            } text-white`}>
                            <CardContent className="p-5 space-y-2">
                                <h4 className="font-bold flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" /> {sumula385Analysis.title}
                                </h4>
                                <p className="text-xs leading-relaxed opacity-90">
                                    {sumula385Analysis.text}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Exibição Jurisprudencial */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between py-4">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-slate-600" />
                                    Termômetro de Jurisprudência
                                </CardTitle>
                                <CardDescription>Frequência de condenações p/ {activeScenario.title}</CardDescription>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Sugestão Média</span>
                                <div className="text-xl font-bold text-indigo-600">
                                    R$ {((activeScenario.range[0] + activeScenario.range[1]) / 2).toLocaleString("pt-BR")}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            type="number"
                                            dataKey="x"
                                            name="Valor"
                                            unit=" R$"
                                            tick={{ fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="y"
                                            name="Frequência"
                                            unit="%"
                                            tick={{ fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <ZAxis type="number" range={[100, 1000]} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Scatter name="Precedentes" data={activeScenario.courtData}>
                                            {activeScenario.courtData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.court === selectedCourt ? '#4f46e5' : '#cbd5e1'}
                                                    fillOpacity={entry.court === selectedCourt ? 1 : 0.6}
                                                />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Mínimo Comum</p>
                                    <p className="text-sm font-bold text-slate-700">R$ {activeScenario.range[0].toLocaleString("pt-BR")}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                                    <p className="text-[10px] text-indigo-400 font-bold uppercase">Indicação IA</p>
                                    <p className="text-sm font-bold text-indigo-700">R$ {((activeScenario.range[0] + activeScenario.range[1]) / 2).toLocaleString("pt-BR")}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Máximo Projetado</p>
                                    <p className="text-sm font-bold text-slate-700">R$ {activeScenario.range[1].toLocaleString("pt-BR")}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Natureza Dano</p>
                                    <p className="text-sm font-bold text-slate-700 truncate">Constitucional</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-white shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                Argumentação Estratégica
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative group">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={copyThesis}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed italic">
                                    "Desta forma, considerando o caráter punitivo-pedagógico do dano moral, e diante da falha flagrante na prestação do serviço ({activeScenario.description}), requer a condenação da Ré ao pagamento de indenização por danos morais no importe sugerido de R$ {((activeScenario.range[0] + activeScenario.range[1]) / 2).toLocaleString("pt-BR")}..."
                                </p>
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs gap-2" onClick={copyThesis}>
                                <Copy className="h-3.5 w-3.5" /> Copiar Fundamentação Completa
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900 text-white border border-slate-800">
                        <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-indigo-300">Nota de Inteligência (Dano Moral):</p>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                A fixação do dano moral no Brasil não segue uma tabela rígida. O sistema utiliza a técnica do **Bifasismo Sucessivo**: na primeira fase, fixa-se um valor básico conforme o interesse jurídico lesado; na segunda, ajusta-se o valor às circunstâncias do caso (gravidade da culpa, condição econômica das partes). Revise sempre a fundamentação antes do protocolo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
