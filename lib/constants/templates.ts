/**
 * Constantes para templates
 */

export const TEMPLATE_CATEGORIES = [
  { value: 'kit_basico', label: 'Kit Básico' },
  { value: 'direito_consumidor', label: 'Direito do Consumidor' },
  { value: 'direito_familia', label: 'Direito de Família' },
  { value: 'direito_trabalhista', label: 'Direito Trabalhista' },
  { value: 'direito_civil', label: 'Direito Cível' },
  { value: 'direito_penal', label: 'Direito Penal' },
  { value: 'custom', label: 'Personalizados' },
] as const

export const TEMPLATE_TYPES = [
  { value: 'peticao_inicial', label: 'Petição Inicial' },
  { value: 'contestacao', label: 'Contestação' },
  { value: 'recurso', label: 'Recurso' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'procuracao', label: 'Procuração' },
  { value: 'termo', label: 'Termo' },
  { value: 'certidao', label: 'Certidão' },
  { value: 'outros', label: 'Outros' },
] as const

export const GROQ_MODELS = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Alta qualidade)' },
  { value: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout 17B (Rápido)' },
  { value: 'openai/gpt-oss-120b', label: 'GPT OSS 120B (Máxima qualidade)' },
  { value: 'openai/gpt-oss-20b', label: 'GPT OSS 20B (Balanceado)' },
] as const

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]['value']
export type TemplateType = (typeof TEMPLATE_TYPES)[number]['value']

