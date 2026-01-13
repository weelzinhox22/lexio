/**
 * Serviço de integração com Groq API
 * 
 * IMPORTANTE: Este serviço é usado APENAS para:
 * - Gerar templates-base (admin/system)
 * - Popular o sistema inicialmente (bootstrap)
 * 
 * NÃO deve ser usado no fluxo normal do usuário final.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'llama-3.3-70b-versatile' // Modelo padrão (alta qualidade)

export interface GenerateTemplateParams {
  type: string // Tipo de documento (ex: 'peticao_inicial', 'contrato', 'procuracao')
  category: string // Categoria jurídica (ex: 'direito_consumidor', 'direito_familia')
  context?: string // Contexto adicional opcional
  subcategory?: string // Subcategoria (ex: 'danos_morais', 'divorcio_consensual')
}

export interface GeneratedTemplate {
  content: string // Conteúdo do template com placeholders {{NOME_VARIAVEL}}
  placeholders: string[] // Lista de variáveis identificadas
  name?: string // Nome sugerido para o template
  description?: string // Descrição sugerida
}

/**
 * Extrai placeholders do conteúdo do template
 * Formato esperado: {{NOME_VARIAVEL}}
 */
function extractPlaceholders(content: string): string[] {
  const regex = /{{([A-Z_]+)}}/g
  const matches = Array.from(content.matchAll(regex))
  const placeholders = matches.map((match) => match[1])
  const uniquePlaceholders = [...new Set(placeholders)]
  return uniquePlaceholders.filter((p) => p !== 'DATA_ATUAL') // Excluir DATA_ATUAL (gerado automaticamente)
}

/**
 * Gera prompt para o Groq criar um template jurídico
 */
