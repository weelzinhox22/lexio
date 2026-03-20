
export type OfflineAiRule = {
    id: string;
    rule_type: 'publication' | 'sentence';
    keywords: string[];
    category: string;
    suggested_action: string;
    probability_score: number | null;
    priority_level: string;

    // Novas Meta-Tags Avançadas
    semantic_context?: string;
    legal_area?: string;
    procedural_stage?: string;
    risk_level?: string;
    urgency?: boolean;
    deadline_days?: number;
    suggested_petition?: string;
    financial_impact?: string;
};

export type AnalysisResult = {
    matchedRules: OfflineAiRule[];
    suggestedActions: string[];
    topCategory: string | null;
    probabilityScore: number | null;
    isAnalyzed: boolean;
};

/**
 * Analisa um texto (publicação ou sentença) contra as regras armazenadas no banco,
 * garantindo que nenhum dado sensível saia da infraestrutura (totalmente offline/banco local).
 */
export async function analyzeTextOffline(supabase: any, text: string, type: 'publication' | 'sentence'): Promise<AnalysisResult> {
    if (!text || text.trim() === '') {
        return {
            matchedRules: [],
            suggestedActions: [],
            topCategory: null,
            probabilityScore: null,
            isAnalyzed: false,
        };
    }

    // Buscar regras ativas para o tipo específico
    const { data: rules, error } = await supabase
        .from('offline_ai_rules')
        .select('*')
        .eq('rule_type', type)
        .eq('active', true);

    if (error || !rules) {
        console.error('Erro ao buscar regras de IA offline:', error);
        return {
            matchedRules: [],
            suggestedActions: [],
            topCategory: null,
            probabilityScore: null,
            isAnalyzed: false,
        };
    }

    const normalizedText = text.toLowerCase();
    const matchedRules: OfflineAiRule[] = [];

    // Aplicar as regras ao texto (Jurimetria baseada em regras estritas locais)
    for (const rule of rules) {
        const keywords = rule.keywords as string[];
        // Lógica simples: se qualquer ou a maioria das keywords estiver presente
        // Para maior precisão, podemos exigir que pelo menos 1 keyword forte ou X keywords estejam presentes
        // Aqui usaremos correspondência se alguma keyword importante for encontrada
        const matches = keywords.filter((k: string) => normalizedText.includes(k.toLowerCase()));

        if (matches.length > 0) {
            // Regras com mais correspondências são mais fortes, mas para simplificar, se bateu 1 já consideramos
            // (Podemos refinar a engine aqui depois)
            matchedRules.push(rule);
        }
    }

    // Ordenar as regras por importância (prioridade e score)
    // priority: urgent > high > medium > low
    const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };

    matchedRules.sort((a, b) => {
        const pwA = priorityWeight[a.priority_level] || 0;
        const pwB = priorityWeight[b.priority_level] || 0;
        if (pwA !== pwB) return pwB - pwA;
        return (b.probability_score || 0) - (a.probability_score || 0);
    });

    const topRule = matchedRules[0];

    return {
        matchedRules,
        suggestedActions: matchedRules.map(r => r.suggested_action).filter(Boolean),
        topCategory: topRule?.category || null,
        probabilityScore: topRule?.probability_score || null,
        isAnalyzed: matchedRules.length > 0,
    };
}
