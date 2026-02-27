'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, AlertCircle, CheckCircle2, Database, Globe } from 'lucide-react'
import { toast } from 'sonner'

export default function OabTestPage() {
    const [oabNumber, setOabNumber] = useState('')
    const [uf, setUf] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [results, setResults] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const [rawResponse, setRawResponse] = useState<any>(null)
    const [lawyerName, setLawyerName] = useState<string | null>(null)
    const [lawyerType, setLawyerType] = useState<string | null>(null)

    const ufOptions = [
        'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN',
        'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
    ]

    const handleSearch = async () => {
        if (!oabNumber.trim() || !uf) {
            toast.error('Preencha o número da OAB e selecione o UF')
            return
        }

        setIsSearching(true)
        setResults([])
        setError(null)
        setRawResponse(null)
        setLawyerName(null)
        setLawyerType(null)

        try {
            const response = await fetch('/api/datajud/search-by-oab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oabNumber: oabNumber.trim(), uf })
            })

            const data = await response.json()
            setRawResponse(data)

            if (!response.ok) {
                throw new Error(data.error || 'Erro na busca')
            }

            setResults(data.processes || [])
            setLawyerName(data.lawyerName || null)
            setLawyerType(data.lawyerType || null)

            if (data.lawyerName && data.processes.length === 0) {
                toast.info(`Advogado identificado: ${data.lawyerName}. Sem processos públicos encontrados.`)
            } else if (data.processes.length === 0) {
                toast.info('Nenhum processo encontrado')
            } else {
                toast.success(`${data.processes.length} processos encontrados`)
            }
        } catch (err: any) {
            console.error('OAB test error:', err)
            setError(err.message)
            toast.error(err.message)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="h-8 w-8 text-blue-600" />
                    Debug: Busca por OAB
                </h1>
                <p className="text-slate-600 mt-2">
                    Teste a integração direta com os tribunais e o DataJud via OAB.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Formulário */}
                <Card className="md:col-span-1 border-2 border-slate-200 shadow-lg">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-lg">Parâmetros de Busca</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="oab-number">Número da OAB</Label>
                            <Input
                                id="oab-number"
                                placeholder="Ex: 123456"
                                value={oabNumber}
                                onChange={(e) => setOabNumber(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="uf">UF (Estado)</Label>
                            <Select value={uf} onValueChange={setUf}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ufOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleSearch}
                            disabled={isSearching || !oabNumber || !uf}
                            className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-12 mt-2"
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Buscando nos Tribunais...
                                </>
                            ) : (
                                <>
                                    <Search className="mr-2 h-5 w-5" />
                                    Iniciar Busca Real
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Resultados */}
                <div className="md:col-span-2 space-y-6">
                    {error && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6 flex gap-3 text-red-800">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <div>
                                    <p className="font-bold">Erro Interno (500)</p>
                                    <p className="text-sm opacity-90">{error}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Card do Advogado (CNA) */}
                    {lawyerName && (
                        <Card className="border-green-200 bg-green-50 shadow-md">
                            <CardContent className="pt-6 flex gap-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-green-900 text-lg">{lawyerName}</p>
                                    <p className="text-sm text-green-700">
                                        OAB {oabNumber}/{uf} • {lawyerType || 'ADVOGADO'}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        ✅ Identificado via CNA (Cadastro Nacional dos Advogados)
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    {results.length} processos localizados
                                </h3>
                            </div>
                            {results.map((process, i) => (
                                <Card key={i} className="hover:border-blue-300 transition-colors shadow-sm">
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-mono font-bold text-blue-700">{process.numeroProcesso || process.numeroCNJ}</p>
                                                <p className="text-sm text-slate-700 mt-1">{process.classe?.nome || process.classe || process.classeProcessual}</p>
                                            </div>
                                            <Badge variant="secondary" className="bg-slate-100">
                                                {process.tribunal || process.origem || 'DataJud'}
                                            </Badge>
                                        </div>
                                        {(process.assuntos?.[0]?.nome || process.assunto) && (
                                            <p className="text-xs text-slate-500 line-clamp-1 italic">
                                                Assunto: {process.assuntos?.[0]?.nome || process.assunto}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : !isSearching && !error && (
                        <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                            {lawyerName ? (
                                <>
                                    <AlertCircle className="h-12 w-12 mb-4 text-amber-400" />
                                    <p className="text-slate-700 font-semibold">Nenhum processo encontrado automaticamente</p>
                                    <p className="text-xs mt-1 text-slate-500 max-w-md text-center">
                                        O advogado <span className="font-bold">{lawyerName}</span> foi identificado, mas não foi possível localizar processos via busca automática.
                                    </p>
                                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left max-w-sm">
                                        <p className="text-xs font-semibold text-amber-800 mb-2">💡 O que fazer:</p>
                                        <ul className="text-xs text-amber-700 space-y-1.5">
                                            <li><strong>1.</strong> Use o botão <strong>&quot;Pesquisar&quot;</strong> na tela de processos para buscar por número do processo.</li>
                                            <li><strong>2.</strong> Ou cadastre seus processos <strong>manualmente</strong> clicando em <strong>&quot;Novo Processo&quot;</strong>.</li>
                                        </ul>
                                        <p className="text-[10px] text-amber-600 mt-2 italic">
                                            Alguns tribunais não disponibilizam dados de advogados na API pública, exigindo consulta manual.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Search className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Os resultados aparecerão aqui após a busca.</p>
                                </>
                            )}
                        </div>
                    )}


                    {/* Raw Response Debug */}
                    {rawResponse && (
                        <Card className="border-slate-200 bg-slate-900">
                            <CardHeader className="py-3 border-b border-slate-800">
                                <CardTitle className="text-xs text-slate-400 font-mono">DEBUG: RAW JSON RESPONSE</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <pre className="p-4 text-[10px] text-green-400 overflow-auto max-h-[400px] font-mono whitespace-pre-wrap">
                                    {JSON.stringify(rawResponse, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
