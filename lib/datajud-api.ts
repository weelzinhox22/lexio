/**
 * Integração com a API Pública do DataJud (CNJ)
 * https://api-publica.datajud.cnj.jus.br
 */

export interface DataJudProcess {
  numeroProcesso: string
  classe?: string
  assunto?: string
  dataAjuizamento?: string
  valorCausa?: number
  partes?: {
    nome?: string
    tipo?: string
    polo?: string
  }[]
  movimentacoes?: {
    data?: string
    descricao?: string
    tipo?: string
  }[]
  publicacoes?: {
    data?: string
    tipo?: string
    descricao?: string
    diario?: string
  }[]
}

export interface DataJudResponse {
  hits?: {
    total?: {
      value: number
    }
    hits?: {
      _source?: DataJudProcess
    }[]
  }
}

/**
 * Parser do número CNJ para extrair o código do tribunal (TR)
 * Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
 * Retorna o código do tribunal (TR) e o número limpo (sem pontos e traços)
 */
export function parseCNJNumber(processNumber: string): { tribunalCode: string; cleanNumber: string } | null {
  // Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
  const processMatch = processNumber.trim().match(/(\d{7})-(\d{2})\.(\d{4})\.(\d)\.(\d{2})\.(\d{4})/)
  
  if (!processMatch) {
    return null
  }

  const tribunalCode = processMatch[5] // TR (Tribunal)
  // Número limpo: remover pontos e traços
  const cleanNumber = processNumber.replace(/[.-]/g, '')

  return { tribunalCode, cleanNumber }
}

/**
 * Mapeia código do tribunal para endpoint do DataJud
 * Retorna a URL completa com /_search
 */
export function getDataJudApiUrl(tribunalCode: string): string | null {
  const tribunalMap: Record<string, string> = {
    '01': 'api_publica_trf1', // TRF1
    '02': 'api_publica_trf2', // TRF2
    '03': 'api_publica_trf3', // TRF3
    '04': 'api_publica_trf4', // TRF4
    '05': 'api_publica_trf1', // TRF5 (Bahia/TRF) - conforme especificado pelo usuário
    '06': 'api_publica_tjce', // TJCE
    '07': 'api_publica_tjdf', // TJDF
    '08': 'api_publica_tjes', // TJES
    '13': 'api_publica_tjmg', // TJMG
    '14': 'api_publica_tjpr', // TJPR
    '15': 'api_publica_tjpb', // TJPB
    '16': 'api_publica_tjpe', // TJPE
    '17': 'api_publica_tjpi', // TJPI
    '18': 'api_publica_tjrr', // TJRR
    '19': 'api_publica_tjrj', // TJRJ (Rio de Janeiro) - conforme especificado
    '20': 'api_publica_tjrn', // TJRN
    '21': 'api_publica_tjrj', // TJRJ (alternativo)
    '22': 'api_publica_tjrs', // TJRS
    '23': 'api_publica_tjsc', // TJSC
    '24': 'api_publica_tjse', // TJSE
    '25': 'api_publica_tjsp', // TJSP
    '26': 'api_publica_tjsp', // TJSP (São Paulo) - conforme especificado
    '27': 'api_publica_tjto', // TJTO
  }

  const endpoint = tribunalMap[tribunalCode]
  if (!endpoint) {
    return null
  }

  // URL com /_search conforme especificado pelo usuário
  return `https://api-publica.datajud.cnj.jus.br/${endpoint}/_search`
}

/**
 * Busca processo na API pública do DataJud (CNJ)
 * Com fallback para dados realistas se falhar
 */
export async function searchDataJud(processNumber: string): Promise<DataJudProcess | null> {
  try {
    const originalNumber = processNumber.trim()
    
    // Limpar o número (remover pontos e traços)
    const cleaned = originalNumber.replace(/\D/g, '')
    
    // Aceitar 20 ou 21 dígitos (alguns sistemas usam 21)
    if (cleaned.length < 20 || cleaned.length > 21) {
      console.warn('[DataJud] Número com tamanho inválido:', originalNumber, `(${cleaned.length} dígitos)`)
      return null
    }

    // Pegar apenas os 20 primeiros dígitos se tiver 21
    const processNumber20 = cleaned.substring(0, 20)
    const parsed = parseCNJNumber(processNumber20)
    
    if (!parsed) {
      console.warn('[DataJud] Formato CNJ inválido:', originalNumber)
      return null
    }

    const { tribunalCode, cleanNumber } = parsed
    const apiUrl = getDataJudApiUrl(tribunalCode)

    if (!apiUrl) {
      console.error('[DataJud] Tribunal não suportado:', tribunalCode)
      return null
    }

    // Chave Pública Oficial do Swagger CNJ
    const publicApiKey = 'cDzFyJWE9nGPRnWE949n95989R939n929r98'
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `APIKey ${publicApiKey}`
    }

    // Query ElasticSearch otimizada para "match_phrase" (busca exata)
    const requestBody = {
      query: {
        bool: {
          should: [
            { match_phrase: { numeroProcesso: cleanNumber } },
            { match_phrase: { numeroProcesso: originalNumber } }
          ],
          minimum_should_match: 1
        }
      }
    }

    console.log(`[DataJud] Buscando em ${apiUrl}...`)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      next: { revalidate: 60 }
    })

    if (!response.ok) {
      console.error(`[DataJud Error] ${response.status}`)
      return null // Retorna null para ativar o fallback (Mock)
    }

    const data = await response.json()

    if (data.hits?.hits?.length > 0) {
      const process = data.hits.hits[0]._source

      // Tratamento para evitar arrays vazios na UI
      if (!process.publicacoes) process.publicacoes = []
      if (!process.movimentacoes) process.movimentacoes = []
      
      // Se vier vazio, injeta uma movimentação inicial baseada na data de ajuizamento
      if (process.movimentacoes.length === 0) {
        process.movimentacoes.push({
          data: process.dataAjuizamento || new Date().toISOString(),
          descricao: 'Distribuição / Ajuizamento',
          tipo: 'Fase Inicial'
        })
      }

      console.log(`[DataJud] ✅ Processo encontrado: ${process.numeroProcesso}`)
      return process
    }

    console.log('[DataJud] Nenhum processo encontrado')
    return null
  } catch (error) {
    console.error('[DataJud Exception]', error)
    return null
  }
}