function buildPrompt(params: GenerateTemplateParams): string {
  const { type, category, context, subcategory } = params

  const categoryLabels: Record<string, string> = {
    kit_basico: 'Kit Básico',
    direito_consumidor: 'Direito do Consumidor',
    direito_familia: 'Direito de Família',
    direito_trabalhista: 'Direito Trabalhista',
    direito_civil: 'Direito Cível',
    direito_penal: 'Direito Penal',
  }

  const typeLabels: Record<string, string> = {
    peticao_inicial: 'Petição Inicial',
    contestacao: 'Contestação',
    recurso: 'Recurso',
    contrato: 'Contrato',
    procuracao: 'Procuração',
  }

  const categoryLabel = categoryLabels[category] || category
  const typeLabel = typeLabels[type] || type

  const prompt = `
  ATUE COMO UM JURISTA E ADVOGADO SÊNIOR DE ELITE.
  Sua escrita deve ser indistinguível de um peticionamento de alta complexidade feito por grandes bancas de advocacia.
  
  OBJETIVO: Gerar um TEMPLATE DE PEÇA PROCESSUAL extremamente formal, erudito, denso e persuasivo.
  
  DADOS DE ENTRADA:
  - TIPO: ${typeLabel}
  - ÁREA: ${categoryLabel}
  - SUBCATEGORIA: ${subcategory || 'Geral'}
  - CONTEXTO: ${context}
  
  ====================================================
  DIRETRIZES DE ESTILO (CRUCIAIS)
  ====================================================
  
  1. VOCABULÁRIO: Use vernáculo jurídico culto (ex: "diapasão", "incontornável", "imperioso", "fustigado", "recrudescimento", "mister se faz").
  2. ESTRUTURA DOS PARÁGRAFOS: Use o método "Tópico Frasal + Premissa Maior + Premissa Menor + Conclusão". Os parágrafos devem ser longos e bem conectados.
  3. TÍTULOS DO DIREITO: NÃO use títulos simples como "Do Dano Moral". USE TÍTULOS ASSERTIVOS (Speaking Headers), ex: "A necessidade imperiosa da reparação civil como medida pedagógica".
  4. DRAMATICIDADE NOS FATOS: A narrativa dos fatos não deve ser fria. Deve demonstrar a boa-fé do cliente e a conduta reprovável da outra parte (usando adjetivos técnicos).
  5. FUNDAMENTAÇÃO: Cite princípios constitucionais, LINDB e a lógica do sistema jurídico, não apenas artigos soltos.
  
  ====================================================
  REGRAS DE FORMATAÇÃO (TEMPLATE)
  ====================================================
  - Use APENAS placeholders em CAIXA ALTA: {{NOME_VARIAVEL}}
  - NÃO use Markdown (*, #).
  - NÃO invente jurisprudência específica.
  - NÃO invente números de artigos (use {{ARTIGO_LEI}} ou {{DISPOSITIVO_LEGAL}}).
  - Texto pronto para copiar e colar em DOCX.
  
  ====================================================
  ESTRUTURA OBRIGATÓRIA DA PEÇA
  ====================================================
  
  1. CABEÇALHO
     - Excelentíssimo(a) Senhor(a) Doutor(a) Juiz(a)... (Adequar à competência da área ${categoryLabel})
  
  2. PREÂMBULO
     - Qualificação exaustiva das partes (Autor e Réu) com todos os placeholders de praxe.
  
  3. DOS FATOS (Narrativa Persuasiva)
     - Comece estabelecendo a relação jurídica original (a expectativa de direito).
     - Descreva o "ponto de ruptura" (o ilícito ou conflito).
     - Detalhe as consequências nefastas para o cliente.
     - Enfatize a tentativa de resolução amigável frustrada.
     - *Nota: Use o ${context} para dar a "cor" da narrativa, mas mantenha genérico para template.*
  
  4. DO DIREITO (Argumentação Robusta)
     - Crie 3 a 4 tópicos jurídicos distintos.
     - Cada tópico deve ter um TÍTULO QUE É UMA FRASE COMPLETA E AFIRMATIVA.
     - Argumente sobre a validade das provas, a distribuição do ônus probatório e a legislação aplicável.
     - Use conectivos cultos: "Nesse sentido", "Por outro lado", "Ademais", "Sob essa ótica".
     - Invoque princípios gerais (Boa-fé, Contraditório, Dignidade da Pessoa Humana).
  
  5. DOS PEDIDOS
     - Lista enumerada, formal e exaustiva.
     - Inclua pedidos processuais (citação, provas, gratuidade se couber) e materiais (condenação, obrigação de fazer).
  
  6. FINALIZAÇÃO
     - Valor da Causa (se aplicável à área).
     - Nestes termos, pede deferimento.
     - Local, Data e Assinatura (Placeholders).
  
  ====================================================
  GERE AGORA O DOCUMENTO COMPLETO, SEGUINDO O TOM ERUDITO DO EXEMPLO FORNECIDO:
  `
  

  return prompt
}

/**
 * Gera um template de documento jurídico usando Groq
 */
export async function generateDocumentTemplate(
  params: GenerateTemplateParams,
  options?: { model?: string }
): Promise<GeneratedTemplate> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('GROQ_API_KEY não configurada. Configure no .env.local')
  }

  const model = options?.model || DEFAULT_MODEL
  const prompt = buildPrompt(params)

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7, // Balance entre criatividade e consistência
        max_tokens: 4096, // Suficiente para templates jurídicos
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Groq API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      )
    }

    const data = await response.json()

    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Resposta da Groq API não contém conteúdo')
    }

    // Extrair placeholders do conteúdo gerado
    const placeholders = extractPlaceholders(content)

    // Tentar extrair nome e descrição do conteúdo (se o modelo retornar)
    // Por padrão, vamos deixar isso para o admin definir

    return {
      content: content.trim(),
      placeholders,
    }
  } catch (error) {
    console.error('[Groq Service] Erro ao gerar template:', error)
    throw error
  }
}

/**
 * Utilitário para extrair placeholders de qualquer conteúdo
 * (pode ser usado para validar templates existentes)
 */
export function extractPlaceholdersFromContent(content: string): string[] {
  return extractPlaceholders(content)
}

