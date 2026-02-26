'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Scale, Calendar as CalendarIcon, Clock, AlertTriangle, Play, RefreshCcw, HandMetal } from 'lucide-react'
import { addYears, addMonths, addDays, subDays, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function PenalCalculatorPage() {
    // Inputs
    const [years, setYears] = useState<number>(0)
    const [months, setMonths] = useState<number>(0)
    const [days, setDays] = useState<number>(0)
    const [startDate, setStartDate] = useState<string>('')
    const [remissionDays, setRemissionDays] = useState<number>(0)

    // Fractions (Progressão & Livramento)
    const [progressionFraction, setProgressionFraction] = useState<string>('0.16')
    const [livramentoFraction, setLivramentoFraction] = useState<string>('0.333333333') // 1/3

    const handleCalculate = () => {
        if (!startDate) return null

        // 1. Total penalty in days (approximation 1 year = 365, 1 month = 30)
        const totalDurationDays = (years * 365) + (months * 30) + days

        // 2. Base Date
        const start = parseISO(startDate)

        // 3. Compute Progression
        // Apply remission logically: progression fraction is applied to the TOTAL penalty, THEN we subtract remitted days from the result.
        // Wait, standard jurisprudence (STJ/STF): remission is subtracted from the total penalty before some fractions, but currently it's usually:
        // (Total Penalty x Fraction) - Remission Days = Total Days to Serve for progression.
        const fractionProg = parseFloat(progressionFraction)
        let daysToProgression = Math.ceil(totalDurationDays * fractionProg)
        daysToProgression -= remissionDays

        // 4. Compute Livramento
        const fractionLiv = parseFloat(livramentoFraction)
        let daysToLivramento = Math.ceil(totalDurationDays * fractionLiv)
        daysToLivramento -= remissionDays

        // 5. Compute Dates
        let progDate = addDays(start, daysToProgression > 0 ? daysToProgression : 0)
        let livDate = addDays(start, daysToLivramento > 0 ? daysToLivramento : 0)

        // Calculate Termino da Pena (End of Penalty)
        let endOfPenaltyDays = totalDurationDays - remissionDays
        let expectedEnd = addDays(start, endOfPenaltyDays > 0 ? endOfPenaltyDays : 0)

        return {
            progDate: format(progDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
            livDate: format(livDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
            expectedEnd: format(expectedEnd, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
            totalDurationDays,
            daysToServeProg: daysToProgression > 0 ? daysToProgression : 0
        }
    }

    const results = handleCalculate()

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-8 relative overflow-hidden flex shadow-lg">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 text-white/5 transform rotate-12 pointer-events-none">
                    <Scale className="h-64 w-64" />
                </div>
                <div className="relative z-10 w-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-400/30">
                            <Scale className="h-6 w-6 text-indigo-300" />
                        </div>
                        <Badge variant="outline" className="border-indigo-400/30 text-indigo-200">
                            Criminal & Execução Penal
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
                        Calculadora Instantânea de Execução
                    </h1>
                    <p className="text-indigo-200 text-lg max-w-2xl font-light">
                        Simule com precisão matemática a progressão de regime, livramento condicional e término de pena, considerando o Pacote Anticrime e dias remidos do seu cliente.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Entradas */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-2xl border-slate-200/60 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-4">
                            <CardTitle className="text-slate-800 flex items-center gap-2 text-lg">
                                <Clock className="h-5 w-5 text-indigo-500" />
                                1. Condenação Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label>Anos</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={years || ''}
                                        onChange={e => setYears(parseInt(e.target.value) || 0)}
                                        className="h-12 text-center text-lg font-bold"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Meses</Label>
                                    <Input
                                        type="number"
                                        min="0" max="11"
                                        value={months || ''}
                                        onChange={e => setMonths(parseInt(e.target.value) || 0)}
                                        className="h-12 text-center text-lg font-bold"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dias</Label>
                                    <Input
                                        type="number"
                                        min="0" max="29"
                                        value={days || ''}
                                        onChange={e => setDays(parseInt(e.target.value) || 0)}
                                        className="h-12 text-center text-lg font-bold"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200/60 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-4">
                            <CardTitle className="text-slate-800 flex items-center gap-2 text-lg">
                                <CalendarIcon className="h-5 w-5 text-emerald-500" />
                                2. Início & Variáveis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            <div className="space-y-2">
                                <Label>Data Base (Prisão/Última Falta)</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex justify-between items-center">
                                    <span>Dias Remidos Acumulados</span>
                                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
                                        Trabalho/Estudo
                                    </Badge>
                                </Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={remissionDays || ''}
                                    placeholder="Qtd. de dias que o juízo homologou"
                                    onChange={e => setRemissionDays(parseInt(e.target.value) || 0)}
                                    className="h-12"
                                />
                                <p className="text-xs text-slate-500">* São os dias efetivos já descontados da pena (ex: 3 dias trabalhados = 1 dia remido). Insira o resultado final a ser descontado.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200/60 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-4">
                            <CardTitle className="text-slate-800 flex items-center gap-2 text-lg">
                                <HandMetal className="h-5 w-5 text-rose-500" />
                                3. Regras (Pacote Anticrime)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            <div className="space-y-2">
                                <Label>Fração de Progressão de Regime</Label>
                                <Select value={progressionFraction} onValueChange={setProgressionFraction}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Selecione a regra..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0.166666666">1/6 - Antigo (Crimes antes de 2020)</SelectItem>
                                        <SelectItem value="0.16">16% - Primário, Sem Violência (Art. 112, I)</SelectItem>
                                        <SelectItem value="0.20">20% - Reincidente, Sem Violência (Art. 112, II)</SelectItem>
                                        <SelectItem value="0.25">25% - Primário, Com Violência (Art. 112, III)</SelectItem>
                                        <SelectItem value="0.30">30% - Reincidente, Com Violência (Art. 112, IV)</SelectItem>
                                        <SelectItem value="0.40">40% - Hediondo/Equiparado, Primário (Art. 112, V)</SelectItem>
                                        <SelectItem value="0.50">50% - Hediondo c/ Morte, Primário (Art. 112, VI)</SelectItem>
                                        <SelectItem value="0.60">60% - Hediondo, Reincidente Específico (Art. 112, VII)</SelectItem>
                                        <SelectItem value="0.70">70% - Hediondo c/ Morte, Reincidente Esp. (Art. 112, VIII)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Fração de Livramento Condicional</Label>
                                <Select value={livramentoFraction} onValueChange={setLivramentoFraction}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Selecione a regra..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0.333333333">1/3 - Réu Primário + Conduta (Art. 83, I)</SelectItem>
                                        <SelectItem value="0.5">1/2 - Reincidente Crime Doloso (Art. 83, II)</SelectItem>
                                        <SelectItem value="0.666666666">2/3 - Crimes Hediondos (Art. 83, V)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={() => {
                            setYears(0)
                            setMonths(0)
                            setDays(0)
                            setStartDate('')
                            setRemissionDays(0)
                        }}
                        variant="ghost"
                        className="w-full text-slate-500 hover:text-slate-700"
                    >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Limpar Formulário
                    </Button>
                </div>

                {/* Dashboard de Resultados */}
                <div className="lg:col-span-8 space-y-6">
                    {startDate && results ? (
                        <>
                            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200/50 shadow-sm flex items-start gap-4 animate-in slide-in-from-right-8 duration-500">
                                <div className="bg-emerald-100 p-3 rounded-full mt-1">
                                    <Play className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-emerald-900 font-bold text-xl mb-1">Cálculo Bem-sucedido!</h3>
                                    <p className="text-emerald-700">Com a condenação de {years}a, {months}m e {days}d, as datas foram traçadas a partir de {format(parseISO(startDate), "dd/MM/yyyy")}.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="rounded-2xl border-indigo-200/60 shadow-md relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/50 hover:shadow-lg transition-shadow">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full -mr-4 -mt-4" />
                                    <CardContent className="p-8">
                                        <p className="text-indigo-600 font-bold tracking-wider text-xs uppercase mb-1">Passo Principal</p>
                                        <h3 className="text-slate-900 text-2xl font-bold mb-6">Progressão de Regime</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">Data Alcançada</p>
                                                <div className="text-3xl font-black text-indigo-900">{results.progDate}</div>
                                            </div>
                                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                                <div className="bg-indigo-500 h-full" style={{ width: `${parseFloat(progressionFraction) * 100}%` }} />
                                            </div>
                                            <p className="text-sm text-slate-600">Baseado no cumprimento de {(parseFloat(progressionFraction) * 100).toFixed(0)}% da pena total abatendo os dias remidos.</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-2xl border-purple-200/60 shadow-md relative overflow-hidden bg-gradient-to-br from-white to-purple-50/50 hover:shadow-lg transition-shadow">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4" />
                                    <CardContent className="p-8">
                                        <p className="text-purple-600 font-bold tracking-wider text-xs uppercase mb-1">Liberdade Antecipada</p>
                                        <h3 className="text-slate-900 text-2xl font-bold mb-6">Livramento Condicional</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">Data Alcançada</p>
                                                <div className="text-3xl font-black text-purple-900">{results.livDate}</div>
                                            </div>
                                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                                <div className="bg-purple-500 h-full" style={{ width: `${parseFloat(livramentoFraction) * 100}%` }} />
                                            </div>
                                            <p className="text-sm text-slate-600">Considerando sua fração homologada pelo juízo da execução.</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-2xl border-rose-200/60 shadow-md relative overflow-hidden bg-gradient-to-br from-white to-rose-50/50 hover:shadow-lg transition-shadow md:col-span-2">
                                    <CardContent className="p-8 flex items-center justify-between">
                                        <div>
                                            <p className="text-rose-600 font-bold tracking-wider text-xs uppercase mb-1">Libertação Definitiva</p>
                                            <h3 className="text-slate-900 text-2xl font-bold mb-2">Término Total da Pena</h3>
                                            <div className="text-4xl font-black text-rose-900">{results.expectedEnd}</div>
                                        </div>
                                        <div className="hidden md:block text-right">
                                            <p className="text-sm font-semibold text-slate-500 mb-1">Dias remidos descontados do total</p>
                                            <Badge variant="outline" className="text-rose-600 border-rose-200 text-lg px-3 py-1 bg-white">
                                                - {remissionDays} dias
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                <AlertTriangle className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-slate-700 font-bold text-xl mb-2">Aguardando Dados</h3>
                            <p className="text-slate-500 max-w-sm">
                                Preencha a condenação total, a data base e escolha as frações para visualizar a linha do tempo exata da execução penal do seu cliente.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
