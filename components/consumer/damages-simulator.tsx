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
    FileText,
    Stethoscope,
    PhoneOff,
    UserPlus,
    Flame
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

type Scenario =
    | 'negativacao'
    | 'atraso_voo'
    | 'corte_energia'
    | 'vicio_produto'
    | 'saque_fraude'
    | 'consignado'
    | 'telemarketing'
    | 'medico'
    | 'outro'

interface SubFactor {
    id: string
    label: string
    weight: number // Multiplicador ou acréscimo
}

interface ScenarioData {
    title: string
    range: [number, number]
    icon: any
    description: string
    subFactors: SubFactor[]
    courtData: { x: number, y: number, court: string }[]
}

const SCENARIOS: Record<Scenario, ScenarioData> = {
    negativacao: {
        title: "Negativação Indevida",
        range: [5000, 15000],
        icon: CreditCard,
        description: "Inscrição injustificada em órgãos de proteção ao crédito (SPC/SERASA).",
        subFactors: [
            { id: 'vulnerable', label: 'Cliente idoso ou vulnerável', weight: 2000 },
            { id: 'resistance', label: 'Resistência injustificada da empresa', weight: 3000 },
            { id: 'high_value', label: 'Valor da dívida inexistente é alto', weight: 1500 }
        ],
        courtData: [
            { x: 5000, y: 15, court: "TJSP" },
            { x: 8000, y: 45, court: "TJBA" },
            { x: 10000, y: 30, court: "TJRJ" },
            { x: 12000, y: 8, court: "TJMG" },
            { x: 15000, y: 2, court: "TJRS" }
        ]
    },
    atraso_voo: {
        title: "Atraso/Cancelamento de Voo",
        range: [3000, 10000],
        icon: Plane,
        description: "Falha na prestação de serviço aéreo com atraso superior a 4h ou cancelamento sem assistência.",
        subFactors: [
            { id: 'connection', label: 'Perda de conexão internacional', weight: 4000 },
            { id: 'no_assist', label: 'Falta de alimentação/hospedagem', weight: 2000 },
            { id: 'work_event', label: 'Perda de compromisso profissional/evento', weight: 3000 }
        ],
        courtData: [
            { x: 3000, y: 20, court: "TJSP" },
            { x: 5000, y: 40, court: "TJBA" },
            { x: 7000, y: 25, court: "TJRJ" },
            { x: 10000, y: 15, court: "STJ" }
        ]
    },
    corte_energia: {
        title: "Interrupção de Serviço Essencial",
        range: [4000, 12000],
        icon: Zap,
        description: "Corte de energia ou água sem aviso prévio ou por débito já pago.",
        subFactors: [
            { id: 'long_duration', label: 'Interrupção superior a 48h', weight: 3000 },
            { id: 'essential_meds', label: 'Perda de medicamentos ou alimentos', weight: 2500 },
            { id: 'health_risk', label: 'Dependente de aparelhos elétricos (saúde)', weight: 6000 }
        ],
        courtData: [
            { x: 4000, y: 10, court: "TJSP" },
            { x: 6000, y: 50, court: "TJBA" },
            { x: 8000, y: 30, court: "TJRJ" },
            { x: 12000, y: 10, court: "TJMG" }
        ]
    },
    vicio_produto: {
        title: "Vício de Produto (Essential)",
        range: [2000, 8000],
        icon: Box,
        description: "Produto com defeito (especialmente bém essencial) não reparado no prazo legal.",
        subFactors: [
            { id: 'essential_item', label: 'Item essencial (geladeira, celular único)', weight: 2000 },
            { id: 'new_item', label: 'Produto novo (menos de 30 dias de uso)', weight: 1000 },
            { id: 'over_limit', label: 'Mais de 3 tentativas de conserto', weight: 1500 }
        ],
        courtData: [
            { x: 2000, y: 30, court: "TJSP" },
            { x: 4000, y: 50, court: "TJBA" },
            { x: 6000, y: 15, court: "TJRJ" },
            { x: 8000, y: 5, court: "TJRS" }
        ]
    },
    saque_fraude: {
        title: "Fraude Bancária / Saque Indevido",
        range: [4000, 10000],
        icon: ShieldAlert,
        description: "Transferências, saques ou compras via cartão não reconhecidas.",
        subFactors: [
            { id: 'elderly', label: 'Vítima idosa (hipervulnerável)', weight: 3000 },
            { id: 'all_savings', label: 'Retirada de todo o saldo da conta', weight: 4000 },
            { id: 'bad_sac', label: 'Recusa administrativa em estornar', weight: 2000 }
        ],
        courtData: [
            { x: 4000, y: 20, court: "TJSP" },
            { x: 6000, y: 40, court: "TJBA" },
            { x: 10000, y: 20, court: "TJRJ" }
        ]
    },
    consignado: {
        title: "Empréstimo Consignado Indevido",
        range: [5000, 12000],
        icon: UserPlus,
        description: "Lançamento de empréstimo em benefício previdenciário sem contrato assinado.",
        subFactors: [
            { id: 'forged', label: 'Indício de assinatura falsificada', weight: 4000 },
            { id: 'rnc', label: 'Cartão de Crédito Consignado (RMC) disfarçado', weight: 3000 },
            { id: 'subsistence', label: 'Comprometimento da subsistência', weight: 5000 }
        ],
        courtData: [
            { x: 5000, y: 30, court: "TJMA" },
            { x: 8000, y: 50, court: "TJBA" },
            { x: 12000, y: 20, court: "TJMG" }
        ]
    },
    telemarketing: {
        title: "Telemarketing Abusivo",
        range: [1000, 5000],
        icon: PhoneOff,
        description: "Ligações incessantes mesmo após cadastro no 'Não Me Perturbe'.",
        subFactors: [
            { id: 'night_calls', label: 'Ligações em horários de descanso', weight: 1500 },
            { id: 'recorded', label: 'Possui gravação pedindo para parar', weight: 2000 },
            { id: 'harassment', label: 'Perseguição sistemática (+10 ligações/dia)', weight: 2500 }
        ],
        courtData: [
            { x: 1000, y: 40, court: "TJSP" },
            { x: 3000, y: 40, court: "TJRJ" },
            { x: 5000, y: 20, court: "TJPR" }
        ]
    },
    medico: {
        title: "Erro Médico / Estético",
        range: [15000, 50000],
        icon: Stethoscope,
        description: "Falha técnica em procedimento de saúde ou estética com danos físicos.",
        subFactors: [
            { id: 'permanent', label: 'Dano estético permanente', weight: 15000 },
            { id: 'working_incapacity', label: 'Incapacidade temporária para o trabalho', weight: 10000 },
            { id: 'emotional_trauma', label: 'Necessidade de acompanhamento psicológico', weight: 5000 }
        ],
        courtData: [
            { x: 15000, y: 20, court: "TJSP" },
            { x: 30000, y: 50, court: "TJRJ" },
            { x: 50000, y: 30, court: "STJ" }
        ]
    },
    outro: {
        title: "Outras Falhas de Serviço",
        range: [1000, 10000],
        icon: Gavel,
        description: "Situações genéricas de má prestação de serviço ao consumidor.",
        subFactors: [
            { id: 'bad_faith', label: 'Má-fé comprovada da empresa', weight: 3000 },
            { id: 'desvio_pro', label: 'Desvio Produtivo (Tempo perdido)', weight: 2000 }
        ],
        courtData: [
            { x: 2000, y: 40, court: "TJSP" },
            { x: 5000, y: 40, court: "TJRJ" },
            { x: 10000, y: 20, court: "STJ" }
        ]
    }
}

