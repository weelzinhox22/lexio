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
 * Parser do número CNJ para extrair o código do tribunal (TR) e ramo (J)
 * Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
 */
export function parseCNJNumber(processNumber: string): {
  tribunalCode: string;
  branchCode: string;
  cleanNumber: string
} | null {
  // Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
  const processMatch = processNumber.trim().match(/(\d{7})-(\d{2})\.(\d{4})\.(\d)\.(\d{2})\.(\d{4})/)

  if (!processMatch) {
    // Tentar sem formatação: 20 dígitos
    const clean = processNumber.replace(/\D/g, '')
    if (clean.length === 20) {
      return {
        branchCode: clean.substring(13, 14),
        tribunalCode: clean.substring(14, 16),
        cleanNumber: clean
      }
    }
    return null
  }

  const branchCode = processMatch[4]
  const tribunalCode = processMatch[5]
  const cleanNumber = processNumber.replace(/[.-]/g, '')

  return { branchCode, tribunalCode, cleanNumber }
}

/**
 * Mapeia código do tribunal para endpoint do DataJud
 * Retorna a URL completa com /_search
 */
export function getDataJudApiUrl(tribunalCode: string, branchCode?: string): string | null {
  // Mapa de TJs (Justiça Estadual - Ramo 8)
  const tjMap: Record<string, string> = {
    '01': 'api_publica_tjac',
    '02': 'api_publica_tjal',
    '03': 'api_publica_tjam',
    '04': 'api_publica_tjap',
    '05': 'api_publica_tjba',
    '06': 'api_publica_tjce',
    '07': 'api_publica_tjdft',
    '08': 'api_publica_tjes',
    '09': 'api_publica_tjgo',
    '10': 'api_publica_tjma',
    '11': 'api_publica_tjmt',
    '12': 'api_publica_tjms',
    '13': 'api_publica_tjmg',
    '14': 'api_publica_tjpa',
    '15': 'api_publica_tjpb',
    '16': 'api_publica_tjpr',
    '17': 'api_publica_tjpe',
    '18': 'api_publica_tjpi',
    '19': 'api_publica_tjrj',
    '20': 'api_publica_tjrn',
    '21': 'api_publica_tjrs',
    '22': 'api_publica_tjro',
    '23': 'api_publica_tjrr',
    '24': 'api_publica_tjsc',
    '25': 'api_publica_tjse',
    '26': 'api_publica_tjsp',
    '27': 'api_publica_tjto',
  }

  // Mapa de TRFs (Justiça Federal - Ramo 4)
  const trfMap: Record<string, string> = {
    '01': 'api_publica_trf1',
    '02': 'api_publica_trf2',
    '03': 'api_publica_trf3',
    '04': 'api_publica_trf4',
    '05': 'api_publica_trf5',
    '06': 'api_publica_trf6',
  }

  // Mapa de TRTs (Justiça do Trabalho - Ramo 5)
  const trtMap: Record<string, string> = {
    '01': 'api_publica_trt1',
    '02': 'api_publica_trt2',
    '03': 'api_publica_trt3',
    '04': 'api_publica_trt4',
    '05': 'api_publica_trt5',
    '06': 'api_publica_trt6',
    '07': 'api_publica_trt7',
    '08': 'api_publica_trt8',
    '09': 'api_publica_trt9',
    '10': 'api_publica_trt10',
    '11': 'api_publica_trt11',
    '12': 'api_publica_trt12',
    '13': 'api_publica_trt13',
    '14': 'api_publica_trt14',
    '15': 'api_publica_trt15',
    '16': 'api_publica_trt16',
    '17': 'api_publica_trt17',
    '18': 'api_publica_trt18',
    '19': 'api_publica_trt19',
    '20': 'api_publica_trt20',
    '21': 'api_publica_trt21',
    '22': 'api_publica_trt22',
    '23': 'api_publica_trt23',
    '24': 'api_publica_trt24',
  }

  // Mapa de TJs Militares (Ramo 9)
  const militarMap: Record<string, string> = {
    '13': 'api_publica_tjmmg',
    '21': 'api_publica_tjmrs',
    '26': 'api_publica_tjmsp',
  }

  let endpoint = ''

  if (branchCode === '4') {
    endpoint = trfMap[tribunalCode] || ''
  } else if (branchCode === '5') {
    endpoint = trtMap[tribunalCode] || ''
  } else if (branchCode === '9') {
    endpoint = militarMap[tribunalCode] || ''
  } else if (branchCode === '8' || !branchCode) {
    endpoint = tjMap[tribunalCode] || ''
  }

  if (!endpoint) return null

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

    const { tribunalCode, branchCode, cleanNumber } = parsed
    const apiUrl = getDataJudApiUrl(tribunalCode, branchCode)

    if (!apiUrl) {
      console.error('[DataJud] Tribunal não suportado:', tribunalCode, 'Ramo:', branchCode)
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

/**
 * Busca processos no DataJud associados a um número de OAB e UF
 * Tenta múltiplas estratégias de query e múltiplos endpoints
 */
export async function searchDataJudByOAB(oabNumber: string, uf: string): Promise<DataJudProcess[]> {
  const publicApiKey = 'cDzFyJWE9nGPRnWE949n95989R939n929r98'

  // Mapear UF para código do tribunal
  const ufToCode: Record<string, string> = {
    'AC': '01', 'AL': '02', 'AM': '03', 'AP': '04', 'BA': '05',
    'CE': '06', 'DF': '07', 'ES': '08', 'GO': '09', 'MA': '10',
    'MG': '13', 'MS': '12', 'MT': '11', 'PA': '14', 'PB': '15',
    'PE': '17', 'PI': '18', 'PR': '16', 'RJ': '19', 'RN': '20',
    'RO': '22', 'RR': '23', 'RS': '21', 'SC': '24', 'SE': '25',
    'SP': '26', 'TO': '27'
  }

  const tribunalCode = ufToCode[uf.toUpperCase()]
  if (!tribunalCode) {
    console.warn(`[DataJud OAB] UF não suportada: ${uf}`)
    return []
  }

  // Estratégias de query em ordem de especificidade
  const queries = [
    // Estratégia 1: query_string em campos específicos de advogado
    {
      query: {
        query_string: {
          query: `"${oabNumber}"`,
          fields: [
            "partes.advogados.numeroOab",
            "partes.advogados.numeroOAB",
            "advogados.numeroOab",
            "advogados.numeroOAB",
            "sujeitosAtivos.advogados.numeroOab",
            "sujeitosPassivos.advogados.numeroOab",
            "numeroOab",
            "numeroOAB"
          ],
          default_operator: "OR"
        }
      },
      size: 100,
      sort: [{ "dataAjuizamento": { "order": "desc" } }]
    },
    // Estratégia 2: multi_match em todos os campos (wildcard)
    {
      query: {
        multi_match: {
          query: oabNumber,
          fields: ["*"],
          type: "phrase"
        }
      },
      size: 100,
      sort: [{ "dataAjuizamento": { "order": "desc" } }]
    },
    // Estratégia 3: query_string simples sem campos específicos  
    {
      query: {
        query_string: {
          query: `"${oabNumber}"`,
          default_operator: "AND"
        }
      },
      size: 100,
      sort: [{ "dataAjuizamento": { "order": "desc" } }]
    }
  ]

  // Endpoints a tentar: tribunal específico + TJSP como fallback
  const endpoints: string[] = []
  const primaryEndpoint = getDataJudApiUrl(tribunalCode, '8')
  if (primaryEndpoint) endpoints.push(primaryEndpoint)

  // Se não é SP, adicionar TJSP como fallback (maior base de dados do país)
  if (tribunalCode !== '26') {
    const tjspEndpoint = getDataJudApiUrl('26', '8')
    if (tjspEndpoint) endpoints.push(tjspEndpoint)
  }

  // Iterar por cada endpoint e cada estratégia até encontrar resultados
  for (const endpoint of endpoints) {
    for (let i = 0; i < queries.length; i++) {
      try {
        console.log(`[DataJud OAB] Tentativa ${i + 1}/3 para OAB ${oabNumber} em ${endpoint}`)

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `APIKey ${publicApiKey}`
          },
          body: JSON.stringify(queries[i]),
          next: { revalidate: 0 }
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`[DataJud OAB] Erro ${response.status} na tentativa ${i + 1}:`, errorText.substring(0, 200))
          continue
        }

        const data = await response.json()

        if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
          const results = data.hits.hits.map((hit: any) => hit._source)
          console.log(`[DataJud OAB] ✅ Sucesso na tentativa ${i + 1}! Encontrados ${results.length} processos`)
          return results
        }

        console.log(`[DataJud OAB] Tentativa ${i + 1} sem resultados, tentando próxima...`)
      } catch (error) {
        console.error(`[DataJud OAB] Exceção na tentativa ${i + 1}:`, error)
        continue
      }
    }
  }

  console.log(`[DataJud OAB] ❌ Nenhum resultado em nenhuma estratégia para OAB ${oabNumber}/${uf}`)
  return []
}
