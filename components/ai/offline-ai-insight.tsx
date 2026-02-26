import { BookAIcon, BrainCircuit, AlertTriangle, LightbulbIcon, ArrowRight, ShieldCheck, Clock, FileEdit, Calculator } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnalysisResult } from "@/lib/ai/offline-analyzer";

interface OfflineAiInsightProps {
    analysis: AnalysisResult;
    processId: string | null;
}

export function OfflineAiInsight({ analysis, processId }: OfflineAiInsightProps) {
    if (!analysis.isAnalyzed || !analysis.matchedRules || analysis.matchedRules.length === 0) {
        return (
            <Card className="bg-slate-50 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                <div className="bg-slate-200 p-4 rounded-full mb-4">
                    <BrainCircuit className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-700">Análise Concluída - Sem Padrão Específico</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md">
                    Nossa IA offline prioriza sua privacidade e roda localmente. O documento ou trecho enviado foi analisado, mas não engatilhou nenhum padrão das nossas teses mapeadas ou não exige uma ação processual prioritária sugerida automaticamente.
                </p>
                <div className="mt-6 flex flex-col gap-2 w-full max-w-sm">
                    <p className="text-xs text-slate-500 bg-white p-4 rounded-md border border-slate-200 shadow-sm text-center">
                        <strong>Padrão Recorrente?</strong> Caso este documento represente um andamento comum ou uma tese importante no seu dia a dia, por favor abra um <strong>ticket para o suporte</strong> administrativo solicitando o treinamento do motor offline com as palavras-chave deste caso específico.
                    </p>
                </div>
            </Card>
        );
    }

    const topRule = analysis.matchedRules[0];

    return (
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
                <BrainCircuit size={100} className="text-indigo-600" />
            </div>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-indigo-600" />
                    <CardTitle className="text-lg text-indigo-900">Análise Jurimétrica Offline</CardTitle>
                    <Badge variant="outline" className="bg-white/50 text-indigo-700 border-indigo-200 flex items-center gap-1 text-[10px]">
                        <ShieldCheck className="h-3 w-3" />
                        100% Privado
                    </Badge>
                </div>
                <p className="text-xs text-indigo-700/70">Análise com base no banco de regras do seu escritório.</p>
            </CardHeader>
            <CardContent className="space-y-4">

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">Categoria Identificada</h4>
                            <Badge className={`
                 ${topRule.priority_level === 'urgent' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                 ${topRule.priority_level === 'high' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : ''}
                 ${topRule.priority_level === 'medium' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                 ${topRule.priority_level === 'low' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : ''}
               `}>
                                {topRule.category}
                            </Badge>
                            {topRule.legal_area && (
                                <Badge variant="outline" className="ml-2 text-[10px] text-slate-500 bg-white">
                                    {topRule.legal_area.toUpperCase()}
                                </Badge>
                            )}
                        </div>

                        {topRule.semantic_context && (
                            <div className="text-sm text-slate-600 mb-2 italic">
                                &ldquo;{topRule.semantic_context}&rdquo;
                            </div>
                        )}

                        {topRule.suggested_action && (
                            <div className="bg-white/60 p-3 rounded-lg border border-indigo-100/50">
                                <h4 className="text-xs font-semibold flex items-center gap-1.5 text-indigo-600 mb-1">
                                    <LightbulbIcon className="h-3.5 w-3.5" />
                                    Ação Sugerida
                                </h4>
                                <p className="text-sm text-slate-700 font-medium">
                                    {topRule.suggested_action}
                                </p>
                            </div>
                        )}

                        {/* INFORMAÇÕES EXTRAS DA JURIMETRIA AVANÇADA (Ficha Técnica) */}
                        {(topRule.suggested_petition || topRule.deadline_days !== null || topRule.procedural_stage || topRule.financial_impact) && (
                            <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-lg mt-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Ficha Técnica da Automação</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {topRule.procedural_stage && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><BookAIcon className="h-3 w-3" /> Fase Processual</span>
                                            <span className="text-xs font-medium text-slate-700 mt-0.5">{topRule.procedural_stage}</span>
                                        </div>
                                    )}
                                    {topRule.financial_impact && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Calculator className="h-3 w-3" /> Risco Patrimonial</span>
                                            <span className={`text-xs font-bold mt-0.5 ${topRule.financial_impact === 'crítico' || topRule.financial_impact === 'alto' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {topRule.financial_impact.toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    {topRule.deadline_days != null && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><Clock className="h-3 w-3" /> Prazo Sugerido</span>
                                            <span className="text-xs font-bold text-orange-600 mt-0.5">{topRule.deadline_days} DIA(S)</span>
                                        </div>
                                    )}
                                    {topRule.suggested_petition && (
                                        <div className="flex flex-col col-span-2 md:col-span-1 mt-1 md:mt-0">
                                            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1"><FileEdit className="h-3 w-3" /> Peça Jurídica Proposta</span>
                                            <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded inline-block w-fit mt-0.5 whitespace-normal break-words">{topRule.suggested_petition}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {topRule.probability_score && (
                        <div className="flex flex-col justify-center items-center bg-white/60 p-4 rounded-lg border border-indigo-100/50 min-w-[140px]">
                            <span className="text-xs uppercase font-semibold text-slate-500 mb-1">Probabilidade</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-indigo-700">{topRule.probability_score}%</span>
                            </div>
                        </div>
                    )}
                </div>

                {processId && (
                    <div className="pt-2 flex justify-end">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" asChild>
                            <Link href={`/dashboard/deadlines/new?process=${processId}`}>
                                Criar Prazo
                                <ArrowRight className="h-4 w-4 ml-1.5" />
                            </Link>
                        </Button>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
