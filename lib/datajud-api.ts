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
    advogados?: {
      nome?: string
      numeroOAB?: string
      numeroOab?: string
      nmAdvogado?: string
    }[]
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

/**
 * Faz o parse de um número CNJ para extrair tribunal e ramo (Justiça)
 */
export function parseCNJNumber(cnj: string) {
  const cleanNumber = cnj.replace(/\D/g, '')
  if (cleanNumber.length !== 20) return null

  // Estrutura CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
  // J (posição 13) = Ramo da justiça (8=Estadual, 4=Federal, 5=Trabalho, etc)
  // TR (posições 14,15) = Tribunal
  const branchCode = cleanNumber.substring(13, 14)
  const tribunalCode = cleanNumber.substring(14, 16)

  return { tribunalCode, branchCode, cleanNumber }
}

/**
 * Retorna a URL base do tribunal no DataJud
 */
export function getDataJudApiUrl(tribunalCode: string, ramo: string = '8'): string | null {
  // Mapeamento de ramais: 8 = Estadual, 4 = Federal, 5 = Trabalho
  const prefixMap: Record<string, string> = {
    '8': 'api_publica_tj',
    '4': 'api_publica_trf',
    '5': 'api_publica_trt'
  }

  const prefix = prefixMap[ramo]
  if (!prefix) return null

  // Casos especiais
  if (ramo === '8') {
    if (tribunalCode === '26') return 'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search'
    if (tribunalCode === '19') return 'https://api-publica.datajud.cnj.jus.br/api_publica_tjrj/_search'
  }

  const tribunal = tribunalCode.padStart(2, '0')
  let suffix = ''

  if (ramo === '8') {
    const states: Record<string, string> = {
      '01': 'tjac', '02': 'tjal', '03': 'tjam', '04': 'tjap', '05': 'tjba',
      '06': 'tjce', '07': 'tjdf', '08': 'tjes', '09': 'tjgo', '10': 'tjma',
      '11': 'tjmt', '12': 'tjms', '13': 'tjmg', '14': 'tjpa', '15': 'tjpb',
      '16': 'tjpr', '17': 'tjpe', '18': 'tjpi', '19': 'tjrj', '20': 'tjrn',
      '21': 'tjrs', '22': 'tjro', '23': 'tjrr', '24': 'tjsc', '25': 'tjse',
      '26': 'tjsp', '27': 'tjto'
    }
    suffix = states[tribunal] || `tj${tribunal}`
  } else if (ramo === '4') {
    suffix = `trf${tribunalCode.replace(/^0+/, '')}`
  } else if (ramo === '5') {
    suffix = `trt${tribunalCode.replace(/^0+/, '')}`
  }

  return `https://api-publica.datajud.cnj.jus.br/api_publica_${suffix}/_search`
}

/**
 * Busca processos no DataJud associados a um número de OAB e UF
 * Tenta múltiplas estratégias de query e múltiplos endpoints
 */
