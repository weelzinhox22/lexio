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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RecidivismCalculator } from '@/components/criminal/recidivism-calculator'

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
    const [progressionFraction, setProgressionFraction] = useState<string>('1/6')
    const [livramentoFraction, setLivramentoFraction] = useState<string>('1/3')

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

    const parseFractionInput = (val: string) => {
        const s = val.trim()
        if (!s || s.toLowerCase() === 'none' || s === '0') return 0

        if (s.includes('/')) {
            const parts = s.split('/')
            if (parts.length === 2 && parseFloat(parts[1]) !== 0) {
                return (parseFloat(parts[0]) || 0) / (parseFloat(parts[1]) || 1)
            }
        }

        const num = parseFloat(s.replace('%', '').replace(',', '.'))
        if (!isNaN(num)) {
            if (s.includes('%') || num > 1) return num / 100
            return num
        }
        return 0
    }

    const handleCalculate = () => {
        if (!startDate) return null

        const totalDurationDays = (years * 365) + (months * 30) + days
        const start = parseISO(startDate)

        const fractionProg = parseFractionInput(progressionFraction)
        let daysToProgression = Math.ceil(totalDurationDays * fractionProg)
        daysToProgression -= remissionDays

        const fractionLiv = parseFractionInput(livramentoFraction)
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
            daysToServeProg: daysToProgression > 0 ? daysToProgression : 0,
            fractionProg,
            fractionLiv
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
            progression_fraction: results.fractionProg,
            livramento_fraction: results.fractionLiv,
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

    const formatFractionToText = (val: number | null | undefined) => {
        if (!val) return '0'
        const eps = 0.0001
        if (Math.abs(val - 1 / 6) < eps) return '1/6'
        if (Math.abs(val - 1 / 3) < eps) return '1/3'
        if (Math.abs(val - 1 / 2) < eps) return '1/2'
        if (Math.abs(val - 2 / 3) < eps) return '2/3'
        if (Math.abs(val - 2 / 5) < eps) return '2/5'
        if (Math.abs(val - 3 / 5) < eps) return '3/5'
        return `${(val * 100).toFixed(1).replace('.0', '')}%`
    }

    const loadHistoryItem = (item: any) => {
        setYears(item.years || 0)
        setMonths(item.months || 0)
        setDays(item.days || 0)
        setStartDate(item.start_date)
        setRemissionDays(item.remission_days || 0)

        setProgressionFraction(formatFractionToText(item.progression_fraction))
        setLivramentoFraction(formatFractionToText(item.livramento_fraction))

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

    const formatProgressFraction = (val: number) => {
        const eps = 0.0001
        if (Math.abs(val - 1 / 6) < eps) return '1/6'
        if (Math.abs(val - 1 / 3) < eps) return '1/3'
        if (Math.abs(val - 1 / 2) < eps) return '1/2'
        if (Math.abs(val - 2 / 3) < eps) return '2/3'
        if (Math.abs(val - 2 / 5) < eps) return '2/5'
        if (Math.abs(val - 3 / 5) < eps) return '3/5'
        return `${(val * 100).toFixed(1).replace('.0', '')}%`
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
            <Tabs defaultValue="execucao" className="space-y-6">
                <div className="flex justify-center">
                    <TabsList className="bg-slate-100 p-1 rounded-full border border-slate-200">
                        <TabsTrigger value="execucao" className="rounded-full px-8 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                            <Scale className="h-4 w-4 mr-2" />
                            Cálculo de Execução
                        </TabsTrigger>
                        <TabsTrigger value="antecedentes" className="rounded-full px-8 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                            <History className="h-4 w-4 mr-2" />
                            Análise de Antecedentes
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="execucao" className="space-y-6">
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
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-700 flex justify-between">
                                                <span>Fração de Progressão</span>
                                            </Label>
                                            <Input
                                                type="text"
                                                value={progressionFraction}
                                                onChange={e => setProgressionFraction(e.target.value)}
                                                className="h-12 bg-slate-50 font-bold"
                                                placeholder="Ex: 1/6 ou 16%"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-700 flex justify-between">
                                                <span>Fração de Livramento</span>
                                            </Label>
                                            <Input
                                                type="text"
                                                value={livramentoFraction}
                                                onChange={e => setLivramentoFraction(e.target.value)}
                                                className="h-12 bg-slate-50 font-bold"
                                                placeholder="Ex: 1/3 ou 50%"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dashboard de Resultados Premium */}
                            {startDate && results && (
                                <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-slate-900 rounded-lg p-1.5 shadow-sm">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Timeline do Processo</h3>
                                        </div>
                                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-widest text-[10px] font-bold">
                                            Sucesso
                                        </Badge>
                                    </div>

                                    <Card className="rounded-2xl border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
                                        <div className="flex flex-col md:flex-row">
                                            {/* PROGRESSÃO */}
                                            <div className="flex-1 p-8 relative border-b md:border-b-0 md:border-r border-slate-100 group hover:bg-slate-50/50 transition-colors">
                                                <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500"></div>
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-widest mb-1.5">Passo 1</p>
                                                        <h4 className="text-slate-900 font-extrabold text-lg leading-none">Progressão</h4>
                                                        <p className="text-xs text-slate-500 mt-1.5">Regime mais brando</p>
                                                    </div>
                                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2.5 shadow-sm">
                                                        <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                </div>
                                                <div className="text-3xl font-black text-slate-900 tracking-tighter mb-6">
                                                    {results.progDate}
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                                        <span>Progresso</span>
                                                        <span className="text-indigo-600 font-black">{formatProgressFraction(results.fractionProg)}</span>
                                                    </div>
                                                    <div className="bg-slate-100 h-2 w-full rounded-full overflow-hidden">
                                                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${results.fractionProg * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* LIVRAMENTO */}
                                            <div className="flex-1 p-8 relative border-b md:border-b-0 md:border-r border-slate-100 group hover:bg-slate-50/50 transition-colors">
                                                <div className="absolute top-0 left-0 w-full h-1.5 bg-purple-500"></div>
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-purple-500/80 uppercase tracking-widest mb-1.5">Passo 2</p>
                                                        <h4 className="text-slate-900 font-extrabold text-lg leading-none">Condicional</h4>
                                                        <p className="text-xs text-slate-500 mt-1.5">Livramento (LC)</p>
                                                    </div>
                                                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-2.5 shadow-sm">
                                                        <Clock className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                </div>
                                                <div className="text-3xl font-black text-slate-900 tracking-tighter mb-6">
                                                    {results.livDate}
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                                        <span>Condição</span>
                                                        <span className="text-purple-600 font-black">{formatProgressFraction(results.fractionLiv)}</span>
                                                    </div>
                                                    <div className="bg-slate-100 h-2 w-full rounded-full overflow-hidden">
                                                        <div className="bg-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${results.fractionLiv * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* TÉRMINO */}
                                            <div className="flex-1 p-8 relative bg-slate-900 group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full pointer-events-none"></div>
                                                <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500"></div>
                                                <div className="flex justify-between items-start mb-6 relative z-10">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1.5">Final</p>
                                                        <h4 className="text-white font-extrabold text-lg leading-none">Pena Cumprida</h4>
                                                        <p className="text-xs text-slate-400 mt-1.5">Extinção total da pena</p>
                                                    </div>
                                                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 shadow-sm">
                                                        <Check className="h-5 w-5 text-rose-400" />
                                                    </div>
                                                </div>
                                                <div className="text-3xl font-black text-white tracking-tighter mb-6 relative z-10">
                                                    {results.expectedEnd}
                                                </div>

                                                <div className="space-y-2 relative z-10">
                                                    <div className="flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                                        <span>Conclusão</span>
                                                        <span className="text-rose-400">100%</span>
                                                    </div>
                                                    <div className="bg-slate-800 h-2 w-full rounded-full overflow-hidden">
                                                        <div className="bg-rose-500 h-full rounded-full transition-all duration-1000 w-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                                            <p className="text-xs text-slate-500 font-medium">As projeções matemáticas baseiam-se nos dados inseridos, deduzindo os <strong className="text-slate-900 font-bold">{remissionDays} dias</strong> remidos homologados do total calculado.</p>
                                        </div>
                                    </Card>
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
                </TabsContent>

                <TabsContent value="antecedentes">
                    <RecidivismCalculator />
                </TabsContent>
            </Tabs>
        </div>
    )
}
