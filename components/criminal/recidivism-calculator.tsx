"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Copy, History, Scale, FileText, Upload, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { differenceInYears, format, isAfter, subYears, parse } from "date-fns"
import { ptBR } from "date-fns/locale"

export function RecidivismCalculator() {
    const [extinctionDate, setExtinctionDate] = useState("")
    const [newFactDate, setNewFactDate] = useState(format(new Date(), "yyyy-MM-dd"))
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [detectedDates, setDetectedDates] = useState<{ type: string, date: string, context: string }[]>([])
    const [result, setResult] = useState<{
        isRecidivist: boolean
        yearsPassed: number
        remainingYears?: number
        thesisAvailable: boolean
    } | null>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsAnalyzing(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/criminal/analyze-sentence', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()

            if (data.success && data.extractions.length > 0) {
                setDetectedDates(data.extractions)
                toast.success(`${data.extractions.length} padrões detectados na sentença!`, {
                    description: "Confira as datas encontradas pelo Assistente."
                })
            } else {
                toast.info("Processamento concluído", {
                    description: "Não detectamos datas claras de trânsito ou extinção neste arquivo."
                })
            }
        } catch (err) {
            toast.error("Erro ao analisar arquivo")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const applyDetectedDate = (dateStr: string) => {
        try {
            const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date())
            setExtinctionDate(format(parsedDate, 'yyyy-MM-dd'))
            setDetectedDates([])
            toast.success("Data aplicada ao cálculo!")
        } catch (e) {
            toast.error("Erro ao formatar data")
        }
    }

    useEffect(() => {
        if (extinctionDate && newFactDate) {
            const start = new Date(extinctionDate)
            const end = new Date(newFactDate)

            const years = differenceInYears(end, start)
            const isRecidivist = years < 5

            setResult({
                isRecidivist,
                yearsPassed: years,
                remainingYears: isRecidivist ? 5 - years : 0,
                thesisAvailable: !isRecidivist
            })
        }
    }, [extinctionDate, newFactDate])

    const thesisText = `Conforme o Art. 64, inciso I, do Código Penal, não prevalece a condenação anterior se entre a data do cumprimento ou extinção da pena e a infração posterior tiver decorrido período de tempo superior a 5 (cinco) anos. No caso em tela, entre a extinção da punibilidade (${extinctionDate ? format(new Date(extinctionDate), "dd/MM/yyyy") : ""}) e o novo fato (${newFactDate ? format(new Date(newFactDate), "dd/MM/yyyy") : ""}), decorreram mais de 5 anos, operando-se o sistema depurador. Portanto, o réu deve ser considerado tecnicamente primário para fins de dosimetria da pena, conforme consolidada jurisprudência do STJ.`

    const copyThesis = () => {
        navigator.clipboard.writeText(thesisText)
        toast.success("Tese Jurídica copiada!")
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-blue-600" />
                        Análise de Reincidência
                    </CardTitle>
                    <CardDescription>
                        Calcule o período depurador de 5 anos (Art. 64, I do CP)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="extinction_date">Extinção da Pena / Fim do Cumprimento</Label>
                        <Input
                            id="extinction_date"
                            type="date"
                            value={extinctionDate}
                            onChange={(e) => setExtinctionDate(e.target.value)}
                        />
                        <p className="text-[10px] text-slate-500">Data em que a pena anterior foi extinta ou cumprida.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new_fact_date">Data do Novo Fato (Crime Atual)</Label>
                        <Input
                            id="new_fact_date"
                            type="date"
                            value={newFactDate}
                            onChange={(e) => setNewFactDate(e.target.value)}
                        />
                    </div>

                    {result && (
                        <div className={`mt-6 p-4 rounded-xl border-2 transition-all ${result.isRecidivist
                            ? "bg-amber-50 border-amber-200"
                            : "bg-green-50 border-green-200"
                            }`}>
                            <div className="flex items-start gap-3">
                                {result.isRecidivist ? (
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                ) : (
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                )}
                                <div>
                                    <h4 className={`font-bold ${result.isRecidivist ? "text-amber-900" : "text-green-900"}`}>
                                        {result.isRecidivist ? "Réu Reincidente" : "Tecnicamente Primário"}
                                    </h4>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Passaram-se **{result.yearsPassed} anos**.
                                        {result.isRecidivist
                                            ? ` Faltam aproximadamente ${result.remainingYears} anos para atingir o período depurador.`
                                            : " O sistema depurador de 5 anos já foi atingido!"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-6">
                {result?.thesisAvailable && (
                    <Card className="border-green-200 bg-green-50/30 overflow-hidden">
                        <div className="bg-green-600 px-4 py-2 flex items-center justify-between">
                            <span className="text-white text-xs font-bold uppercase tracking-widest">Tese Recomendada</span>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-green-700" onClick={copyThesis}>
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <CardContent className="p-4">
                            <p className="text-sm text-slate-700 italic leading-relaxed">
                                "{thesisText}"
                            </p>
                            <div className="mt-4 flex items-center justify-between">
                                <Badge variant="outline" className="bg-white text-green-700 border-green-200">
                                    <Scale className="h-3 w-3 mr-1" /> STJ Informativo 662
                                </Badge>
                                <Button size="sm" variant="outline" className="bg-white" onClick={copyThesis}>
                                    Copiar para Minuta
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-slate-900 text-white border-0 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Sparkles size={80} className="text-blue-400" />
                    </div>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-400" />
                            Assistente de Extração OCR
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Suba o PDF da Sentença ou Folha de Antecedentes e eu buscarei as datas de extinção e trânsito para você.
                        </p>

                        <div className="flex flex-col gap-3">
                            <input
                                type="file"
                                id="pdf-upload"
                                className="hidden"
                                accept="application/pdf"
                                onChange={handleFileUpload}
                                disabled={isAnalyzing}
                            />
                            <Button
                                asChild
                                variant="outline"
                                className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-white h-12 rounded-xl group"
                                disabled={isAnalyzing}
                            >
                                <label htmlFor="pdf-upload" className="cursor-pointer flex items-center justify-center gap-2">
                                    {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin text-blue-400" /> : <Upload className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />}
                                    {isAnalyzing ? "Lendo Mentes..." : "Subir Sentença (PDF)"}
                                </label>
                            </Button>
                        </div>

                        {detectedDates.length > 0 && (
                            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Datas Detectadas:</Label>
                                {detectedDates.map((d, i) => (
                                    <div key={i} className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg hover:border-blue-500/50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-bold text-slate-300">{d.type}</span>
                                            <Badge className="bg-blue-600 text-[10px] py-0 px-1.5">{d.date}</Badge>
                                        </div>
                                        <p className="text-[10px] text-slate-500 italic mb-2 leading-tight">"...{d.context}..."</p>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => applyDetectedDate(d.date)}
                                            className="w-full h-7 text-[10px] bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-md"
                                        >
                                            Aplicar ao Cálculo
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-slate-500 italic">
                        Esta análise é estatística e baseada em dados públicos e regras automáticas. A conferência jurídica final é obrigatória pelo advogado responsável.
                    </p>
                </div>
            </div>
        </div>
    )
}