export function DamagesSimulator() {
    const [scenario, setScenario] = useState<Scenario>('negativacao')
    const [selectedSubFactors, setSelectedSubFactors] = useState<string[]>([])
    const [selectedCourt, setSelectedCourt] = useState('TJBA')

    // Súmula 385 Specifics
    const [hasPreExistingListings, setHasPreExistingListings] = useState(false)
    const [preExistingIsSubsequent, setPreExistingIsSubsequent] = useState(false)

    const activeScenario = SCENARIOS[scenario]

    const calculatedValue = useMemo(() => {
        const base = (activeScenario.range[0] + activeScenario.range[1]) / 2
        const bonus = selectedSubFactors.reduce((acc, sfId) => {
            const factor = activeScenario.subFactors.find(f => f.id === sfId)
            return acc + (factor?.weight || 0)
        }, 0)

        let final = base + bonus

        // Súmula 385 Penalty
        if (scenario === 'negativacao' && hasPreExistingListings && !preExistingIsSubsequent) {
            final = 0 // Risco total de improcedência do dano moral
        }

        return final
    }, [scenario, activeScenario, selectedSubFactors, hasPreExistingListings, preExistingIsSubsequent])

    const toggleSubFactor = (id: string) => {
        if (selectedSubFactors.includes(id)) {
            setSelectedSubFactors(selectedSubFactors.filter(f => f !== id))
        } else {
            setSelectedSubFactors([...selectedSubFactors, id])
        }
    }

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
            text: "Atenção: A existência de negativação legítima ANTERIOR impede a concessão de danos morais (Súmula 385/STJ). O pedido deve focar apenas na exclusão do débito."
        }
    }, [scenario, hasPreExistingListings, preExistingIsSubsequent])

    const copyThesis = () => {
        const factorsText = selectedSubFactors.length > 0
            ? ` agravado especialmente pelo fato de que ${selectedSubFactors.map(id => activeScenario.subFactors.find(f => f.id === id)?.label).join(', ')},`
            : ''

        let thesis = `Desta forma, considerando o caráter punitivo-pedagógico do dano moral, e diante da falha flagrante na prestação do serviço (${activeScenario.description}),${factorsText} requer a condenação da Ré ao pagamento de indenização por danos morais no importe sugerido de R$ ${calculatedValue.toLocaleString("pt-BR")}, em consonância com os precedentes deste Egrégio Tribunal.`

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
                    <p className="text-sm">Valor Base: R$ {payload[0].value.toLocaleString("pt-BR")}</p>
                    <p className="text-[10px] text-slate-400">Freqüência de Decisões: {payload[1].value}%</p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Simulador de Danos Morais PRO</h1>
                    <p className="text-slate-500">Estimativas robustas com análise multifatorial e precedentes.</p>
                </div>
                <div className="flex gap-2">
                    <Badge className="bg-blue-600 text-white border-0 px-3 py-1">
                        Versão Robustecida 2.0
                    </Badge>
                </div>
            </div>

            <Card className="border-indigo-100 bg-indigo-50/50 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Flame className="h-24 w-24 text-indigo-900" />
                </div>
                <CardContent className="p-4 flex items-start gap-4 relative z-10">
                    <ShieldAlert className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-indigo-900">Configuração Multifatorial de Dano</p>
                        <p className="text-xs text-indigo-800 leading-relaxed max-w-3xl">
                            O cálculo agora considera **agravantes específicos**. Cada checkbox marcada adiciona peso ao quantum indenizatório, refletindo o agravamento da lesão aos direitos da personalidade do consumidor.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Painel de Controle */}
                <div className="space-y-6 lg:col-span-1">
                    <Card className="border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Search className="h-5 w-5 text-indigo-600" />
                                Detalhamento do Caso
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold">Natureza da Falha</Label>
                                <Select value={scenario} onValueChange={(v: any) => {
                                    setScenario(v)
                                    setSelectedSubFactors([])
                                }}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200">
                                        <div className="flex items-center gap-2">
                                            {activeScenario.icon && <activeScenario.icon className="h-4 w-4 text-slate-400" />}
                                            <SelectValue />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="negativacao">Negativação Indevida</SelectItem>
                                        <SelectItem value="atraso_voo">Atraso/Cancelamento Voo</SelectItem>
                                        <SelectItem value="corte_energia">Corte de Energia/Água</SelectItem>
                                        <SelectItem value="vicio_produto">Vício de Produto Essencial</SelectItem>
                                        <SelectItem value="saque_fraude">Fraude Bancária / Saque</SelectItem>
                                        <SelectItem value="consignado">Consignado s/ Contratação</SelectItem>
                                        <SelectItem value="telemarketing">Telemarketing Abusivo</SelectItem>
                                        <SelectItem value="medico">Erro Médico / Estético</SelectItem>
                                        <SelectItem value="outro">Outros Cenários</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <Label className="text-xs font-bold uppercase text-indigo-600 flex items-center gap-2">
                                    <TrendingUp className="h-3.5 w-3.5" /> Fatores Agravantes (Majorantes)
                                </Label>
                                <div className="space-y-3">
                                    {activeScenario.subFactors.map(factor => (
                                        <div key={factor.id} className="flex items-start space-x-2 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleSubFactor(factor.id)}>
                                            <Checkbox
                                                id={factor.id}
                                                checked={selectedSubFactors.includes(factor.id)}
                                                onCheckedChange={() => { }} // Handle inside div for better UX
                                            />
                                            <div className="grid gap-1 leading-none">
                                                <label className="text-sm font-medium leading-none cursor-pointer">{factor.label}</label>
                                                <p className="text-[10px] text-slate-400">Aumenta o quantum médio</p>
                                            </div>
                                        </div>
                                    ))}
                                    {activeScenario.subFactors.length === 0 && (
                                        <p className="text-xs text-slate-400 italic">Selecione uma categoria para ver agravantes.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                <Label className="text-slate-600 font-bold">Jurisprudência de Referência</Label>
                                <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                                    <SelectTrigger className="bg-white border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TJBA">TJBA (Bahia)</SelectItem>
                                        <SelectItem value="TJSP">TJSP (São Paulo)</SelectItem>
                                        <SelectItem value="TJRJ">TJRJ (Rio de Janeiro)</SelectItem>
                                        <SelectItem value="TJMG">TJMG (Minas Gerais)</SelectItem>
                                        <SelectItem value="STJ">STJ (Entendimento Nacional)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {scenario === 'negativacao' && (
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <Label className="text-xs font-bold uppercase text-slate-500">Trava de Segurança: Súmula 385</Label>
                                    <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="old-list"
                                                checked={hasPreExistingListings}
                                                onCheckedChange={(checked) => setHasPreExistingListings(checked === true)}
                                            />
                                            <label htmlFor="old-list" className="text-sm font-medium">Nome já estava sujo antes?</label>
                                        </div>
                                        {hasPreExistingListings && (
                                            <div className="flex items-center space-x-2 pl-6 animate-in fade-in slide-in-from-left-2 mt-2 pt-2 border-t border-slate-200/50">
                                                <Checkbox
                                                    id="subsequent"
                                                    checked={preExistingIsSubsequent}
                                                    onCheckedChange={(checked) => setPreExistingIsSubsequent(checked === true)}
                                                />
                                                <label htmlFor="subsequent" className="text-xs text-slate-600 italic">As outras são posteriores a esta?</label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Exibição Estratégica */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-indigo-900 text-white border-0 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                            <CardContent className="p-6 space-y-3 relative z-10">
                                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Gavel className="h-4 w-4" /> Quantum Sugerido
                                </p>
                                <p className="text-5xl font-black tabular-nums">
                                    R$ {calculatedValue.toLocaleString("pt-BR")}
                                </p>
                                <div className="flex items-center gap-2 text-indigo-400 text-xs">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Baseado em {activeScenario.courtData.length} precedentes do {selectedCourt}
                                </div>
                            </CardContent>
                        </Card>

                        {sumula385Analysis && (
                            <Card className={`border-2 shadow-lg transition-colors ${sumula385Analysis.type === 'success' ? 'bg-green-50 border-green-200' :
                                    sumula385Analysis.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-300'
                                }`}>
                                <CardContent className="p-6 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${sumula385Analysis.type === 'success' ? 'bg-green-600' :
                                                sumula385Analysis.type === 'warning' ? 'bg-amber-500' : 'bg-red-600'
                                            }`}>
                                            <ShieldAlert className="h-5 w-5 text-white" />
                                        </div>
                                        <h4 className={`font-bold ${sumula385Analysis.type === 'success' ? 'text-green-900' :
                                                sumula385Analysis.type === 'warning' ? 'text-amber-900' : 'text-red-900'
                                            }`}>
                                            {sumula385Analysis.title}
                                        </h4>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate-700">
                                        {sumula385Analysis.text}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between py-4">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                                    Termômetro Jurisprudencial Ativo
                                </CardTitle>
                                <CardDescription>Decisões recentes no {selectedCourt} para este cenário</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[280px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            type="number"
                                            dataKey="x"
                                            name="Valor"
                                            unit=" R$"
                                            tick={{ fontSize: 11, fontWeight: 'bold' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="y"
                                            name="Frequência"
                                            unit="%"
                                            tick={{ fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <ZAxis type="number" range={[200, 1500]} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Scatter name="Precedentes" data={activeScenario.courtData}>
                                            {activeScenario.courtData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.court === selectedCourt ? '#4f46e5' : '#e2e8f0'}
                                                    fillOpacity={entry.court === selectedCourt ? 1 : 0.8}
                                                    stroke={entry.court === selectedCourt ? '#4338ca' : '#cbd5e1'}
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-6 flex justify-center gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-indigo-600" />
                                    <span className="text-xs font-bold text-slate-700">{selectedCourt}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-slate-200 border border-slate-300" />
                                    <span className="text-xs text-slate-500">Outros Tribunais</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-white shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-600" />
                                Argumentação Estratégica de Dano
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 group-hover:border-indigo-200 transition-colors">
                                <p className="text-sm text-slate-700 leading-relaxed italic border-l-4 border-slate-300 pl-4 py-1">
                                    "Desta forma, considerando o caráter punitivo-pedagógico do dano moral, e diante da falha flagrante na prestação do serviço ({activeScenario.description}), {selectedSubFactors.length > 0 ? `agravado especialmente pelo fato de que ${selectedSubFactors.map(id => activeScenario.subFactors.find(f => f.id === id)?.label).join(', ')}, ` : ''} requer a condenação da Ré ao pagamento de indenização por danos morais no importe sugerido de R$ {calculatedValue.toLocaleString("pt-BR")}..."
                                </p>
                            </div>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm font-bold gap-2 shadow-lg shadow-indigo-200 py-6" onClick={copyThesis}>
                                <Copy className="h-4 w-4" /> Copiar Tese para a Inicial
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Info className="h-6 w-6 text-indigo-400 shrink-0" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-indigo-300">Inteligência Judicial Multifatorial:</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Diferente de calculadoras comuns, este simulador aplica o **Critério da Bifasicidade** estabelecido pelo STJ (REsp 1.152.541). Ele combina o valor base médio do Tribunal com as peculiaridades do caso concreto (os agravantes selecionados), permitindo uma fundamentação técnica superior contra teses de 'mero aborrecimento'.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
