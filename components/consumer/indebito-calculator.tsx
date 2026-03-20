"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Calculator,
    Plus,
    Trash2,
    ShieldAlert,
    Copy,
    FileText,
    AlertTriangle,
    CheckCircle2,
    History,
    ShoppingCart,
    TrendingUp,
    Scale,
    Info,
    ArrowRight,
    Gavel,
    Search,
    MessageSquare,
    PhoneCall,
    Globe
} from "lucide-react"
import { toast } from "sonner"
import { differenceInMonths, format } from "date-fns"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
    Legend
} from "recharts"

interface IndebitoItem {
    id: string
    description: string
    date: string
    originalValue: number
    hasComplaint: boolean
    complaintType: string[]
    isDouble: boolean
}

export function IndebitoCalculator() {
    const [items, setItems] = useState<IndebitoItem[]>([])
    const [activeTab, setActiveTab] = useState("calculadora")

    // Form State
    const [newItem, setNewItem] = useState({
        description: "",
        valueDisplay: "",
        date: "",
        complaintType: [] as string[],
        isDouble: true
    })

    const [calcConfig, setCalcConfig] = useState({
        index: "IPCA",
        interestRate: 0.01,
        interestType: "simple"
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

    const toggleComplaint = (type: string) => {
        const current = [...newItem.complaintType]
        if (current.includes(type)) {
            setNewItem({ ...newItem, complaintType: current.filter(t => t !== type) })
        } else {
            setNewItem({ ...newItem, complaintType: [...current, type] })
        }
    }

    const addItem = () => {
        const numericValue = parseCurrency(newItem.valueDisplay)
        if (!newItem.description || numericValue <= 0 || !newItem.date) {
            toast.error("Preencha todos os campos obrigatórios")
            return
        }

        const item: IndebitoItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: newItem.description,
            date: newItem.date,
            originalValue: numericValue,
            hasComplaint: newItem.complaintType.length > 0,
            complaintType: newItem.complaintType,
            isDouble: newItem.isDouble
        }

        setItems([...items, item])
        setNewItem({
            description: "",
            valueDisplay: "",
            date: "",
            complaintType: [],
            isDouble: true
        })
        toast.success("Item de cobrança adicionado")
    }

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id))
    }

    const calculatedItems = useMemo(() => {
        const now = new Date()
        const indexFactors: Record<string, number> = {
            "IPCA": 0.0055,
            "INPC": 0.005,
            "SELIC": 0.009,
            "TJSP": 0.004
        }

        const CORRECTION_RATE = indexFactors[calcConfig.index] || 0.0055
        const INTEREST_RATE = calcConfig.interestRate

        return items.map(item => {
            const itemDate = new Date(item.date)
            const months = Math.max(0, differenceInMonths(now, itemDate))
            const baseValue = item.isDouble ? item.originalValue * 2 : item.originalValue
            const correction = baseValue * (CORRECTION_RATE * months)
            const interest = (baseValue + correction) * (INTEREST_RATE * months)
            const finalValue = baseValue + correction + interest

            return {
                ...item,
                months,
                baseValue,
                correction,
                interest,
                finalValue
            }
        })
    }, [items, calcConfig])

    const totals = useMemo(() => {
        const totalOriginal = items.reduce((acc, curr) => acc + curr.originalValue, 0)
        const totalBase = calculatedItems.reduce((acc, curr) => acc + curr.baseValue, 0)
        const totalCorrection = calculatedItems.reduce((acc, curr) => acc + curr.correction, 0)
        const totalInterest = calculatedItems.reduce((acc, curr) => acc + curr.interest, 0)
        const totalFinal = calculatedItems.reduce((acc, curr) => acc + curr.finalValue, 0)

        return {
            totalOriginal,
            totalBase,
            totalCorrection,
            totalInterest,
            totalFinal,
            gainFromDouble: totalBase - totalOriginal
        }
    }, [items, calculatedItems])

    const chartData = useMemo(() => {
        return [
            { name: 'Original', valor: totals.totalOriginal, fill: '#94a3b8' },
            { name: 'Dobra', valor: totals.totalBase, fill: '#f97316' },
            { name: 'Total Final', valor: totals.totalFinal, fill: '#4f46e5' }
        ]
    }, [totals])

    const thesisText = useMemo(() => {
        if (items.length === 0) return ""
        const hasSpecificComplaints = items.some(i => i.complaintType.length > 0)

        let text = `Conforme preceitua o Art. 42, parágrafo único, do Código de Defesa do Consumidor, o consumidor cobrado em quantia indevida tem direito à repetição do indébito, por valor igual ao dobro do que pagou em excesso, acrescido de correção monetária e juros legais. `

        if (hasSpecificComplaints) {
            text += `No caso em tela, a má-fé da instituição restou cristalina uma vez que, mesmo após tentativas de solução administrativa (${items.flatMap(i => i.complaintType).filter((v, i, a) => a.indexOf(v) === i).join(', ')}), o erro persistiu de forma injustificável. Tal resistência afasta qualquer tese de 'engano justificável', atraindo a tese fixada pelo STJ no Tema 929, devendo a restituição ocorrer de forma dobrada.`
        } else {
            text += `Inexistindo qualquer engano justificável por parte da requerida, a repetição deve ocorrer de forma dobrada, conforme pacificado pela jurisprudência para débitos de natureza não-tributária.`
        }

        return text
    }, [items])

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header Premium */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                        <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Repetição de Indébito PRO</h1>
                        <p className="text-slate-500 font-medium">Análise de má-fé, dobra automática e inteligência de atualização.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 px-4 py-1.5 rounded-xl font-bold">
                        CDC Art. 42
                    </Badge>
                </div>
            </div>

            <Card className="border-indigo-100 bg-indigo-50/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <History className="h-24 w-24 text-indigo-900" />
                </div>
                <CardContent className="p-5 flex items-start gap-4 relative z-10">
                    <ShieldAlert className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-indigo-900">Configuração de Má-Fé e Dobra do Indébito</p>
                        <p className="text-xs text-indigo-800 leading-relaxed max-w-4xl">
                            O sistema aplica automaticamente o **Tema 929 do STJ**. Cada reclamação registrada (SAC, Consumidor.gov, Reclame Aqui) serve como evidência de afastamento do 'engano justificável', reforçando a tese da **restituição em dobro** para pedidos de natureza não-tributária.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-2xl mb-6">
                    <TabsTrigger value="calculadora" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-8 py-3 font-bold text-xs uppercase tracking-widest">
                        Painel de Cálculo
                    </TabsTrigger>
                    <TabsTrigger value="analise" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-8 py-3 font-bold text-xs uppercase tracking-widest">
                        Visão Analítica
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calculadora" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* INPUTS - Coluna 1 */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="border-slate-200 shadow-xl shadow-slate-200/40 bg-white">
                                <CardHeader className="bg-slate-50/50 py-4">
                                    <CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                        <Plus className="h-3.5 w-3.5" /> Nova Cobrança
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600">Descrição do Débito</Label>
                                        <Input
                                            placeholder="Ex: Tarifa de Manutenção"
                                            value={newItem.description}
                                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                            className="h-10 border-slate-200 text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600">Valor Pago Original</Label>
                                        <Input
                                            placeholder="R$ 0,00"
                                            value={newItem.valueDisplay}
                                            onChange={e => setNewItem({ ...newItem, valueDisplay: formatCurrency(e.target.value) })}
                                            className="h-10 border-slate-200 font-bold text-indigo-600 text-lg"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-600">Data do Pagamento</Label>
                                        <Input
                                            type="date"
                                            value={newItem.date}
                                            onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                                            className="h-10 border-slate-200"
                                        />
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-slate-100">
                                        <Label className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2">
                                            <Search className="h-3 w-3" /> Filtro de Má-Fé (Provas)
                                        </Label>
                                        <div className="space-y-2">
                                            {[
                                                { id: 'reclame', label: 'Reclame Aqui', icon: MessageSquare },
                                                { id: 'consumidor', label: 'Consumidor.gov', icon: Globe },
                                                { id: 'sac', label: 'Protocolo SAC', icon: PhoneCall }
                                            ].map(opt => (
                                                <div key={opt.id} className="flex items-center space-x-2 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleComplaint(opt.label)}>
                                                    <Checkbox id={opt.id} checked={newItem.complaintType.includes(opt.label)} onCheckedChange={() => { }} />
                                                    <label htmlFor={opt.id} className="text-xs font-medium cursor-pointer flex items-center gap-2">
                                                        <opt.icon className="h-3 w-3 text-slate-400" /> {opt.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 flex items-center space-x-3 cursor-pointer group" onClick={() => setNewItem({ ...newItem, isDouble: !newItem.isDouble })}>
                                        <Checkbox
                                            id="is-double-check"
                                            checked={newItem.isDouble}
                                            onCheckedChange={() => { }}
                                        />
                                        <div className="grid gap-0.5 leading-none">
                                            <label htmlFor="is-double-check" className="text-[11px] font-bold text-orange-900 cursor-pointer">
                                                Aplicar Dobra do CDC?
                                            </label>
                                            <p className="text-[9px] text-orange-600/70">Restituição 2x o valor pago</p>
                                        </div>
                                    </div>

                                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 py-6 font-bold text-sm tracking-widest mt-4" onClick={addItem}>
                                        REGISTRAR DÉBITO
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* LISTA E RESUMO - Colunas 2-4 */}
                        <div className="lg:col-span-3 space-y-6">
                            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 flex flex-row items-center justify-between">
                                    <CardTitle className="text-xs font-black uppercase tracking-tight text-slate-700 flex items-center gap-2">
                                        <Calculator className="h-4 w-4" /> Memória de Cálculo Atualizada
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Select value={calcConfig.index} onValueChange={(v: string) => setCalcConfig({ ...calcConfig, index: v })}>
                                            <SelectTrigger className="h-8 text-[10px] w-32 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="IPCA">IPCA</SelectItem>
                                                <SelectItem value="INPC">INPC</SelectItem>
                                                <SelectItem value="SELIC">SELIC</SelectItem>
                                                <SelectItem value="TJSP">TJSP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50/80">
                                            <TableRow>
                                                <TableHead className="text-[10px] uppercase font-bold text-slate-400">Origem / Data</TableHead>
                                                <TableHead className="text-[10px] uppercase font-bold text-slate-400">Valor Original</TableHead>
                                                <TableHead className="text-[10px] uppercase font-bold text-slate-400">Atualização</TableHead>
                                                <TableHead className="text-right text-[10px] uppercase font-bold text-orange-600">Total Líquido</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {calculatedItems.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-20 text-slate-300 italic text-sm">
                                                        Nenhuma cobrança registrada no inventário.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                calculatedItems.map((item) => (
                                                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <TableCell>
                                                            <div className="font-bold text-slate-900 text-sm">{item.description}</div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-slate-400">{format(new Date(item.date), "dd/MM/yyyy")}</span>
                                                                {item.hasComplaint && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[8px] h-4">Má-Fé Evidenciada</Badge>}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm font-medium text-slate-600">R$ {item.originalValue.toLocaleString("pt-BR")}</div>
                                                            {item.isDouble && <div className="text-[10px] text-orange-600 font-black">Base Dobrada: R$ {item.baseValue.toLocaleString("pt-BR")}</div>}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-[9px] space-y-0.5">
                                                                <div className="flex justify-between w-32 border-b border-slate-100 pb-0.5"><span>Correção ({calcConfig.index}):</span> <span className="font-bold">R$ {item.correction.toFixed(2)}</span></div>
                                                                <div className="flex justify-between w-32"><span>Juros ({calcConfig.interestRate * 100}%):</span> <span className="font-bold">R$ {item.interest.toFixed(2)}</span></div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="text-lg font-black text-slate-900 tabular-nums">R$ {item.finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                                                            <div className="text-[9px] text-slate-400">{item.months} meses de mora</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50" onClick={() => removeItem(item.id)}>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-slate-900 text-white border-0 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                                    <CardContent className="p-8 space-y-3 relative z-10">
                                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Total Geral da Restituição</p>
                                        <h2 className="text-5xl font-black tabular-nums">
                                            R$ {totals.totalFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </h2>
                                        <div className="flex gap-4 pt-4 mt-4 border-t border-white/5 text-[10px]">
                                            <span className="flex items-center gap-1 text-orange-400 font-bold"><TrendingUp className="h-3.5 w-3.5" /> Ganho c/ Dobra: R$ {totals.gainFromDouble.toLocaleString("pt-BR")}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {thesisText && (
                                    <Card className="border-indigo-100 bg-white shadow-xl shadow-slate-200/50 relative overflow-hidden">
                                        <div className="absolute left-0 top-0 w-1 h-full bg-indigo-600" />
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                                    <FileText className="h-4 w-4" /> Fundamentação Estratégica
                                                </span>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50" onClick={() => {
                                                    navigator.clipboard.writeText(thesisText)
                                                    toast.success("Tese estratégica copiada!")
                                                }}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-[11px] text-slate-600 leading-relaxed italic line-clamp-4 border-l-4 border-indigo-50 pl-4">
                                                "{thesisText}"
                                            </p>
                                            <Button className="w-full bg-slate-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 text-xs font-bold py-5 rounded-2xl" onClick={() => {
                                                navigator.clipboard.writeText(thesisText)
                                                toast.success("Tese estratégica copiada!")
                                            }}>
                                                <Copy className="h-3.5 w-3.5" mr-2 /> Copiar Tese para a Inicial
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="analise" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-slate-200 shadow-xl shadow-slate-200/40 bg-white p-8">
                            <CardHeader className="p-0 mb-8">
                                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                                    <div className="p-2 bg-orange-600 rounded-lg text-white">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    Impacto da Repetição Dobrada
                                </CardTitle>
                                <CardDescription className="text-slate-500 font-medium">Análise visual da valorização do crédito do consumidor.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `R$ ${val}`} />
                                        <RechartsTooltip
                                            formatter={(val: number) => `R$ ${val.toLocaleString("pt-BR")}`}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="valor" radius={[10, 10, 0, 0]} barSize={60}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-indigo-100 bg-indigo-900 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Gavel className="h-32 w-32" />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                                        <Scale className="h-4 w-4" /> Pulo do Gato (Tema 929 STJ)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            <strong>Afastamento do Engano Justificável</strong>: A existência de reclamações prévias (SAC/Consumidor.gov) prova que a empresa persistiu no erro, retirando qualquer escusa de equívoco sanável.
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            <strong>Dobra Preventiva</strong>: Peça sempre a dobra como regra. Conforme o novo entendimento, a má-fé objetiva é o que importa, não a intenção dolosa subjetiva.
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                                            <Info className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <p className="text-[10px] text-slate-400 italic">
                                            Este dashboard automatiza o cálculo que juízes levam dias para conferir, dando transparência total à sua inicial.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200 bg-slate-50/50 rounded-3xl p-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Nota de Auditoria de Cálculos</h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            Os cálculos aqui apresentados seguem o rito da **Liquidação de Sentença por Cálculos do Credor**. Em caso de impugnação, os índices de correção são fixados mensalmente pelo IBGE/BC. Revise sempre o índice adotado em sua comarca.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
