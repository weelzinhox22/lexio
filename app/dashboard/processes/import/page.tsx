"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Upload, Loader2, CheckCircle2, XCircle, AlertTriangle,
    Copy, FileText, ArrowLeft, Sparkles, RefreshCw
} from "lucide-react"
import Link from "next/link"

type ImportResult = {
    processNumber: string
    status: "success" | "error" | "duplicate" | "not_found"
    message: string
    processId?: string
}

type ImportSummary = {
    total: number
    success: number
    notFound: number
    duplicates: number
    errors: number
}

type Client = { id: string; name: string }

export default function BatchImportPage() {
    const router = useRouter()
    const [rawInput, setRawInput] = useState("")
    const [parsedNumbers, setParsedNumbers] = useState<string[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [selectedClient, setSelectedClient] = useState<string>("")
    const [importing, setImporting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [results, setResults] = useState<ImportResult[] | null>(null)
    const [summary, setSummary] = useState<ImportSummary | null>(null)

    // Load clients
    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data } = await supabase
                .from("clients")
                .select("id, name")
                .order("name", { ascending: true })
            setClients(data || [])
        }
        load()
    }, [])

    // Parse input to extract process numbers
    const parseInput = useCallback((text: string) => {
        setRawInput(text)

        // Match CNJ patterns: 7 digits, dash, 2 digits, dot, 4 digits, dot, 1 digit, dot, 2 digits, dot, 4 digits
        // Also match bare 20-digit strings
        const patterns: string[] = []

        // Regex for formatted CNJ
        const cnjRegex = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/g
        const matches = text.match(cnjRegex) || []
        matches.forEach((m) => {
            if (!patterns.includes(m)) patterns.push(m)
        })

        // Also try extracting 20-digit sequences (unformatted)
        const lines = text.split(/[\n,;]+/)
        lines.forEach((line) => {
            const clean = line.trim().replace(/\D/g, "")
            if (clean.length === 20) {
                const formatted = `${clean.slice(0, 7)}-${clean.slice(7, 9)}.${clean.slice(9, 13)}.${clean.slice(13, 14)}.${clean.slice(14, 16)}.${clean.slice(16, 20)}`
                if (!patterns.includes(formatted)) patterns.push(formatted)
            }
        })

        setParsedNumbers(patterns)
    }, [])

    const handleImport = async () => {
        if (parsedNumbers.length === 0) return

        setImporting(true)
        setProgress(0)
        setResults(null)
        setSummary(null)

        try {
            // Simular progresso visual
            const progressInterval = setInterval(() => {
                setProgress((p) => Math.min(p + 2, 90))
            }, 500)

            const res = await fetch("/api/datajud/batch-import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    processNumbers: parsedNumbers,
                    clientId: selectedClient || null,
                }),
            })

            clearInterval(progressInterval)
            setProgress(100)

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Erro ao importar")
            }

            const data = await res.json()
            setResults(data.results)
            setSummary(data.summary)
        } catch (err: any) {
            alert(err.message || "Erro ao importar processos")
        } finally {
            setImporting(false)
        }
    }

    const pasteExample = () => {
        parseInput(
            "8125308-86.2023.8.05.0001\n0024981-17.2019.8.05.0001"
        )
    }

    const statusIcon = (status: string) => {
        switch (status) {
            case "success": return <CheckCircle2 className="h-4 w-4 text-green-600" />
            case "duplicate": return <Copy className="h-4 w-4 text-amber-600" />
            case "not_found": return <AlertTriangle className="h-4 w-4 text-orange-500" />
            case "error": return <XCircle className="h-4 w-4 text-red-600" />
            default: return null
        }
    }

    const statusLabel = (status: string) => {
        switch (status) {
            case "success": return "Importado"
            case "duplicate": return "Duplicado"
            case "not_found": return "Criado (sem DataJud)"
            case "error": return "Erro"
            default: return status
        }
    }

    const statusColor = (status: string) => {
        switch (status) {
            case "success": return "bg-green-100 text-green-700 border-green-200"
            case "duplicate": return "bg-amber-100 text-amber-700 border-amber-200"
            case "not_found": return "bg-orange-100 text-orange-700 border-orange-200"
            case "error": return "bg-red-100 text-red-700 border-red-200"
            default: return "bg-slate-100 text-slate-700 border-slate-200"
        }
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 text-white shadow-lg">
                            <Upload className="h-6 w-6" />
                        </div>
                        Importação em Lote
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Cole os números dos processos e o sistema buscará automaticamente no DataJud
                    </p>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/processes">
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Voltar
                    </Link>
                </Button>
            </div>

            {/* Instruções */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 shadow-sm">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="space-y-2 text-sm">
                            <p className="font-semibold text-blue-900">Como funciona:</p>
                            <ol className="list-decimal list-inside space-y-1 text-blue-800">
                                <li>Cole os números de processo (um por linha ou separados por vírgula)</li>
                                <li>O sistema <strong>detecta automaticamente o tribunal</strong> pelo número CNJ</li>
                                <li>Busca <strong>classe, assunto, vara, movimentações</strong> no DataJud</li>
                                <li>Cadastra tudo automaticamente no sistema</li>
                            </ol>
                            <p className="text-blue-700 text-xs mt-2">
                                Suporta até <strong>50 processos por vez</strong>. Números duplicados são ignorados.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Input Area */}
            {!results && (
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-600" />
                            Números dos Processos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Cole os números CNJ aqui *</Label>
                            <Textarea
                                value={rawInput}
                                onChange={(e) => parseInput(e.target.value)}
                                placeholder={"Cole os números de processo aqui, um por linha:\n\n8125308-86.2023.8.05.0001\n0024981-17.2019.8.05.0001\n1234567-89.2024.8.26.0001"}
                                rows={8}
                                className="font-mono text-sm"
                            />
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-500">
                                    Formatos aceitos: CNJ formatado ou 20 dígitos. Separados por linha, vírgula ou ponto-e-vírgula.
                                </p>
                                <Button variant="ghost" size="sm" onClick={pasteExample} className="text-xs text-blue-600">
                                    Colar exemplo
                                </Button>
                            </div>
                        </div>

                        {/* Preview */}
                        {parsedNumbers.length > 0 && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-slate-700">
                                        {parsedNumbers.length} processo{parsedNumbers.length > 1 ? "s" : ""} detectado{parsedNumbers.length > 1 ? "s" : ""}:
                                    </p>
                                    <Badge variant="secondary" className="text-xs">{parsedNumbers.length}/50</Badge>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {parsedNumbers.map((num, i) => (
                                        <Badge key={i} variant="outline" className="font-mono text-xs bg-white">
                                            {num}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cliente (opcional) */}
                        <div className="space-y-2">
                            <Label>Vincular ao cliente (opcional)</Label>
                            <Select value={selectedClient} onValueChange={setSelectedClient}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um cliente (ou deixe em branco)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhum — vincular depois</SelectItem>
                                    {clients.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Import Button */}
                        <Button
                            onClick={handleImport}
                            disabled={importing || parsedNumbers.length === 0}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                            size="lg"
                        >
                            {importing ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Importando... {progress}%
                                </>
                            ) : (
                                <>
                                    <Upload className="h-5 w-5 mr-2" />
                                    Importar {parsedNumbers.length} Processo{parsedNumbers.length > 1 ? "s" : ""} do DataJud
                                </>
                            )}
                        </Button>

                        {/* Progress bar */}
                        {importing && (
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {results && summary && (
                <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Card className="border-green-200 bg-green-50/50 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-green-700">{summary.success}</p>
                                <p className="text-xs text-green-600 mt-1">✅ Importados</p>
                            </CardContent>
                        </Card>
                        <Card className="border-orange-200 bg-orange-50/50 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-orange-700">{summary.notFound}</p>
                                <p className="text-xs text-orange-600 mt-1">⚠️ Sem DataJud</p>
                            </CardContent>
                        </Card>
                        <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-amber-700">{summary.duplicates}</p>
                                <p className="text-xs text-amber-600 mt-1">📋 Duplicados</p>
                            </CardContent>
                        </Card>
                        <Card className="border-red-200 bg-red-50/50 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-red-700">{summary.errors}</p>
                                <p className="text-xs text-red-600 mt-1">❌ Erros</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Result list */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Detalhes da Importação</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                {results.map((r, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${r.status === "success" ? "border-green-200 bg-green-50/30" :
                                                r.status === "duplicate" ? "border-amber-200 bg-amber-50/30" :
                                                    r.status === "not_found" ? "border-orange-200 bg-orange-50/30" :
                                                        "border-red-200 bg-red-50/30"
                                            }`}
                                    >
                                        <div className="shrink-0 mt-0.5">{statusIcon(r.status)}</div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-mono font-semibold text-slate-900">
                                                    {r.processNumber}
                                                </span>
                                                <Badge variant="outline" className={`text-[10px] ${statusColor(r.status)}`}>
                                                    {statusLabel(r.status)}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-600 mt-0.5">{r.message}</p>
                                        </div>
                                        {r.processId && (
                                            <Link href={`/dashboard/processes/${r.processId}`}>
                                                <Button variant="ghost" size="sm" className="shrink-0 text-xs">
                                                    Ver →
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={() => {
                                setResults(null)
                                setSummary(null)
                                setRawInput("")
                                setParsedNumbers([])
                                setProgress(0)
                            }}
                            variant="outline"
                            size="lg"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Importar mais processos
                        </Button>
                        <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
                            <Link href="/dashboard/processes">
                                Ver todos os processos →
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
