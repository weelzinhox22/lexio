"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
    ShoppingCart
} from "lucide-react"
import { toast } from "sonner"
import { differenceInMonths, format } from "date-fns"

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

    // Form State
    const [newItem, setNewItem] = useState({
        description: "",
        valueDisplay: "",
        date: "",
        hasComplaint: false,
        complaintType: [] as string[],
        isDouble: true
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
            hasComplaint: false,
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
        const CORRECTION_RATE = 0.006 // 0.6% ao mês (estimativa IPCA)
        const INTEREST_RATE = 0.01 // 1% ao mês (Juros de Mora)

        return items.map(item => {
            const itemDate = new Date(item.date)
            const months = Math.max(0, differenceInMonths(now, itemDate))

            const correction = item.originalValue * (CORRECTION_RATE * months)
            const totalWithCorrection = item.originalValue + correction
            const interest = totalWithCorrection * (INTEREST_RATE * months)

            const simpleTotal = totalWithCorrection + interest
            const finalValue = item.isDouble ? simpleTotal * 2 : simpleTotal

            return {
                ...item,
                months,
                correction,
                interest,
                simpleTotal,
                finalValue
            }
        })
    }, [items])

    const totalFinal = calculatedItems.reduce((acc, curr) => acc + curr.finalValue, 0)

    const thesisText = useMemo(() => {
        if (items.length === 0) return ""

        const hasSpecificComplaints = items.some(i => i.complaintType.length > 0)

        let text = `Conforme preceitua o Art. 42, parágrafo único, do Código de Defesa do Consumidor, o consumidor cobrado em quantia indevida tem direito à repetição do indébito, por valor igual ao dobro do que pagou em excesso, acrescido de correção monetária e juros legais. `

        if (hasSpecificComplaints) {
            text += `No caso em tela, a má-fé da instituição restou cristalina uma vez que, mesmo após tentativas de solução administrativa (via Consumidor.gov/Reclame Aqui/SAC), o erro persistiu de forma injustificável. Tal resistência afasta qualquer tese de 'engano justificável', atraindo a tese fixada pelo STJ no Tema 929, devendo a restituição ocorrer de forma dobrada.`
        } else {
            text += `Inexistindo qualquer engano justificável por parte da requerida, a repetição deve ocorrer de forma dobrada, conforme pacificado pela jurisprudência para débitos de natureza não-tributária.`
        }

        return text
    }, [items])

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Repetição de Indébito</h1>
                    <p className="text-slate-500">Calculador de cobrança indevida com filtro de má-fé e dobra do CDC.</p>
                </div>
            </div>

            <Card className="border-blue-100 bg-blue-50/50">
                <CardContent className="p-4 flex items-start gap-4">
                    <ShieldAlert className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-blue-900">Responsabilidade Técnica</p>
                        <p className="text-xs text-blue-800 leading-relaxed">
                            Os cálculos de juros e correção são estimativos. Valide os índices (INPC/IPCA) de acordo com a jurisdição do tribunal. **Este relatório deve ser revisado por um advogado antes de ser protocolado.**
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lançar Cobrança */}
                <Card className="border-slate-200 shadow-sm h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-600" />
                            Lançar Cobrança
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Descrição do Débito</Label>
                            <Input
                                placeholder="Ex: Tarifa Bancária Indevida"
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Valor Pago</Label>
                                <Input
                                    placeholder="R$ 0,00"
                                    value={newItem.valueDisplay}
                                    onChange={e => setNewItem({ ...newItem, valueDisplay: formatCurrency(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Data do Pagamento</Label>
                                <Input
                                    type="date"
                                    value={newItem.date}
                                    onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Label className="text-xs font-bold uppercase text-slate-500">Evidências de Má-Fé (Filtro STJ)</Label>
                            <div className="grid gap-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="reclame" checked={newItem.complaintType.includes("Reclame Aqui")} onCheckedChange={() => toggleComplaint("Reclame Aqui")} />
                                    <label htmlFor="reclame" className="text-sm">Reclamação Reclame Aqui</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="consumidor" checked={newItem.complaintType.includes("Consumidor.gov")} onCheckedChange={() => toggleComplaint("Consumidor.gov")} />
                                    <label htmlFor="consumidor" className="text-sm">Protocolo Consumidor.gov</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="sac" checked={newItem.complaintType.includes("Protocolo SAC")} onCheckedChange={() => toggleComplaint("Protocolo SAC")} />
                                    <label htmlFor="sac" className="text-sm">Protocolo SAC / Ouvidoria</label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 p-3 rounded-lg bg-orange-50 border border-orange-100 mt-2">
                            <Checkbox
                                id="is-double"
                                checked={newItem.isDouble}
                                onCheckedChange={(checked) => setNewItem({ ...newItem, isDouble: checked === true })}
                            />
                            <div className="grid gap-1 leading-none">
                                <label htmlFor="is-double" className="text-sm font-bold text-orange-900">
                                    Aplicar Dobra (Art. 42 CDC)?
                                </label>
                            </div>
                        </div>

                        <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={addItem}>
                            Adicionar ao Cálculo
                        </Button>
                    </CardContent>
                </Card>

                {/* Relatórios e Resultados */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <History className="h-5 w-5 text-slate-600" />
                                Memória de Cálculo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Descrição / Data</TableHead>
                                        <TableHead>Original</TableHead>
                                        <TableHead>Encargos</TableHead>
                                        <TableHead className="text-right text-orange-600 font-bold">Total (Dobra)</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {calculatedItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                                                Nenhuma cobrança lançada.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        calculatedItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="font-medium text-slate-900">{item.description}</div>
                                                    <div className="text-[10px] text-slate-500">{format(new Date(item.date), "dd/MM/yyyy")} ({item.months} meses)</div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    R$ {item.originalValue.toLocaleString("pt-BR")}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-[10px] space-y-0.5">
                                                        <div className="flex justify-between w-24"><span>Corr.:</span> <span>R$ {item.correction.toFixed(2)}</span></div>
                                                        <div className="flex justify-between w-24"><span>Juros:</span> <span>R$ {item.interest.toFixed(2)}</span></div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-slate-900">
                                                    R$ {item.finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => removeItem(item.id)}>
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
                        <Card className="bg-slate-900 text-white border-0 shadow-lg">
                            <CardContent className="p-6 space-y-2">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Valor Total Restituição</p>
                                <p className="text-4xl font-bold">R$ {totalFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                            </CardContent>
                        </Card>

                        {thesisText && (
                            <Card className="border-blue-200 bg-blue-50/30">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2">
                                            <FileText className="h-4 w-4" /> Fundamentação Gerada
                                        </span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" onClick={() => {
                                            navigator.clipboard.writeText(thesisText)
                                            toast.success("Tese copiada!")
                                        }}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-4">
                                        "{thesisText}"
                                    </p>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs gap-2" size="sm" onClick={() => {
                                        navigator.clipboard.writeText(thesisText)
                                        toast.success("Tese copiada!")
                                    }}>
                                        <Copy className="h-3 w-3" /> Copiar Tese Completa
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-orange-900 uppercase">Atenção ao Tema 929 do STJ:</p>
                            <p className="text-xs text-orange-800 leading-relaxed">
                                A repetição em dobro independe de prova de má-fé, basta a conduta contrária à boa-fé objetiva. Todavia, anexar os protocolos de reclamação fortifica o argumento do "erro injustificável" e garante a aplicação da dobra na maioria dos tribunais.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