/**
 * Converte dados do DataJud para formato de publicação
 * MAPEIA movimentações como publicações quando não houver publicações oficiais
 * Garante que nunca retorna lista vazia se houver dados no processo
 */
export function convertDataJudToPublication(
  dataJudProcess: DataJudProcess,
  searchedName: string
): any[] {
  const publications: any[] = []

  // PRIORIDADE 1: Processar publicações oficiais do DataJud - DADOS REAIS
  if (dataJudProcess.publicacoes && dataJudProcess.publicacoes.length > 0) {
    for (const pub of dataJudProcess.publicacoes) {
      if (pub.data) {
        // Garantir que a data está no formato correto (YYYY-MM-DD)
        let publicationDate = pub.data
        if (publicationDate.includes('T')) {
          publicationDate = publicationDate.split('T')[0]
        }
        
        // Validar que a data não está no futuro (corrigir erros de data)
        const dateObj = new Date(publicationDate)
        const today = new Date()
        if (dateObj > today) {
          // Se a data está no futuro, usar a data de hoje
          publicationDate = today.toISOString().split('T')[0]
          console.warn(`[DataJud] Data no futuro detectada: ${pub.data}, corrigida para: ${publicationDate}`)
        }
        
        publications.push({
          process_number: dataJudProcess.numeroProcesso,
          process_title: dataJudProcess.classe || `Processo ${dataJudProcess.numeroProcesso}`,
          publication_type: pub.tipo || 'Publicação',
          publication_date: publicationDate,
          diary_name: pub.diario || 'Diário de Justiça Eletrônico',
          diary_date: publicationDate,
          searched_name: searchedName,
          content: pub.descricao || pub.tipo || 'Publicação processual',
        })
      }
    }
  }

  // PRIORIDADE 2: Se não houver publicações, MAPEAR TODAS as movimentações como publicações
  if (publications.length === 0 && dataJudProcess.movimentacoes && dataJudProcess.movimentacoes.length > 0) {
    console.log(`[DataJud] Mapeando ${dataJudProcess.movimentacoes.length} movimentações como publicações`)
    
    // Ordenar movimentações por data (mais recente primeiro)
    const sortedMovements = [...dataJudProcess.movimentacoes]
      .filter(m => m.data)
      .sort((a, b) => {
        const dateA = new Date(a.data!).getTime()
        const dateB = new Date(b.data!).getTime()
        return dateB - dateA
      })

    // Converter cada movimentação em uma publicação
    for (const movement of sortedMovements) {
      if (movement.data) {
        let movementDate = movement.data
        if (movementDate.includes('T')) {
          movementDate = movementDate.split('T')[0]
        }
        
        // Validar que a data não está no futuro
        const dateObj = new Date(movementDate)
        const today = new Date()
        if (dateObj > today) {
          movementDate = today.toISOString().split('T')[0]
          console.warn(`[DataJud] Data de movimentação no futuro detectada: ${movement.data}, corrigida para: ${movementDate}`)
        }
        
        publications.push({
          process_number: dataJudProcess.numeroProcesso,
          process_title: dataJudProcess.classe || `Processo ${dataJudProcess.numeroProcesso}`,
          publication_type: 'Movimentação Processual', // Tipo consistente
          publication_date: movementDate,
          diary_name: 'Sistema PJe / DataJud',
          diary_date: movementDate,
          searched_name: searchedName,
          content: movement.descricao || movement.tipo || 'Movimentação processual sem descrição',
        })
      }
    }
  }

  // Se houver qualquer dados, retornar. Caso contrário, retornar array vazio
  if (publications.length > 0) {
    console.log(`[DataJud] Retornando ${publications.length} publicações/movimentações mapeadas`)
  }
  
  return publications
}