export async function searchDataJudByOAB(oabNumber: string, uf: string): Promise<{ processes: DataJudProcess[], lawyerName?: string }> {
  const apiKey = process.env.DATAJUD_API_KEY || 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='

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
    return { processes: [] }
  }

  const cleanOab = oabNumber.replace(/\D/g, '')
  const paddedOab = cleanOab.padStart(6, '0') // Muitos tribunais usam 6 dígitos com zeros à esquerda
  const oabWithUf = `${cleanOab}${uf.toUpperCase()}`
  const paddedOabWithUf = `${paddedOab}${uf.toUpperCase()}`
  const oabWithSlashUf = `${cleanOab}/${uf.toUpperCase()}`

  // Estratégias de query
  const queries = [
    {
      query: {
        bool: {
          should: [
            { query_string: { query: `"${cleanOab}"`, fields: ["partes.advogados.numeroOAB", "partes.advogados.numeroOab", "advogados.numeroOAB", "numeroOAB"] } },
            { query_string: { query: `"${paddedOab}"`, fields: ["partes.advogados.numeroOAB", "partes.advogados.numeroOab", "advogados.numeroOAB", "numeroOAB"] } },
            { query_string: { query: `"${oabWithUf}"`, fields: ["partes.advogados.numeroOAB", "partes.advogados.numeroOab", "advogados.numeroOAB", "numeroOAB"] } },
            { query_string: { query: `"${paddedOabWithUf}"`, fields: ["partes.advogados.numeroOAB", "partes.advogados.numeroOab", "advogados.numeroOAB", "numeroOAB"] } },
            { query_string: { query: `"${oabWithSlashUf}"`, fields: ["partes.advogados.numeroOAB", "partes.advogados.numeroOab", "advogados.numeroOAB", "numeroOAB"] } },
            { query_string: { query: `"${uf.toUpperCase()}${cleanOab}"`, fields: ["partes.advogados.numeroOAB", "partes.advogados.numeroOab", "advogados.numeroOAB", "numeroOAB"] } }
          ],
          minimum_should_match: 1
        }
      },
      size: 100,
      sort: [{ "dataAjuizamento": { "order": "desc" } }]
    },
    {
      query: {
        query_string: {
          query: `"${cleanOab}" OR "${oabWithUf}" OR "${uf.toUpperCase()}${cleanOab}"`,
          fields: ["*"],
          default_operator: "OR"
        }
      },
      size: 50,
      sort: [{ "dataAjuizamento": { "order": "desc" } }]
    }
  ]

  const endpoints: string[] = []

  // 1. TJ
  const primaryEndpoint = getDataJudApiUrl(tribunalCode, '8')
  if (primaryEndpoint) endpoints.push(primaryEndpoint)

  // 2. TRF
  const ufToTRF: Record<string, string> = {
    'AC': '01', 'AM': '01', 'AP': '01', 'BA': '01', 'DF': '01', 'GO': '01', 'MA': '01', 'MT': '01', 'PA': '01', 'PI': '01', 'RO': '01', 'RR': '01', 'TO': '01',
    'RJ': '02', 'ES': '02', 'SP': '03', 'MS': '03', 'RS': '04', 'SC': '04', 'PR': '04', 'AL': '05', 'CE': '05', 'PB': '05', 'PE': '05', 'RN': '05', 'SE': '05', 'MG': '06'
  }
  const trfCode = ufToTRF[uf.toUpperCase()]
  if (trfCode) {
    const trfEndpoint = getDataJudApiUrl(trfCode, '4')
    if (trfEndpoint) endpoints.push(trfEndpoint)
  }

  // 3. TRT
  const ufToTRT: Record<string, string> = {
    'RJ': '01', 'SP': '02', 'MG': '03', 'RS': '04', 'BA': '05', 'PE': '06', 'CE': '07', 'PA': '08', 'PR': '09', 'DF': '10', 'AM': '11', 'SC': '12', 'PB': '13', 'RO': '14', 'SP2': '15', 'MA': '16', 'ES': '17', 'GO': '18', 'AL': '19', 'SE': '20', 'RN': '21', 'PI': '22', 'MT': '23', 'MS': '24'
  }
  const trtCode = ufToTRT[uf.toUpperCase()]
  if (trtCode) {
    const trtEndpoint = getDataJudApiUrl(trtCode, '5')
    if (trtEndpoint) endpoints.push(trtEndpoint)
  }

  // 4. Fallback TJSP
  if (tribunalCode !== '26') {
    const tjspEndpoint = getDataJudApiUrl('26', '8')
    if (tjspEndpoint) endpoints.push(tjspEndpoint)
  }

  let finalLawyerName: string | undefined = undefined;

  for (const endpoint of endpoints) {
    for (let i = 0; i < queries.length; i++) {
      try {
        console.log(`[DataJud OAB] Tentativa ${i + 1}/${queries.length} em ${endpoint}`)
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `APIKey ${apiKey}` },
          body: JSON.stringify(queries[i]),
          next: { revalidate: 0 }
        })

        if (!response.ok) continue
        const data = await response.json()

        if (data.hits?.hits?.length > 0) {
          const results = data.hits.hits.map((hit: any) => hit._source)

          for (const hit of data.hits.hits) {
            const advs = hit._source.partes?.flatMap((p: any) => p.advogados || []) || [];
            const matchingAdv = advs.find((a: any) => a.numeroOAB?.includes(cleanOab) || a.numeroOab?.includes(cleanOab));
            if (matchingAdv && (matchingAdv.nome || matchingAdv.nmAdvogado)) {
              finalLawyerName = matchingAdv.nome || matchingAdv.nmAdvogado;
              break;
            }
          }

          console.log(`[DataJud OAB] ✅ Sucesso! Encontrados ${results.length} processos.`)
          return { processes: results, lawyerName: finalLawyerName }
        }
      } catch (error) { continue }
    }
  }

  // Fallback de Nome
  if (!finalLawyerName) {
    const fallbackEndpoints = [
      'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search',
      'https://api-publica.datajud.cnj.jus.br/api_publica_trf1/_search',
      'https://api-publica.datajud.cnj.jus.br/api_publica_trt5/_search'
    ]
    for (const endpoint of fallbackEndpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `APIKey ${apiKey}` },
          body: JSON.stringify(queries[0])
        })
        const data = await res.json()
        if (data.hits?.hits?.length > 0) {
          for (const hit of data.hits.hits) {
            const advs = hit._source.partes?.flatMap((p: any) => p.advogados || []) || []
            const matchingAdv = advs.find((a: any) => a.numeroOAB?.includes(cleanOab))
            if (matchingAdv && (matchingAdv.nome || matchingAdv.nmAdvogado)) {
              finalLawyerName = matchingAdv.nome || matchingAdv.nmAdvogado
              console.log(`[DataJud OAB] Nome recuperado via fallback: ${finalLawyerName}`)
              return { processes: [], lawyerName: finalLawyerName }
            }
          }
        }
      } catch (e) { }
    }
  }

  console.log(`[DataJud OAB] ❌ Nenhum resultado para OAB ${oabNumber}/${uf}`)
  return { processes: [], lawyerName: finalLawyerName }
}
