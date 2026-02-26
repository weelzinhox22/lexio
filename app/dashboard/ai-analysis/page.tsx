'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BrainCircuit, UploadCloud, Loader2, CheckCircle, ShieldCheck, Save, History, Check } from 'lucide-react'
import { analyzeTextOffline, AnalysisResult } from '@/lib/ai/offline-analyzer'
import { OfflineAiInsight } from '@/components/ai/offline-ai-insight'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AiAnalysisPage() {
    const [text, setText] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)

    const handleAnalyze = async () => {
        if (!text.trim()) return

        setIsAnalyzing(true)
        try {
            // Usando uma chamada local do cliente diretamente (pois o arquivo offline-analyzer vai usar o Supabase Client)
            // Como o offline-analyzer chama createClient(), e é um helper que usa "await createClient()", 
            // precisaremos transformá-lo numa rota API para segurança total caso queiramos usar no cliente sem RLS exposado excessivamente.
            // Mas RLS já protege as regras, então podemos fazer o fetch via API se preferir, 
            // ou direto no cliente. Aqui usamos uma rota da API para não vazar a engine localmente pro browser.

            const res = await fetch('/api/ai/analyze-offline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, type: 'sentence' }),
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Erro na análise')
            }
            setResult(data.analysis)
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : 'Erro ao analisar')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleSaveAnalysis = async () => {
        if (!result || !result.isAnalyzed || !result.matchedRules?.length) return

        setIsSaving(true)
        try {
            const res = await fetch('/api/ai/save-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, analysis: result }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Erro ao salvar análise')

            toast.success('Análise salva com segurança no seu histórico!')
            setIsSaved(true)
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : 'Erro ao salvar histórico')
        } finally {
            setIsSaving(false)
        }
    }

    // Handle file upload (mock for text extraction)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setResult(null)
        setIsSaved(false)
        setIsAnalyzing(true)

        const reader = new FileReader()
        reader.onload = async (event) => {
            const content = event.target?.result
            if (typeof content === 'string') {
                // Simple extraction for text files
                setText(content.substring(0, 5000))
                setIsAnalyzing(false)
            } else {
                // Mock PDF delay and reading
                setTimeout(() => {
                    setText("Trata-se de ação indenizatória em que a parte autora alega ter sofrido mero aborrecimento e dissabor cotidiano devido à falha na prestação de serviço. Julgo improcedente o pedido de dano moral pois o fato não configura ofensa grave, tratando-se de mero dissabor não passível de indenização.")
                    setIsAnalyzing(false)
                }, 1500)
            }
        }

        if (file.type.includes('text')) {
            reader.readAsText(file)
        } else {
            reader.readAsDataURL(file) // just to trigger load for mock
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <BrainCircuit className="h-8 w-8 text-indigo-600" />
                        Analisador Jurimétrico (Offline)
                    </h1>
                    <p className="text-slate-600 mt-1 flex items-center gap-1.5 text-sm md:text-base">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        Funciona 100% no seu banco de dados. Nenhum dado sensível é enviado para a internet.
                    </p>
                </div>
                <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 shrink-0" asChild>
                    <Link href="/dashboard/ai-analysis/history">
                        <History className="h-4 w-4 mr-2" />
                        Acessar Histórico Salvo
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Entrada de Dados Módulo Jurimétrico</CardTitle>
                        <CardDescription>Cole sua sentença ou publicação, ou faça upload de um arquivo.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <div className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 relative group hover:bg-slate-100 transition-colors cursor-pointer">
                            <input
                                type="file"
                                accept=".txt,.pdf,.doc,.docx"
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                onChange={handleFileUpload}
                            />
                            <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" />
                            <p className="text-sm font-medium text-slate-700">Clique para fazer upload ou arraste o arquivo</p>
                            <p className="text-xs text-slate-500 mt-1">PDF, DOCX ou TXT</p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500 font-medium">Ou cole o texto</span>
                            </div>
                        </div>

                        <Textarea
                            placeholder="Cole aqui o trecho da sentença ou publicação do D.O. para análise instantânea de probabilidade local e sugestão de ações..."
                            className="min-h-[200px] bg-slate-50 border-slate-200 focus:bg-white resize-none"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />

                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || text.length < 10}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analisando localmente (Offline)...
                                </>
                            ) : (
                                'Analisar Jurimetria Offline'
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <div>
                    {result ? (
                        <div className="space-y-4">
                            <OfflineAiInsight analysis={result} processId={null} />
                            {result.isAnalyzed && result.matchedRules && result.matchedRules.length > 0 && (
                                <div className="flex justify-end pt-2">
                                    <Button
                                        onClick={handleSaveAnalysis}
                                        variant="outline"
                                        className={`border-indigo-300 ${isSaved ? 'bg-indigo-50 text-indigo-700' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                        disabled={isSaving || isSaved}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : isSaved ? (
                                            <Check className="h-4 w-4 mr-2 text-green-600" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        {isSaved ? 'Salvo no Histórico' : 'Arquivar Análise Seguro'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Card className="h-full bg-slate-50/50 border-dashed border-slate-200 flex items-center justify-center min-h-[300px]">
                            <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
                                <div className="bg-indigo-100/50 p-4 rounded-full">
                                    <BrainCircuit className="h-8 w-8 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-slate-700">Pronto para Análise</h3>
                                    <p className="text-sm text-slate-500 mt-1 max-w-xs">
                                        Insira um documento e extrairemos as chances de sucesso recursal e os próximos passos ideais.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
