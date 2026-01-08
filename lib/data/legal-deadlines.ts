// Prazos processuais fixos segundo o CPC e legislação brasileira
export const LEGAL_DEADLINES = {
  // Prazos do Novo CPC (Lei 13.105/2015)
  contestacao: {
    name: 'Contestação',
    days: 15,
    description: 'Prazo para apresentar contestação (art. 335, CPC)',
    countType: 'dias_uteis', // dias úteis
  },
  replica: {
    name: 'Réplica',
    days: 15,
    description: 'Prazo para manifestação sobre a contestação (art. 350, CPC)',
    countType: 'dias_uteis',
  },
  apelacao: {
    name: 'Apelação',
    days: 15,
    description: 'Prazo para interpor apelação (art. 1.003, CPC)',
    countType: 'dias_uteis',
  },
  contrarrazoes_apelacao: {
    name: 'Contrarrazões de Apelação',
    days: 15,
    description: 'Prazo para apresentar contrarrazões de apelação (art. 1.010, §1º, CPC)',
    countType: 'dias_uteis',
  },
  agravo_instrumento: {
    name: 'Agravo de Instrumento',
    days: 15,
    description: 'Prazo para agravo de instrumento (art. 1.003, §5º, CPC)',
    countType: 'dias_uteis',
  },
  embargos_declaracao: {
    name: 'Embargos de Declaração',
    days: 5,
    description: 'Prazo para embargos de declaração (art. 1.023, CPC)',
    countType: 'dias_uteis',
  },
  recurso_especial: {
    name: 'Recurso Especial (REsp)',
    days: 15,
    description: 'Prazo para recurso especial ao STJ (art. 1.003, CPC)',
    countType: 'dias_uteis',
  },
  recurso_extraordinario: {
    name: 'Recurso Extraordinário (RE)',
    days: 15,
    description: 'Prazo para recurso extraordinário ao STF (art. 1.003, CPC)',
    countType: 'dias_uteis',
  },
  agravo_interno: {
    name: 'Agravo Interno',
    days: 15,
    description: 'Prazo para agravo interno (art. 1.021, CPC)',
    countType: 'dias_uteis',
  },
  impugnacao_cumprimento: {
    name: 'Impugnação ao Cumprimento de Sentença',
    days: 15,
    description: 'Prazo para impugnar cumprimento de sentença (art. 525, CPC)',
    countType: 'dias_uteis',
  },
  embargos_execucao: {
    name: 'Embargos à Execução',
    days: 15,
    description: 'Prazo para embargos à execução (art. 915, CPC)',
    countType: 'dias_uteis',
  },
  manifestacao_pericia: {
    name: 'Manifestação sobre Perícia',
    days: 15,
    description: 'Prazo para manifestação sobre laudo pericial (art. 477, §1º, CPC)',
    countType: 'dias_uteis',
  },
  especificacao_provas: {
    name: 'Especificação de Provas',
    days: 15,
    description: 'Prazo para especificação de provas (art. 357, §4º, CPC)',
    countType: 'dias_uteis',
  },
  
  // Prazos Trabalhistas (CLT e Lei 13.467/2017)
  contestacao_trabalhista: {
    name: 'Contestação Trabalhista',
    days: 0,
    description: 'Apresentação na própria audiência (art. 847, CLT)',
    countType: 'audiencia',
  },
  recurso_ordinario_trabalhista: {
    name: 'Recurso Ordinário (Trabalhista)',
    days: 8,
    description: 'Prazo para recurso ordinário (art. 895, CLT)',
    countType: 'dias_corridos',
  },
  recurso_revista: {
    name: 'Recurso de Revista',
    days: 8,
    description: 'Prazo para recurso de revista ao TST (art. 896, CLT)',
    countType: 'dias_corridos',
  },
  embargos_declaracao_trabalhista: {
    name: 'Embargos de Declaração (Trabalhista)',
    days: 5,
    description: 'Prazo para embargos de declaração (art. 897-A, CLT)',
    countType: 'dias_corridos',
  },
  
  // Prazos Previdenciários
  recurso_inss: {
    name: 'Recurso Administrativo (INSS)',
    days: 30,
    description: 'Prazo para recurso à Junta de Recursos do CRPS',
    countType: 'dias_corridos',
  },
  
  // Prazos de Juizados Especiais (Lei 9.099/95)
  contestacao_jecrim: {
    name: 'Contestação (JECrim)',
    days: 0,
    description: 'Defesa oral na própria audiência (art. 81, Lei 9.099/95)',
    countType: 'audiencia',
  },
  recurso_inominado: {
    name: 'Recurso Inominado (JEC)',
    days: 10,
    description: 'Prazo para recurso em juizado especial (art. 42, Lei 9.099/95)',
    countType: 'dias_corridos',
  },
  embargos_declaracao_jec: {
    name: 'Embargos de Declaração (JEC)',
    days: 5,
    description: 'Prazo para embargos em juizado especial (art. 48, Lei 9.099/95)',
    countType: 'dias_corridos',
  },
  
  // Outros Prazos Importantes
  habeas_corpus: {
    name: 'Habeas Corpus',
    days: 0,
    description: 'Sem prazo fixo (medida urgente)',
    countType: 'urgente',
  },
  mandado_seguranca: {
    name: 'Mandado de Segurança',
    days: 120,
    description: 'Prazo decadencial de 120 dias (art. 23, Lei 12.016/2009)',
    countType: 'dias_corridos',
  },
  acao_rescisoria: {
    name: 'Ação Rescisória',
    days: 730, // 2 anos
    description: 'Prazo decadencial de 2 anos (art. 975, CPC)',
    countType: 'dias_corridos',
  },
  manifestacao_audiencia: {
    name: 'Manifestação Prévia à Audiência',
    days: 3,
    description: 'Prazo mínimo de antecedência para rol de testemunhas (art. 357, §4º, CPC)',
    countType: 'dias_uteis',
  },
}

// Função para calcular data final considerando dias úteis
export function calculateDeadline(
  startDate: Date,
  days: number,
  countType: 'dias_uteis' | 'dias_corridos' | 'audiencia' | 'urgente'
): Date | null {
  if (countType === 'audiencia' || countType === 'urgente') {
    return null // Não há data fixa
  }

  const result = new Date(startDate)
  let addedDays = 0

  if (countType === 'dias_corridos') {
    result.setDate(result.getDate() + days)
    return result
  }

  // Para dias úteis, pular fins de semana
  while (addedDays < days) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    
    // Pular sábado (6) e domingo (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++
    }
  }

  return result
}

// Lista de feriados nacionais (você pode expandir com feriados estaduais/municipais)
export const NATIONAL_HOLIDAYS = [
  { month: 1, day: 1, name: 'Confraternização Universal' },
  { month: 4, day: 21, name: 'Tiradentes' },
  { month: 5, day: 1, name: 'Dia do Trabalho' },
  { month: 9, day: 7, name: 'Independência do Brasil' },
  { month: 10, day: 12, name: 'Nossa Senhora Aparecida' },
  { month: 11, day: 2, name: 'Finados' },
  { month: 11, day: 15, name: 'Proclamação da República' },
  { month: 12, day: 25, name: 'Natal' },
  // Feriados móveis (você pode adicionar lógica de cálculo)
  // Carnaval, Corpus Christi, Sexta-feira Santa, etc.
]

