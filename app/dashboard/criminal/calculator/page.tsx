'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Scale, Calendar as CalendarIcon, Clock, AlertTriangle, Play, RefreshCcw, HandMetal, FileSpreadsheet, Save, Loader2, History, Trash2, Check, UserIcon } from 'lucide-react'
import { addYears, addMonths, addDays, subDays, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'

interface CalculationHistory {
    id: string
    title: string
    created_at: string
    years: number
    months: number
    days: number
    progression_date: string
    livramento_date: string
    end_date: string
    is_visible_to_client: boolean
    clients: { name: string } | null
}

export default function PenalCalculatorPage() {
    const supabase = createClient()

    // UI states
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [history, setHistory] = useState<CalculationHistory[]>([])
    const [clients, setClients] = useState<{ id: string, name: string }[]>([])

    // Save Form Inputs
    const [saveTitle, setSaveTitle] = useState('')
    const [selectedClient, setSelectedClient] = useState('none')
    const [visibleToClient, setVisibleToClient] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Calculator Inputs
    const [years, setYears] = useState<number>(0)
    const [months, setMonths] = useState<number>(0)
    const [days, setDays] = useState<number>(0)
    const [startDate, setStartDate] = useState<string>('')
    const [remissionDays, setRemissionDays] = useState<number>(0)

    // Fractions
    const [progressionFraction, setProgressionFraction] = useState<string>('0.16')
    const [livramentoFraction, setLivramentoFraction] = useState<string>('0.333333333')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Load History
        const { data: historyData } = await supabase
            .from('penal_calculations')
            .select('*, clients(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (historyData) setHistory(historyData as any)

        // Load Clients for dropdown
        const { data: clientsData } = await supabase
            .from('clients')
            .select('id, name')
            .eq('user_id', user.id)
            .order('name')

        if (clientsData) setClients(clientsData)
        setIsLoading(false)
    }

    const handleCalculate = () => {
        if (!startDate) return null

        const totalDurationDays = (years * 365) + (months * 30) + days
        const start = parseISO(startDate)

        const fractionProg = parseFloat(progressionFraction)
        let daysToProgression = Math.ceil(totalDurationDays * fractionProg)
        daysToProgression -= remissionDays

        const fractionLiv = parseFloat(livramentoFraction)
        let daysToLivramento = Math.ceil(totalDurationDays * fractionLiv)
        daysToLivramento -= remissionDays

        let progDate = addDays(start, daysToProgression > 0 ? daysToProgression : 0)
        let livDate = addDays(start, daysToLivramento > 0 ? daysToLivramento : 0)

        let endOfPenaltyDays = totalDurationDays - remissionDays
        let expectedEnd = addDays(start, endOfPenaltyDays > 0 ? endOfPenaltyDays : 0)

        return {
            progDateRaw: format(progDate, "yyyy-MM-dd"),
            livDateRaw: format(livDate, "yyyy-MM-dd"),
            expectedEndRaw: format(expectedEnd, "yyyy-MM-dd"),
            progDate: format(progDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
            livDate: format(livDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
            expectedEnd: format(expectedEnd, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
            totalDurationDays,
            daysToServeProg: daysToProgression > 0 ? daysToProgression : 0
        }
    }

    const handleSave = async () => {
        if (!saveTitle.trim()) {
            toast.error("Dê um título para este cálculo")
            return
        }

        const results = handleCalculate()
        if (!results) return

        setIsSaving(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setIsSaving(false)
            return
        }

        const insertData = {
            user_id: user.id,
            client_id: selectedClient === 'none' ? null : selectedClient,
            title: saveTitle,
            years,
            months,
            days,
            start_date: startDate,
            remission_days: remissionDays,
            progression_fraction: parseFloat(progressionFraction),
            livramento_fraction: parseFloat(livramentoFraction),
            progression_date: results.progDateRaw,
            livramento_date: results.livDateRaw,
            end_date: results.expectedEndRaw,
            is_visible_to_client: visibleToClient
        }

        const { error } = await supabase.from('penal_calculations').insert(insertData)

        if (error) {
            console.error(error)
            toast.error("Erro ao salvar o cálculo no banco de dados.")
        } else {
            toast.success("Cálculo salvo com sucesso!")
            setIsDialogOpen(false)
            setSaveTitle('')
            loadData()
        }
        setIsSaving(false)
    }

    const loadHistoryItem = (item: any) => {
        setYears(item.years || 0)
        setMonths(item.months || 0)
        setDays(item.days || 0)
        setStartDate(item.start_date)
        setRemissionDays(item.remission_days || 0)
        setProgressionFraction(item.progression_fraction.toString())
        setLivramentoFraction(item.livramento_fraction.toString())
        window.scrollTo({ top: 0, behavior: 'smooth' })
        toast.success(`Cálculo "${item.title}" carregado.`)
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Tem certeza que deseja excluir o histórico "${title}"?`)) return

        const { error } = await supabase.from('penal_calculations').delete().eq('id', id)
        if (error) {
            toast.error("Erro ao excluir histórico")
        } else {
            setHistory(history.filter(h => h.id !== id))
            toast.success("Histórico excluído")
        }
    }

    const results = handleCalculate()

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
            {/* Header Redesenhado Pro */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 pointer-events-none transition-transform duration-700 hover:scale-110" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-slate-900 p-2 rounded-lg shadow-sm">
                            <Scale className="h-5 w-5 text-white" />
                        </div>
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 font-medium">
                            Sistema de Execução Penal Diário
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                        Calculadora Inteligente de Execução
                    </h1>
                    <p className="text-slate-500 text-base max-w-2xl">
                        Simule precisões matemáticas da lei anticrime, programe datas exatas, salve históricos por cliente e disponibilize as linhas do tempo no portal do seu constituinte.
                    </p>
                </div>

                <div className="relative z-10 shrink-0">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!results} className="bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all h-12 px-6 rounded-full font-semibold">
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Este Estudo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                    <Save className="h-5 w-5 text-indigo-500" /> Salvar Cálculo Permanente
                                </DialogTitle>
                                <DialogDescription>
                                    Guarde as datas exatas geradas por esta simulação vinculando-as, se desejar, a um cliente.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Título (Ex: Recurso Tício Agosto/26)</Label>
                                    <Input value={saveTitle} onChange={e => setSaveTitle(e.target.value)} placeholder="Dê um nome ao estudo..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Vincular a um Cliente (Opcional)</Label>
                                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">-- Estudo Avulso --</SelectItem>
                                            {clients.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedClient !== 'none' && (
                                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                                        <div className="space-y-0.5">
                                            <Label className="font-semibold text-slate-700">Visível no Portal do Cliente?</Label>
                                            <p className="text-xs text-slate-500">Mostrar essas datas na tela de acesso dele.</p>
                                        </div>
                                        <Switch checked={visibleToClient} onCheckedChange={setVisibleToClient} />
                                    </div>
                                )}
                            </div>
                            <Button onClick={handleSave} disabled={isSaving} className="w-full h-11 bg-slate-900 hover:bg-slate-800 rounded-full font-semibold">
                                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                Confirmar e Salvar no Banco
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Entradas */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-4">
                                <CardTitle className="text-slate-800 flex items-center gap-2 text-base font-bold">
                                    <Clock className="h-5 w-5 text-indigo-500" />
                                    1. Condenação Total
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Anos</Label>
                                        <Input
                                            type="number" min="0" value={years || ''}
                                            onChange={e => setYears(parseInt(e.target.value) || 0)}
                                            className="h-14 text-center text-xl font-bold bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meses</Label>
                                        <Input
                                            type="number" min="0" max="11" value={months || ''}
                                            onChange={e => setMonths(parseInt(e.target.value) || 0)}
                                            className="h-14 text-center text-xl font-bold bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dias</Label>
                                        <Input
                                            type="number" min="0" max="29" value={days || ''}
                                            onChange={e => setDays(parseInt(e.target.value) || 0)}
                                            className="h-14 text-center text-xl font-bold bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-4">
                                <CardTitle className="text-slate-800 flex items-center gap-2 text-base font-bold">
                                    <CalendarIcon className="h-5 w-5 text-emerald-500" />
                                    2. Variáveis de Início
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Base (Prisão/Falta)</Label>
                                    <Input
                                        type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                        className="h-11 bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                                        <span>Dias Remidos</span>
                                        <span className="text-amber-600">Trab/Estudo</span>
                                    </Label>
                                    <Input
                                        type="number" min="0" value={remissionDays || ''}
                                        placeholder="Qtd. Abatida"
                                        onChange={e => setRemissionDays(parseInt(e.target.value) || 0)}
                                        className="h-11 bg-slate-50"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-4">
                            <CardTitle className="text-slate-800 flex items-center gap-2 text-base font-bold">
                                <HandMetal className="h-5 w-5 text-rose-500" />
                                3. Aplicação do Pacote Anticrime (Art. 112 LEP / Art. 83 CP)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Regra de Progressão</Label>
                                <Select value={progressionFraction} onValueChange={setProgressionFraction}>
                                    <SelectTrigger className="h-12 bg-slate-50">
                                        <SelectValue placeholder="Selecione a regra..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0.166666666">1/6 - Antigo (Crimes &lt; 2020)</SelectItem>
                                        <SelectItem value="0.16">16% - Primário s/ Violência</SelectItem>
                                        <SelectItem value="0.20">20% - Reincidente s/ Violência</SelectItem>
                                        <SelectItem value="0.25">25% - Primário c/ Violência</SelectItem>
                                        <SelectItem value="0.30">30% - Reincidente c/ Violência</SelectItem>
                                        <SelectItem value="0.40">40% - Hediondo, Primário</SelectItem>
                                        <SelectItem value="0.50">50% - Hediondo/Morte, Primário</SelectItem>
                                        <SelectItem value="0.60">60% - Hediondo, Reinc. Específico</SelectItem>
                                        <SelectItem value="0.70">70% - Hediondo/Morte, Reinc. Esp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">Regra de Livramento</Label>
                                <Select value={livramentoFraction} onValueChange={setLivramentoFraction}>
                                    <SelectTrigger className="h-12 bg-slate-50">
                                        <SelectValue placeholder="Selecione a regra..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0.333333333">1/3 - Primário Bons Antecedentes</SelectItem>
                                        <SelectItem value="0.5">1/2 - Reincidente Doloso</SelectItem>
                                        <SelectItem value="0.666666666">2/3 - Crimes Hediondos (Se primário)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dashboard de Resultados Subjacente */}
                    {startDate && results && (
                        <div className="space-y-4 pt-4 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 mb-2">
                                <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
                                <h3 className="text-xl font-bold text-slate-800">Cálculo Homologado</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-xl p-5 border-l-4 border-l-indigo-500 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Passo 1</p>
                                    <h4 className="text-slate-800 font-bold mb-3">Progressão de Regime</h4>
                                    <div className="text-2xl font-black text-indigo-600">{results.progDate}</div>
                                    <div className="mt-3 bg-slate-100 h-1.5 w-full rounded-full">
                                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${parseFloat(progressionFraction) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-5 border-l-4 border-l-purple-500 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Passo 2</p>
                                    <h4 className="text-slate-800 font-bold mb-3">Livramento Condicional</h4>
                                    <div className="text-2xl font-black text-purple-600">{results.livDate}</div>
                                    <div className="mt-3 bg-slate-100 h-1.5 w-full rounded-full">
                                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${parseFloat(livramentoFraction) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-5 border-l-4 border-l-rose-500 shadow-sm bg-gradient-to-br from-white to-rose-50/30">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Fim</p>
                                    <h4 className="text-slate-800 font-bold mb-3">Término de Pena</h4>
                                    <div className="text-2xl font-black text-rose-600">{results.expectedEnd}</div>
                                    <div className="mt-3 bg-slate-100 h-1.5 w-full rounded-full">
                                        <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `100%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Histórico Lateral */}
                <div className="lg:col-span-4">
                    <Card className="rounded-2xl border-slate-200/60 shadow-sm bg-slate-50/30 h-full">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-slate-800 flex items-center gap-2 text-base font-bold">
                                <History className="h-5 w-5 text-slate-500" />
                                Meus Cálculos Salvos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-400 h-8 w-8" /></div>
                            ) : history.length === 0 ? (
                                <div className="text-center p-6 bg-white rounded-xl border border-dashed border-slate-200">
                                    <History className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">Nenhum cálculo salvo na nuvem ainda. Realize um cálculo e clique em salvar.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map(item => (
                                        <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm hover:shadow hover:border-slate-300 transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-800 text-sm line-clamp-1 flex-1 pr-2">{item.title}</h4>
                                                <button onClick={() => handleDelete(item.id, item.title)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            <div className="flex flex-col gap-1 mb-3">
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> Condenação: {item.years}a {item.months}m {item.days}d
                                                </span>
                                                {item.clients && (
                                                    <span className="text-xs text-indigo-600 flex items-center gap-1 font-medium bg-indigo-50 px-1.5 py-0.5 rounded-md w-fit">
                                                        <UserIcon className="h-3 w-3" /> Cliente: {item.clients.name}
                                                    </span>
                                                )}
                                                {item.is_visible_to_client && (
                                                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1 border border-emerald-200 w-fit px-1.5 rounded">Visível no Portal</span>
                                                )}
                                            </div>

                                            <Button onClick={() => loadHistoryItem(item)} variant="outline" size="sm" className="w-full text-xs h-8 border-slate-200 hover:bg-slate-50">
                                                <Play className="h-3 w-3 mr-1.5 text-indigo-500" />
                                                Recarregar na Tela
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
