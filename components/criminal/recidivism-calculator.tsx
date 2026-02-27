import { AlertCircle, CheckCircle2, Copy, History, Scale, FileText, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { differenceInYears, format } from "date-fns"
import { SuggestionDialog } from "@/components/feedback/suggestion-dialog"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function RecidivismCalculator() {
    const supabase = createClient()
    const [extinctionDate, setExtinctionDate] = useState("")
    const [newFactDate, setNewFactDate] = useState(format(new Date(), "yyyy-MM-dd"))
    const [userId, setUserId] = useState<string | null>(null)
    const [result, setResult] = useState<{
        isRecidivist: boolean
        yearsPassed: number
        remainingYears?: number
        thesisAvailable: boolean
    } | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))
    }, [])

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

                <Card className="bg-slate-900 text-white border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-400" />
                            Assistente Criminal
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Insira as datas manualmente para verificar a reincidência e gerar teses baseadas no Art. 64 do CP.
                        </p>
                    </CardContent>
                </Card>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-3">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-slate-500 italic leading-tight">
                            Esta análise é baseada em regras automáticas predefinidas. A conferência jurídica final é obrigatória pelo advogado responsável.
                        </p>
                    </div>

                    <SuggestionDialog
                        userId={userId || ""}
                        category="criminal_calculator"
                        trigger={
                            <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs gap-2 h-8">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Sugerir nova tese ou melhoria
                            </Button>
                        }
                    />
                </div>
            </div>
        </div>
    )
}
