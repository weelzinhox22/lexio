"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Sparkles,
    FileText,
    ShieldCheck,
    Zap,
    Copy,
    Download,
    ChevronRight,
    Loader2,
    Scale,
    Gavel,
    FileType,
    History,
    Save,
    Share2,
    Trash2,
    Search,
    Info,
    CheckCircle2
} from "lucide-react"
import { generateLegalDocument, saveAiDocument, contributeAsTemplate } from "@/app/dashboard/ai-writer/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface LegalWriterInterfaceProps {
    clients: any[]
    processes: any[]
    initialHistory: any[]
}

export function LegalWriterInterface({ clients, processes, initialHistory }: LegalWriterInterfaceProps) {
    const [loading, setLoading] = useState(false)
    const [isExporting, setIsExporting] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isContributing, setIsContributing] = useState(false)
    const [result, setResult] = useState<{ title: string, content: string, type: string } | null>(null)
    const [history, setHistory] = useState(initialHistory)
    const [activeTab, setActiveTab] = useState("writer")

    const [formData, setFormData] = useState({
        caseDescription: "",
        clientId: "",
        processId: "",
        type: 'petition' as any
    })

    const handleGenerate = async () => {
        if (!formData.caseDescription || !formData.clientId) {
            toast.error("Preencha a descrição e o cliente")
            return
        }

        setLoading(true)
        try {
            const res = await generateLegalDocument(formData)
            if (res.success) {
                setResult({
                    title: res.title,
                    content: res.content,
                    type: formData.type
                })
                toast.success("Documento gerado localmente!")
            }
        } catch (error) {
            toast.error("Erro ao gerar documento")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveToHistory = async () => {
        if (!result) return
        setIsSaving(true)
        try {
            const res = await saveAiDocument({
                ...result,
                clientId: formData.clientId,
                processId: formData.processId
            })
            if (res.success) {
                toast.success("Salvo no seu histórico!")
                setHistory([{ ...result, created_at: new Date().toISOString(), id: Math.random().toString() }, ...history])
            } else {
                toast.error("Erro ao salvar: " + res.error)
            }
        } catch (e) {
            toast.error("Erro ao salvar")
        } finally {
            setIsSaving(false)
        }
    }

    const handleContribute = async () => {
        if (!result) return
        setIsContributing(true)
        try {
            const res = await contributeAsTemplate(result)
            if (res.success) {
                toast.success("Estrutura anonimizada e enviada para a rede!")
            } else {
                toast.error("Erro ao contribuir: " + res.error)
            }
        } catch (e) {
            toast.error("Erro ao contribuir")
        } finally {
            setIsContributing(false)
        }
    }

    const viewFromHistory = (doc: any) => {
        setResult({
            title: doc.title,
            content: doc.content,
            type: doc.type
        })
        setActiveTab("writer")
        window.scrollTo({ top: 0, behavior: 'smooth' })
        toast.info("Visualizando documento do histórico")
    }

    const handleDownloadPDF = async () => {
        if (!result) return
        setIsExporting('pdf')
        try {
            const { default: html2pdf } = await import('html2pdf.js')
            const element = document.createElement('div')
            element.innerHTML = `
                <div style="font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.5; white-space: pre-wrap; font-size: 12pt; color: #000;">
                    ${result.content}
                </div>
            `
            const opt = {
                margin: 0.75,
                filename: `${result.title}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            }
            await html2pdf().set(opt).from(element).save()
            toast.success("PDF gerado com sucesso!")
        } catch (e) {
            toast.error("Erro ao gerar PDF")
        } finally {
            setIsExporting(null)
        }
    }

    const handleDownloadDocx = async () => {
        if (!result) return
        setIsExporting('docx')
        try {
            const { Document, Paragraph, TextRun, Packer, AlignmentType } = await import('docx')

            const paragraphs = result.content.split('\n').map(line =>
                new Paragraph({
                    children: [new TextRun({
                        text: line || " ",
                        size: 24, // 12pt
                        font: "Times New Roman"
                    })],
                    alignment: AlignmentType.JUSTIFIED,
                    spacing: { line: 360 } // 1.5 line spacing
                })
            )

            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 1440, // 1 inch
                                right: 1440,
                                bottom: 1440,
                                left: 1440
                            }
                        }
                    },
                    children: [
                        new Paragraph({
                            children: [new TextRun({
                                text: result.title,
                                bold: true,
                                size: 28, // 14pt
                                font: "Times New Roman"
                            })],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 }
                        }),
                        ...paragraphs
                    ],
                }],
            })

            const blob = await Packer.toBlob(doc)
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${result.title}.docx`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success("Word gerado com sucesso!")
        } catch (e) {
            toast.error("Erro ao gerar Word")
        } finally {
            setIsExporting(null)
        }
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        Redator IA Inteligente
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">Lexio Heuristic Engine v4.0 • 100% Protegido</p>
                </div>
                <TabsList className="bg-slate-100 p-1 rounded-2xl h-12 border border-slate-200/60 shadow-inner w-fit">
                    <TabsTrigger value="writer" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider gap-2">
                        <Zap className="h-4 w-4" /> Redator
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider gap-2">
                        <History className="h-4 w-4" /> Histórico
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="writer" className="mt-0 outline-none">
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-8 px-8 flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="h-2 w-8 bg-indigo-600 rounded-full" />
                                    Montagem da Minuta
                                </CardTitle>
                                <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-mono text-[10px]">
                                    LOCAL_SECURE_MODE
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2.5">
                                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Escopo Jurídico</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                                        >
                                            <SelectTrigger className="rounded-2xl border-slate-200 h-12 bg-slate-50/50 focus:ring-indigo-500 transition-all font-semibold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="petition">Petição Civil</SelectItem>
                                                <SelectItem value="criminal">Advocacia Criminal</SelectItem>
                                                <SelectItem value="tax">Direito Tributário</SelectItem>
                                                <SelectItem value="corporate">Societário & Negócios</SelectItem>
                                                <SelectItem value="contract">Padrão / Honorários</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Cliente</Label>
                                        <Select
                                            value={formData.clientId}
                                            onValueChange={(val) => setFormData({ ...formData, clientId: val })}
                                        >
                                            <SelectTrigger className="rounded-2xl border-slate-200 h-12 bg-slate-50/50 focus:ring-indigo-500 transition-all font-semibold">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Processo de Referência</Label>
                                    <Select
                                        value={formData.processId}
                                        onValueChange={(val) => setFormData({ ...formData, processId: val })}
                                    >
                                        <SelectTrigger className="rounded-2xl border-slate-200 h-12 bg-slate-50/50 focus:ring-indigo-500 transition-all font-semibold">
                                            <SelectValue placeholder="Nenhum vínculo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Nenhum</SelectItem>
                                            {processes.map(p => <SelectItem key={p.id} value={p.id}>{p.title} ({p.process_number})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center ml-1">
                                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resumo do Fato Jurídico</Label>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Privado</span>
                                        </div>
                                    </div>
                                    <Textarea
                                        placeholder="Ex: 'O cliente comprou um carro que fundiu o motor em 2 dias e a concessionária nega o conserto...'"
                                        className="min-h-[160px] rounded-3xl border-slate-200 focus:ring-indigo-500 p-6 text-sm leading-relaxed bg-slate-50/20 placeholder:italic"
                                        value={formData.caseDescription}
                                        onChange={(e) => setFormData({ ...formData, caseDescription: e.target.value })}
                                    />
                                </div>

                                <Button
                                    className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl h-14 shadow-xl shadow-slate-200 transition-all active:scale-[0.98] group font-black text-base uppercase tracking-wider"
                                    onClick={handleGenerate}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                                            <span className="animate-pulse">Sintetizando...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Zap className="h-5 w-5 text-amber-400 group-hover:scale-125 transition-transform" />
                                            <span>Construir Minuta</span>
                                        </div>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Privacy & Terms */}
                        <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                                <ShieldCheck className="h-5 w-5" />
                                <span>Privacidade & Termos de Uso</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                                    <p className="text-[11px] text-slate-600 leading-relaxed">
                                        <strong>Histórico Particular:</strong> Salvamos seus documentos gerados apenas para sua consulta. Nenhum outro advogado tem acesso aos seus dados.
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                                    <p className="text-[11px] text-slate-600 leading-relaxed">
                                        <strong>Inteligência Coletiva:</strong> Ao optar por "Contribuir", o sistema remove automaticamente nomes, CPFs e endereços para criar um modelo genérico anônimo que beneficia toda a plataforma.
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Info className="h-4 w-4 text-indigo-400 mt-0.5" />
                                    <p className="text-[10px] text-slate-500 italic">
                                        Ao utilizar estas ferramentas, você concede à plataforma o direito irrevogável de utilizar as versões <strong>anonimizadas</strong> das minutas para treinamento e melhoria dos motores de geração.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Prévia da Minuta
                            </h3>
                            {result && (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="rounded-full h-9 px-4 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 gap-2" onClick={handleSaveToHistory} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <Save className="h-4 w-4" />}
                                        Salvar no Histórico
                                    </Button>
                                    <Button variant="outline" size="sm" className="rounded-full h-9 px-4 font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2" onClick={handleContribute} disabled={isContributing}>
                                        {isContributing ? <Loader2 className="h-4 w-4 animate-spin text-indigo-400" /> : <Share2 className="h-4 w-4" />}
                                        Contribuir (Rede)
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className={cn(
                            "min-h-[700px] w-full bg-slate-100 rounded-[3rem] border-2 border-dashed border-slate-300 p-2 flex flex-col relative transition-all duration-700",
                            result ? "bg-indigo-50/20 border-solid border-indigo-200/50 shadow-inner" : ""
                        )}>
                            {!result ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                                    <div className="h-28 w-28 bg-white rounded-full shadow-2xl flex items-center justify-center mb-8 relative group animate-bounce-slow">
                                        <Gavel className="h-12 w-12 text-slate-200 group-hover:text-indigo-600 transition-all duration-500" />
                                        <Sparkles className="absolute top-4 right-4 h-5 w-5 text-indigo-300 animate-pulse" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight">Estrutura Pronta para Ação</h4>
                                    <p className="text-slate-400 text-sm max-w-[300px] mt-4 font-medium leading-relaxed italic">
                                        "A justiça não tarda quando a petição é bem fundamentada."
                                    </p>
                                </div>
                            ) : (
                                <div className="flex-1 bg-white rounded-[2.8rem] m-1 p-10 sm:p-16 shadow-2xl animate-in zoom-in-95 fade-in slide-in-from-bottom-10 duration-700 overflow-y-auto max-h-[780px] scrollbar-hide flex flex-col">
                                    <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                <Zap className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block">Minuta Digital</span>
                                                <span className="text-sm font-bold text-slate-700">Lexio Heuristic Engine</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 font-bold border-indigo-100 text-indigo-600" onClick={handleDownloadDocx} disabled={!!isExporting}>
                                                <FileType className="h-4 w-4 mr-2" /> {isExporting === 'docx' ? '...' : 'WORD'}
                                            </Button>
                                            <Button variant="default" size="sm" className="rounded-xl h-10 px-4 font-bold bg-slate-900 hover:bg-black" onClick={handleDownloadPDF} disabled={!!isExporting}>
                                                <Download className="h-4 w-4 mr-2" /> {isExporting === 'pdf' ? '...' : 'PDF'}
                                            </Button>
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-black text-slate-900 mb-12 text-center uppercase tracking-tight leading-tight max-w-[90%] mx-auto">
                                        {result.title}
                                    </h2>

                                    <pre className="whitespace-pre-wrap font-serif text-[15px] md:text-[17px] leading-[1.8] text-slate-800 bg-transparent p-0 border-none select-text">
                                        {result.content}
                                    </pre>

                                    <div className="mt-24 pt-10 border-t border-slate-50 text-center opacity-40">
                                        <div className="h-px bg-slate-300 w-64 mx-auto mb-4" />
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.4em]">Autenticação Digital • Themixa CRM</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="history" className="outline-none">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.length === 0 ? (
                        <Card className="col-span-full py-24 bg-slate-50 border-dashed border-2 border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center">
                            <div className="h-20 w-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                                <History className="h-10 w-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Memória Vazia</h3>
                            <p className="text-slate-400 mt-3 font-medium">Salve suas gerações para acessá-las rapidamente aqui.</p>
                        </Card>
                    ) : (
                        history.map((doc: any) => (
                            <Card key={doc.id} className="rounded-[2.5rem] border-slate-200/60 shadow-lg hover:shadow-2xl transition-all group hover:-translate-y-2 overflow-hidden flex flex-col bg-white">
                                <CardHeader className="bg-slate-50/50 p-8 pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge className="bg-indigo-50 border-indigo-100 text-indigo-600 font-bold text-[10px] uppercase tracking-wide px-3 py-1">
                                            {doc.type}
                                        </Badge>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            {format(new Date(doc.created_at), "dd MMM yyyy", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg font-black text-slate-800 line-clamp-2 leading-tight h-14">
                                        {doc.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                                    <p className="text-[13px] text-slate-500 line-clamp-3 mb-8 font-medium leading-relaxed italic opacity-70">
                                        {doc.content.substring(0, 160).replace(/EXCELENTÍSSIMO[\s\S]*?\.\n\n/, '')}...
                                    </p>
                                    <div className="flex gap-2 mt-auto">
                                        <Button
                                            variant="outline"
                                            className="flex-1 rounded-2xl h-12 font-black border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-xs uppercase tracking-widest"
                                            onClick={() => viewFromHistory(doc)}
                                        >
                                            <Search className="h-4 w-4 mr-2" /> Abrir Minuta
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </TabsContent>

            <style jsx global>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s infinite ease-in-out;
                }
            `}</style>
        </Tabs>
    )
}
