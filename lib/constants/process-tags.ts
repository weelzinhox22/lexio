/**
 * Sistema de Tags/Etiquetas para Processos
 * Cada área tem uma cor única e identificação visual clara
 */

export type ProcessTag = 
  | 'consumidor'
  | 'criminal'
  | 'civel'
  | 'fase-audiencia'
  | 'fase-citacao'
  | 'fase-conciliacao'
  | 'fase-contestacao'
  | 'fase-inicial'
  | 'fase-sentenca'
  | 'trabalhista'
  | 'tributario'

export interface TagConfig {
  id: ProcessTag
  label: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  description: string
}

// Configuração de cores para cada etiqueta
export const PROCESS_TAGS: Record<ProcessTag, TagConfig> = {
  consumidor: {
    id: 'consumidor',
    label: 'Consumidor',
    color: 'bg-red-100',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-700',
    description: 'Direito do Consumidor'
  },
  criminal: {
    id: 'criminal',
    label: 'Criminal',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400',
    textColor: 'text-red-700',
    description: 'Processo Criminal'
  },
  civel: {
    id: 'civel',
    label: 'Cível',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
    description: 'Processo Cível'
  },
  'fase-audiencia': {
    id: 'fase-audiencia',
    label: 'Fase Audiência',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-700',
    description: 'Fase de Audiência'
  },
  'fase-citacao': {
    id: 'fase-citacao',
    label: 'Fase Citação',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-700',
    description: 'Fase de Citação'
  },
  'fase-conciliacao': {
    id: 'fase-conciliacao',
    label: 'Fase Conciliação',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-700',
    description: 'Fase de Conciliação'
  },
  'fase-contestacao': {
    id: 'fase-contestacao',
    label: 'Fase Contestação',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-700',
    description: 'Fase de Contestação'
  },
  'fase-inicial': {
    id: 'fase-inicial',
    label: 'Fase Inicial',
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    textColor: 'text-indigo-700',
    description: 'Fase Inicial'
  },
  'fase-sentenca': {
    id: 'fase-sentenca',
    label: 'Fase Sentença',
    color: 'bg-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    textColor: 'text-pink-700',
    description: 'Fase de Sentença'
  },
  trabalhista: {
    id: 'trabalhista',
    label: 'Trabalhista',
    color: 'bg-cyan-500',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-300',
    textColor: 'text-cyan-700',
    description: 'Processo Trabalhista'
  },
  tributario: {
    id: 'tributario',
    label: 'Tributário',
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-700',
    description: 'Processo Tributário'
  }
}

export const TAG_LIST = Object.values(PROCESS_TAGS)

export function getTagConfig(tagId: ProcessTag): TagConfig {
  return PROCESS_TAGS[tagId]
}

export function getTagColor(tagId: ProcessTag): string {
  return PROCESS_TAGS[tagId]?.color || 'bg-slate-500'
}

export function getTagLabel(tagId: ProcessTag): string {
  return PROCESS_TAGS[tagId]?.label || tagId
}
