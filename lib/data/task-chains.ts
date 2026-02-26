import { LegalDeadline, calculateDeadline } from './legal-deadlines'

export interface ChainedTask {
    type: string
    title: string
    description?: string
    daysFromOriginal: number // quantos dias APÓS o prazo original
    businessDays: boolean
}

// Mapa de encadeamento de tarefas:
// Qual tipo de prazo original gera quais próximas tarefas sugeridas.
export const DEADLINE_CHAINS: Record<string, ChainedTask[]> = {
    "Contestação": [
        { type: "Réplica", title: "Apresentar Réplica", daysFromOriginal: 15, businessDays: true, description: "Prazo para manifestação sobre a contestação (art. 350 CPC)" },
        { type: "Especificação de Provas", title: "Especificar Provas", daysFromOriginal: 15, businessDays: true, description: "Manifestação sobre provas a produzir" }
    ],
    "Audiência de Conciliação": [
        { type: "Contestação", title: "Apresentar Contestação", daysFromOriginal: 15, businessDays: true, description: "Prazo de 15 dias úteis contados da audiência infrutífera" }
    ],
    "Sentença": [
        { type: "Embargos de Declaração", title: "Embargos de Declaração", daysFromOriginal: 5, businessDays: true, description: "Opor embargos contra omissão, contradição ou obscuridade" },
        { type: "Apelação Cível", title: "Interpor Apelação", daysFromOriginal: 15, businessDays: true, description: "Prazo para apelação contra a sentença" }
    ],
    "Apelação Cível": [
        { type: "Contrarrazões de Apelação", title: "Contrarrazões", daysFromOriginal: 15, businessDays: true, description: "Prazo para apresentar contrarrazões ao recurso da parte contrária" }
    ],
    "Recurso Ordinário Trabalhista": [
        { type: "Contrarrazões Trabalhistas", title: "Contrarrazões Trabalhistas", daysFromOriginal: 8, businessDays: true, description: "Prazo para contrarrazoar o RO" }
    ],
    "Réplica": [
        { type: "Especificação de Provas", title: "Especificar Provas", daysFromOriginal: 15, businessDays: true, description: "Fase de especificação de provas após a réplica" }
    ],
    "Embargos de Declaração": [
        { type: "Apelação Cível", title: "Apelação (após Embargos)", daysFromOriginal: 15, businessDays: true, description: "Prazo de apelação recomeça após o julgamento dos embargos" }
    ],
    // Adicione mais mapeamentos conforme necessário
}
