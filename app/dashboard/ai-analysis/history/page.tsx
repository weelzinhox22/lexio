import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BrainCircuit, Clock, FileEdit, Calculator, ChevronLeft, ShieldCheck, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function JurimetricsHistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: history, error } = await supabase
        .from('saved_jurimetrics')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error(error)
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="shrink-0 bg-white">
                        <Link href="/dashboard/ai-analysis">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <BrainCircuit className="h-6 w-6 text-indigo-600" />
                            Histórico de Jurimetrias Salvas
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                            Análises processadas de forma segura e offline no servidor próprio.
                        </p>
                    </div>
                </div>
            </div>

            {!history || history.length === 0 ? (
                <Card className="bg-slate-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                        <BrainCircuit className="h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-700">Nenhuma análise arquivada</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-sm">
                            Você ainda não salvou nenhuma jurimetria no seu histórico. Retorne à página anterior para analisar um novo documento.
                        </p>
                        <Button className="mt-6 text-indigo-600 border-indigo-200" variant="outline" asChild>
                            <Link href="/dashboard/ai-analysis">Ir para Nova Análise</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {history.map((item) => (
                        <Card key={item.id} className="overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col group">
                            <CardContent className="p-0 flex flex-col h-full">
                                {/* Header / Category */}
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Badge className="w-fit bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                                            {item.rule_category}
                                        </Badge>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {format(new Date(item.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>
                                    {item.probability_score && (
                                        <div className="flex flex-col items-center bg-white border border-indigo-100 px-3 py-1.5 rounded-lg shrink-0 group-hover:bg-indigo-50 transition-colors">
                                            <span className="text-[9px] uppercase font-bold text-slate-400">Sucesso</span>
                                            <span className="text-lg font-black text-indigo-700 leading-none mt-0.5">{item.probability_score}%</span>
                                        </div>
                                    )}
                                </div>

                                {/* Preview Text */}
                                <div className="p-4 flex-1">
                                    <p className="text-sm text-slate-600 italic line-clamp-3 relative">
                                        <span className="text-3xl text-slate-200 absolute -top-3 -left-1 font-serif">&ldquo;</span>
                                        <span className="pl-4">{item.document_preview}</span>
                                    </p>
                                </div>

                                {/* Footer Meta Data (Ficha Técnica Resumida) */}
                                {(item.suggested_petition || item.financial_impact || item.deadline_days != null) && (
                                    <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2 mt-auto">
                                        {item.suggested_petition && (
                                            <div className="flex items-start gap-1.5 text-xs text-slate-600 col-span-2">
                                                <FileEdit className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">Ação: <span className="font-medium text-slate-800">{item.suggested_petition}</span></span>
                                            </div>
                                        )}
                                        {item.financial_impact && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                                <Calculator className="h-3 w-3 text-emerald-500" />
                                                Impacto: <span className="font-semibold uppercase">{item.financial_impact}</span>
                                            </div>
                                        )}
                                        {item.deadline_days != null && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                                <Clock className="h-3 w-3 text-orange-500" />
                                                Prazo: <span className="font-semibold uppercase">{item.deadline_days} dias</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
