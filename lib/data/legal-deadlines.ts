// Prazos processuais fixos segundo o CPC, CLT e legislação brasileira
// Formato: Array de objetos com type, days, businessDays, category, description

export interface LegalDeadline {
  type: string
  days: number
  businessDays: boolean
  category: string
  description?: string
}

export const LEGAL_DEADLINES: LegalDeadline[] = [
  // ===== RECURSOS CÍVEIS (CPC) =====
  { type: "Apelação Cível", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.003 CPC" },
  { type: "Agravo de Instrumento", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.003 CPC" },
  { type: "Agravo Interno", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.021 CPC" },
  { type: "Embargos de Declaração", days: 5, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.023 CPC" },
  { type: "Recurso Especial (STJ)", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.003 CPC" },
  { type: "Recurso Extraordinário (STF)", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.003 CPC" },
  { type: "Agravo em Recurso Especial", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.042 CPC" },
  { type: "Agravo em Recurso Extraordinário", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.042 CPC" },
  { type: "Reclamação (STJ/STF)", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 988 CPC" },
  { type: "Agravo de Petição", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.021 CPC" },
  { type: "Contrarrazões de Apelação", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.010 CPC" },
  { type: "Contrarrazões de Recurso Especial", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.030 CPC" },
  { type: "Contrarrazões de Recurso Extraordinário", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.030 CPC" },
  { type: "Agravo Retido", days: 15, businessDays: true, category: "Recursos Cíveis", description: "Art. 1.021 CPC" },

  // ===== DEFESAS =====
  { type: "Contestação", days: 15, businessDays: true, category: "Defesas", description: "Art. 335 CPC - Prazo geral" },
  { type: "Reconvenção", days: 15, businessDays: true, category: "Defesas", description: "Art. 343 CPC" },
  { type: "Impugnação ao Cumprimento de Sentença", days: 15, businessDays: true, category: "Defesas", description: "Art. 525 CPC" },
  { type: "Embargos à Execução", days: 15, businessDays: true, category: "Defesas", description: "Art. 914 CPC" },
  { type: "Impugnação à Penhora", days: 15, businessDays: true, category: "Defesas", description: "Art. 916 CPC" },
  { type: "Exceção de Incompetência", days: 15, businessDays: true, category: "Defesas", description: "Art. 64 CPC" },
  { type: "Exceção de Suspeição", days: 15, businessDays: true, category: "Defesas", description: "Art. 146 CPC" },
  { type: "Exceção de Impedimento", days: 15, businessDays: true, category: "Defesas", description: "Art. 146 CPC" },
  { type: "Oposição", days: 15, businessDays: true, category: "Defesas", description: "Art. 56 CPC" },
  { type: "Impugnação ao Valor da Causa", days: 15, businessDays: true, category: "Defesas", description: "Art. 292 CPC" },

  // ===== MANIFESTAÇÕES =====
  { type: "Réplica", days: 15, businessDays: true, category: "Manifestações", description: "Art. 350 CPC" },
  { type: "Tréplica", days: 10, businessDays: true, category: "Manifestações", description: "Art. 350 CPC" },
  { type: "Contrarrazões de Apelação", days: 15, businessDays: true, category: "Manifestações", description: "Art. 1.010 CPC" },
  { type: "Contrarrazões de Recurso Especial", days: 15, businessDays: true, category: "Manifestações", description: "Art. 1.030 CPC" },
  { type: "Alegações Finais", days: 15, businessDays: true, category: "Manifestações", description: "Art. 364 CPC" },
  { type: "Manifestação sobre Laudo Pericial", days: 15, businessDays: true, category: "Manifestações", description: "Art. 477 CPC" },
  { type: "Manifestação sobre Documentos", days: 15, businessDays: true, category: "Manifestações", description: "Art. 437 CPC" },
  { type: "Especificação de Provas", days: 15, businessDays: true, category: "Manifestações", description: "Art. 349 CPC" },
  { type: "Impugnação ao Laudo Pericial", days: 15, businessDays: true, category: "Manifestações", description: "Art. 477 CPC" },

  // ===== CUMPRIMENTO DE SENTENÇA =====
  { type: "Cumprimento de Sentença", days: 15, businessDays: true, category: "Cumprimento de Sentença", description: "Art. 523 CPC" },
  { type: "Apresentação de Memória de Cálculo", days: 15, businessDays: true, category: "Cumprimento de Sentença", description: "Art. 524 CPC" },
  { type: "Pagamento Voluntário", days: 15, businessDays: true, category: "Cumprimento de Sentença", description: "Art. 523 CPC" },
  { type: "Indicação de Bens à Penhora", days: 5, businessDays: true, category: "Cumprimento de Sentença", description: "Art. 774 CPC" },
  { type: "Impugnação ao Cumprimento", days: 15, businessDays: true, category: "Cumprimento de Sentença", description: "Art. 525 CPC" },

  // ===== TUTELAS DE URGÊNCIA =====
  { type: "Oposição à Tutela de Urgência", days: 5, businessDays: true, category: "Tutelas", description: "Art. 300 CPC" },
  { type: "Recurso contra Tutela Antecipada", days: 15, businessDays: true, category: "Tutelas", description: "Art. 1.015 CPC" },
  { type: "Agravo de Instrumento (Tutela)", days: 15, businessDays: true, category: "Tutelas", description: "Art. 1.015 CPC" },
  { type: "Modificação de Tutela", days: 15, businessDays: true, category: "Tutelas", description: "Art. 296 CPC" },
  { type: "Revogação de Tutela", days: 15, businessDays: true, category: "Tutelas", description: "Art. 296 CPC" },

  // ===== RECURSOS TRABALHISTAS (CLT) =====
  { type: "Recurso Ordinário Trabalhista", days: 8, businessDays: true, category: "Recursos Trabalhistas", description: "Art. 895 CLT" },
  { type: "Recurso de Revista (TST)", days: 8, businessDays: true, category: "Recursos Trabalhistas", description: "Art. 896 CLT" },
  { type: "Agravo de Petição (Trabalhista)", days: 8, businessDays: true, category: "Recursos Trabalhistas", description: "Art. 897 CLT" },
  { type: "Agravo de Instrumento (Trabalhista)", days: 8, businessDays: true, category: "Recursos Trabalhistas", description: "Art. 897-A CLT" },
  { type: "Embargos de Declaração (Trabalhista)", days: 5, businessDays: true, category: "Recursos Trabalhistas", description: "Art. 897-A CLT" },
  { type: "Recurso Extraordinário (Trabalhista)", days: 8, businessDays: true, category: "Recursos Trabalhistas", description: "Art. 896 CLT" },
  { type: "Contrarrazões Trabalhistas", days: 8, businessDays: true, category: "Recursos Trabalhistas", description: "Art. 895 CLT" },

  // ===== DIREITO TRABALHISTA (PROCESSUAIS) =====
  { type: "Defesa Trabalhista", days: 5, businessDays: true, category: "Direito Trabalhista", description: "Art. 847 CLT" },
  { type: "Razões Finais Trabalhistas", days: 5, businessDays: true, category: "Direito Trabalhista", description: "Art. 850 CLT" },
  { type: "Embargos à Penhora (Trabalhista)", days: 5, businessDays: true, category: "Direito Trabalhista", description: "Art. 884 CLT" },
  { type: "Impugnação à Sentença (Trabalhista)", days: 8, businessDays: true, category: "Direito Trabalhista", description: "Art. 884 CLT" },
  { type: "Recurso Adesivo Trabalhista", days: 8, businessDays: true, category: "Direito Trabalhista", description: "Art. 895 CLT" },

  // ===== RECURSOS CRIMINAIS =====
  { type: "Apelação Criminal", days: 5, businessDays: true, category: "Recursos Criminais", description: "Art. 593 CPP" },
  { type: "Recurso em Sentido Estrito", days: 5, businessDays: true, category: "Recursos Criminais", description: "Art. 581 CPP" },
  { type: "Agravo em Execução Penal", days: 5, businessDays: true, category: "Recursos Criminais", description: "Art. 197 LEP" },
  { type: "Embargos Infringentes (Criminal)", days: 10, businessDays: true, category: "Recursos Criminais", description: "Art. 609 CPP" },
  { type: "Carta Testemunhável", days: 2, businessDays: false, category: "Recursos Criminais", description: "Art. 639 CPP - 48 horas" },
  { type: "Habeas Corpus", days: 0, businessDays: false, category: "Recursos Criminais", description: "Urgente - Sem prazo fixo" },
  { type: "Revisão Criminal", days: 0, businessDays: false, category: "Recursos Criminais", description: "Sem prazo - 5 anos após trânsito" },
  { type: "Resposta à Acusação", days: 10, businessDays: true, category: "Recursos Criminais", description: "Art. 396-A CPP" },
  { type: "Alegações Finais Criminais", days: 5, businessDays: true, category: "Recursos Criminais", description: "Art. 403 CPP" },
  { type: "Recurso de Embargos", days: 5, businessDays: true, category: "Recursos Criminais", description: "Art. 609 CPP" },
  { type: "Recurso de Agravo", days: 5, businessDays: true, category: "Recursos Criminais", description: "Art. 581 CPP" },

  // ===== DIREITO TRIBUTÁRIO =====
  { type: "Impugnação Fiscal", days: 30, businessDays: false, category: "Direito Tributário", description: "Art. 16 Dec. 70.235/72" },
  { type: "Recurso Administrativo Fiscal", days: 30, businessDays: false, category: "Direito Tributário", description: "Art. 33 Dec. 70.235/72" },
  { type: "Recurso Especial (CARF)", days: 15, businessDays: false, category: "Direito Tributário", description: "Art. 67 Dec. 70.235/72" },
  { type: "Embargos à Execução Fiscal", days: 30, businessDays: false, category: "Direito Tributário", description: "Art. 16 Lei 6.830/80" },
  { type: "Exceção de Pré-executividade", days: 30, businessDays: false, category: "Direito Tributário", description: "Prazo geral" },
  { type: "Mandado de Segurança Tributário", days: 120, businessDays: false, category: "Direito Tributário", description: "Art. 23 Lei 12.016/09" },
  { type: "Defesa em Execução Fiscal", days: 30, businessDays: false, category: "Direito Tributário", description: "Art. 16 Lei 6.830/80" },

  // ===== DIREITO DE FAMÍLIA =====
  { type: "Alimentos Provisórios", days: 5, businessDays: true, category: "Direito de Família", description: "Art. 4º Lei 5.478/68" },
  { type: "Contestação em Divórcio", days: 15, businessDays: true, category: "Direito de Família", description: "Art. 335 CPC" },
  { type: "Contestação de Alimentos", days: 5, businessDays: true, category: "Direito de Família", description: "Art. 7º Lei 5.478/68" },
  { type: "Revisão de Alimentos", days: 15, businessDays: true, category: "Direito de Família", description: "Art. 335 CPC" },
  { type: "Exoneração de Alimentos", days: 15, businessDays: true, category: "Direito de Família", description: "Art. 335 CPC" },
  { type: "Regulamentação de Visitas", days: 15, businessDays: true, category: "Direito de Família", description: "Art. 335 CPC" },
  { type: "Ação de Guarda", days: 15, businessDays: true, category: "Direito de Família", description: "Art. 335 CPC" },
  { type: "Ação de Investigação de Paternidade", days: 15, businessDays: true, category: "Direito de Família", description: "Art. 335 CPC" },

  // ===== DIREITO ELEITORAL =====
  { type: "Recurso Eleitoral", days: 3, businessDays: true, category: "Direito Eleitoral", description: "Art. 258 Código Eleitoral" },
  { type: "Recurso Especial Eleitoral", days: 3, businessDays: true, category: "Direito Eleitoral", description: "Art. 276 Código Eleitoral" },
  { type: "Impugnação de Registro de Candidatura", days: 5, businessDays: true, category: "Direito Eleitoral", description: "Art. 3º LC 64/90" },
  { type: "Representação Eleitoral", days: 10, businessDays: false, category: "Direito Eleitoral", description: "Lei 9.504/97" },
  { type: "Ação de Impugnação de Mandato Eletivo", days: 15, businessDays: true, category: "Direito Eleitoral", description: "Lei 9.504/97" },

  // ===== DIREITO PREVIDENCIÁRIO =====
  { type: "Recurso INSS (1ª Instância)", days: 30, businessDays: false, category: "Direito Previdenciário", description: "Art. 305 IN INSS" },
  { type: "Recurso CRPS", days: 30, businessDays: false, category: "Direito Previdenciário", description: "Art. 306 IN INSS" },
  { type: "Contestação INSS (Judicial)", days: 15, businessDays: true, category: "Direito Previdenciário", description: "Art. 335 CPC" },
  { type: "Recurso Administrativo Previdenciário", days: 30, businessDays: false, category: "Direito Previdenciário", description: "Art. 305 IN INSS" },
  { type: "Impugnação ao Benefício", days: 15, businessDays: true, category: "Direito Previdenciário", description: "Art. 335 CPC" },

  // ===== DIREITO DO CONSUMIDOR =====
  { type: "Resposta JEC (Consumidor)", days: 15, businessDays: true, category: "Direito do Consumidor", description: "Art. 30 Lei 9.099/95" },
  { type: "Recurso Inominado JEC", days: 10, businessDays: true, category: "Direito do Consumidor", description: "Art. 42 Lei 9.099/95" },
  { type: "Embargos de Declaração JEC", days: 5, businessDays: true, category: "Direito do Consumidor", description: "Art. 48 Lei 9.099/95" },
  { type: "Contestação CDC", days: 15, businessDays: true, category: "Direito do Consumidor", description: "Art. 335 CPC" },

  // ===== AÇÕES ESPECIAIS =====
  { type: "Mandado de Segurança", days: 120, businessDays: false, category: "Ações Especiais", description: "Art. 23 Lei 12.016/09" },
  { type: "Habeas Data", days: 120, businessDays: false, category: "Ações Especiais", description: "Art. 23 Lei 12.016/09" },
  { type: "Ação Popular", days: 0, businessDays: false, category: "Ações Especiais", description: "5 anos - prescrição" },
  { type: "Ação Civil Pública", days: 0, businessDays: false, category: "Ações Especiais", description: "5 anos - prescrição" },
  { type: "Ação de Improbidade Administrativa", days: 0, businessDays: false, category: "Ações Especiais", description: "5 anos - prescrição" },
  { type: "Mandado de Injunção", days: 120, businessDays: false, category: "Ações Especiais", description: "Art. 23 Lei 12.016/09" },

  // ===== PRECATÓRIOS =====
  { type: "Requisição de Precatório", days: 30, businessDays: false, category: "Precatórios", description: "Art. 100 CF" },
  { type: "Impugnação de Precatório", days: 30, businessDays: false, category: "Precatórios", description: "Art. 535 CPC" },
  { type: "Recurso de Precatório", days: 15, businessDays: true, category: "Precatórios", description: "Art. 1.003 CPC" },

  // ===== JUIZADOS ESPECIAIS =====
  { type: "Resposta no JEC", days: 15, businessDays: true, category: "Juizados Especiais", description: "Art. 30 Lei 9.099/95" },
  { type: "Recurso Inominado", days: 10, businessDays: true, category: "Juizados Especiais", description: "Art. 42 Lei 9.099/95" },
  { type: "Contrarrazões Recurso Inominado", days: 10, businessDays: true, category: "Juizados Especiais", description: "Art. 42 Lei 9.099/95" },
  { type: "Embargos de Declaração JEC", days: 5, businessDays: true, category: "Juizados Especiais", description: "Art. 48 Lei 9.099/95" },

  // ===== PRAZOS ADMINISTRATIVOS =====
  { type: "Recurso Administrativo", days: 10, businessDays: true, category: "Administrativo", description: "Art. 59 Lei 9.784/99" },
  { type: "Pedido de Reconsideração", days: 10, businessDays: true, category: "Administrativo", description: "Art. 56 Lei 9.784/99" },
  { type: "Revisão Administrativa", days: 10, businessDays: true, category: "Administrativo", description: "Art. 65 Lei 9.784/99" },
  { type: "Recurso Hierárquico", days: 10, businessDays: true, category: "Administrativo", description: "Art. 59 Lei 9.784/99" },

  // ===== DIREITO AMBIENTAL =====
  { type: "Ação Civil Pública Ambiental", days: 0, businessDays: false, category: "Direito Ambiental", description: "5 anos - prescrição" },
  { type: "Mandado de Segurança Ambiental", days: 120, businessDays: false, category: "Direito Ambiental", description: "Art. 23 Lei 12.016/09" },

  // ===== DIREITO ADMINISTRATIVO =====
  { type: "Ação de Desapropriação", days: 15, businessDays: true, category: "Direito Administrativo", description: "Art. 335 CPC" },
  { type: "Ação de Anulação de Ato Administrativo", days: 0, businessDays: false, category: "Direito Administrativo", description: "5 anos - prescrição" },
  { type: "Ação de Obrigação de Fazer", days: 15, businessDays: true, category: "Direito Administrativo", description: "Art. 335 CPC" },

  // ===== DIREITO EMPRESARIAL =====
  { type: "Ação de Recuperação Judicial", days: 15, businessDays: true, category: "Direito Empresarial", description: "Art. 335 CPC" },
  { type: "Ação de Falência", days: 15, businessDays: true, category: "Direito Empresarial", description: "Art. 335 CPC" },
  { type: "Ação de Dissolução de Sociedade", days: 15, businessDays: true, category: "Direito Empresarial", description: "Art. 335 CPC" },
  { type: "Ação de Exclusão de Sócio", days: 15, businessDays: true, category: "Direito Empresarial", description: "Art. 335 CPC" },

  // ===== DIREITO IMOBILIÁRIO =====
  { type: "Ação de Despejo", days: 15, businessDays: true, category: "Direito Imobiliário", description: "Art. 335 CPC" },
  { type: "Ação de Usucapião", days: 15, businessDays: true, category: "Direito Imobiliário", description: "Art. 335 CPC" },
  { type: "Ação de Reintegração de Posse", days: 15, businessDays: true, category: "Direito Imobiliário", description: "Art. 335 CPC" },
  { type: "Ação de Manutenção de Posse", days: 15, businessDays: true, category: "Direito Imobiliário", description: "Art. 335 CPC" },
  { type: "Ação de Consignação em Pagamento", days: 15, businessDays: true, category: "Direito Imobiliário", description: "Art. 335 CPC" },

  // ===== DIREITO BANCÁRIO =====
  { type: "Ação de Revisão de Contrato Bancário", days: 15, businessDays: true, category: "Direito Bancário", description: "Art. 335 CPC" },
  { type: "Ação de Cobrança Bancária", days: 15, businessDays: true, category: "Direito Bancário", description: "Art. 335 CPC" },
  { type: "Defesa em Execução Bancária", days: 15, businessDays: true, category: "Direito Bancário", description: "Art. 914 CPC" },

  // ===== DIREITO DO TRABALHO (ADICIONAIS) =====
  { type: "Ação Trabalhista", days: 5, businessDays: true, category: "Direito Trabalhista", description: "Art. 847 CLT" },
  { type: "Ação de Consignação em Pagamento Trabalhista", days: 5, businessDays: true, category: "Direito Trabalhista", description: "Art. 847 CLT" },
  { type: "Ação de Revisão de Contrato de Trabalho", days: 5, businessDays: true, category: "Direito Trabalhista", description: "Art. 847 CLT" },

  // ===== DIREITO CIVIL (ADICIONAIS) =====
  { type: "Ação de Cobrança", days: 15, businessDays: true, category: "Direito Civil", description: "Art. 335 CPC" },
  { type: "Ação de Indenização", days: 15, businessDays: true, category: "Direito Civil", description: "Art. 335 CPC" },
  { type: "Ação de Rescisão Contratual", days: 15, businessDays: true, category: "Direito Civil", description: "Art. 335 CPC" },
  { type: "Ação de Resolução Contratual", days: 15, businessDays: true, category: "Direito Civil", description: "Art. 335 CPC" },
  { type: "Ação de Nulidade", days: 15, businessDays: true, category: "Direito Civil", description: "Art. 335 CPC" },
  { type: "Ação de Anulação", days: 15, businessDays: true, category: "Direito Civil", description: "Art. 335 CPC" },
  { type: "Ação de Rescisória", days: 730, businessDays: false, category: "Direito Civil", description: "Art. 975 CPC - 2 anos" },
  { type: "Ação de Consignação em Pagamento", days: 15, businessDays: true, category: "Direito Civil", description: "Art. 335 CPC" },
  { type: "Ação de Prestação de Contas", days: 15, businessDays: true, category: "Direito Civil", description: "Art. 335 CPC" },
  { type: "Ação de Prestação de Serviços", days: 15, businessDays: true, category: "Direito Civil", description: "Art. 335 CPC" },

  // ===== DIREITO PENAL (ADICIONAIS) =====
  { type: "Ação Penal Pública", days: 0, businessDays: false, category: "Direito Penal", description: "Sem prazo - prescrição" },
  { type: "Ação Penal Privada", days: 0, businessDays: false, category: "Direito Penal", description: "6 meses - prescrição" },
  { type: "Queixa-Crime", days: 6, businessDays: false, category: "Direito Penal", description: "Art. 38 CPP - 6 meses" },
  { type: "Recurso de Habeas Corpus", days: 5, businessDays: true, category: "Direito Penal", description: "Art. 581 CPP" },

  // ===== DIREITO CONSTITUCIONAL =====
  { type: "Ação Direta de Inconstitucionalidade", days: 0, businessDays: false, category: "Direito Constitucional", description: "Sem prazo decadencial" },
  { type: "Ação Declaratória de Constitucionalidade", days: 0, businessDays: false, category: "Direito Constitucional", description: "Sem prazo decadencial" },
  { type: "Arguição de Descumprimento de Preceito Fundamental", days: 0, businessDays: false, category: "Direito Constitucional", description: "Sem prazo decadencial" },

  // ===== DIREITO PROCESSUAL (ADICIONAIS) =====
  { type: "Ação de Exibição de Documentos", days: 15, businessDays: true, category: "Direito Processual", description: "Art. 335 CPC" },
  { type: "Ação de Produção Antecipada de Provas", days: 15, businessDays: true, category: "Direito Processual", description: "Art. 335 CPC" },
  { type: "Ação de Antecipação de Tutela", days: 15, businessDays: true, category: "Direito Processual", description: "Art. 300 CPC" },
  { type: "Ação de Incidente de Falsidade", days: 15, businessDays: true, category: "Direito Processual", description: "Art. 335 CPC" },
  { type: "Ação de Incidente de Uniformização", days: 15, businessDays: true, category: "Direito Processual", description: "Art. 1.036 CPC" },
]

// Função para calcular prazo
export function calculateDeadline(startDate: Date, days: number, businessDays: boolean): Date {
  const result = new Date(startDate)
  
  if (!businessDays) {
    result.setDate(result.getDate() + days)
    return result
  }

  // Para dias úteis, pular fins de semana
  let addedDays = 0
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

// Função para calcular data de lembrete (5 dias antes por padrão)
export function calculateReminderDate(deadlineDate: Date, daysBefore: number = 5): Date {
  const reminder = new Date(deadlineDate)
  reminder.setDate(reminder.getDate() - daysBefore)
  return reminder
}
