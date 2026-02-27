import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tribunalScraper } from '@/lib/scraping/tribunal-scraper'
import { searchCNA } from '@/lib/cna-api'

export async function POST(request: Request) {
  try {
    // Autenticar usuário
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { oabNumber, uf } = await request.json()

    if (!oabNumber || !uf) {
      return NextResponse.json({ error: 'Número da OAB e UF são obrigatórios' }, { status: 400 })
    }

    console.log(`🔍 Buscando processos por OAB: ${oabNumber}/${uf}`)
    const debugLog: string[] = []

    let processos: any[] = []
    let lawyerName: string | undefined = undefined
    let lawyerType: string | undefined = undefined
    let source = 'datajud'

    // ===== ETAPA 0: CNA - Cadastro Nacional dos Advogados (OAB) =====
    // Fonte mais confiável para identificar o advogado. Funciona para TODOS os estados.
    try {
      debugLog.push(`[0] Consultando CNA (Cadastro Nacional dos Advogados)...`)
      const cnaResult = await searchCNA(oabNumber, uf)
      if (cnaResult) {
        lawyerName = cnaResult.nome
        lawyerType = cnaResult.tipo
        debugLog.push(`[0] CNA ✅ ${cnaResult.nome} - OAB ${cnaResult.inscricao}/${cnaResult.uf} (${cnaResult.tipo})`)
      } else {
        debugLog.push(`[0] CNA: Nenhum advogado encontrado para OAB ${oabNumber}/${uf}`)
      }
    } catch (cnaError: any) {
      debugLog.push(`[0] CNA ERRO: ${cnaError.message}`)
      console.error('[CNA Error]:', cnaError.message)
    }

    // ===== ETAPA 1: DataJud - Busca de processos =====
    try {
      debugLog.push(`[1] Iniciando busca DataJud para OAB ${oabNumber}/${uf}`)
      const { searchDataJudByOAB } = await import('@/lib/datajud-api')
      const djResult = await searchDataJudByOAB(oabNumber, uf)
      processos = djResult.processes || []
      // Se DataJud encontrou o nome e CNA não encontrou, usar o do DataJud
      if (!lawyerName && djResult.lawyerName) {
        lawyerName = djResult.lawyerName
      }
      debugLog.push(`[1] DataJud retornou ${processos?.length || 0} processos`)
    } catch (djError: any) {
      debugLog.push(`[1] DataJud ERRO: ${djError.message}`)
      console.error('[DataJud OAB Error]:', djError.message)
    }

    // ===== ETAPA 2: Scraper (fallback se DataJud falhar) =====
    if (!processos || processos.length === 0) {
      debugLog.push(`[2] DataJud sem resultados. Tentando scraper para TJ${uf}...`)
      try {
        const scraperResult = await tribunalScraper.searchByOAB(oabNumber, uf)
        processos = scraperResult
        source = 'scraper'
        debugLog.push(`[2] Scraper retornou ${processos?.length || 0} processos`)
      } catch (scraperError: any) {
        debugLog.push(`[2] Scraper ERRO: ${scraperError.message}`)
        console.error('[Scraper OAB Error]:', scraperError.message)
      }
    }

    return NextResponse.json({
      success: true,
      processes: processos || [],
      count: processos?.length || 0,
      lawyerName,
      lawyerType,
      source,
      debug: debugLog
    })

  } catch (error: any) {
    console.error('[OAB Route Error]:', error)
    return NextResponse.json({
      error: 'Erro interno ao processar busca por OAB',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

// Validar formato CNJ (NNNNNNN-DD.AAAA.J.TR.OOOO)
function isValidCNJFormat(numeroProcesso: string): boolean {
  const cnjPattern = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/
  return cnjPattern.test(numeroProcesso)
}

// Formatar número CNJ para padrão uniforme
function formatCNJNumber(numeroProcesso: string): string {
  return numeroProcesso.replace(/\s/g, '').toUpperCase()
}

// Implementação para TJMG
async function searchTJMGProcesses(oabNumber: string): Promise<any[]> {
  console.log(`Buscando processos do TJMG para OAB: ${oabNumber}`)
  return []
}

// Implementação para TJRS  
async function searchTJRSProcesses(oabNumber: string): Promise<any[]> {
  console.log(`Buscando processos do TJRS para OAB: ${oabNumber}`)
  return []
}

// Serviços de API jurídica recomendados para integração real
const juridicalAPIServices = {
  JUSAPI: {
    endpoint: 'https://api.jusapi.com.br/v1/processos',
    docs: 'https://docs.jusapi.com.br',
    supportsOAB: true
  },
  JURIDOC: {
    endpoint: 'https://api.juridoc.com.br/search',
    docs: 'https://docs.juridoc.com.br',
    supportsOAB: true
  },
  DATAJUD: {
    endpoint: 'https://api-publica.datajud.cnj.jus.br',
    docs: 'https://api-publica.datajud.cnj.jus.br/swagger-ui.html',
    supportsOAB: false // DataJud não suporta busca direta por OAB
  }
}

// Integração específica com JusBrasil (API jurídica profissional)
async function searchWithJusBrasil(oabNumber: string, uf: string): Promise<any[]> {
  const JUSBRASIL_API_KEY = process.env.JUSBRASIL_API_KEY

  if (!JUSBRASIL_API_KEY || JUSBRASIL_API_KEY === 'SUA_CHAVE_JUSBRASIL_AQUI') {
    console.warn('Chave JusBrasil não configurada')
    return []
  }

  try {
    // Endpoint da JusBrasil para busca por OAB
    const response = await fetch('https://api.jusbrasil.com/v2/processes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JUSBRASIL_API_KEY}`
      },
      body: JSON.stringify({
        oab_number: oabNumber,
        uf: uf,
        page: 1,
        per_page: 50,
        include_details: true
      })
    })

    if (!response.ok) {
      console.error(`JusBrasil retornou status ${response.status}`)
      return []
    }

    const data = await response.json()

    // Formatar resposta da JusBrasil para o formato do sistema
    if (data.success && data.data && Array.isArray(data.data.processes)) {
      return data.data.processes.map((processo: any) => ({
        numeroProcesso: processo.cnj_number || processo.number,
        classe: processo.class || 'Não informado',
        assunto: processo.main_subject || 'Não informado',
        tribunal: processo.court || `TJ${uf}`,
        representanteOAB: `${oabNumber}/${uf}`,
        dataDistribuicao: processo.distribution_date || new Date().toISOString().split('T')[0],
        situacao: processo.status || 'Em Andamento',
        origem: 'JusBrasil',
        ultimaAtualizacao: new Date().toISOString(),
        partes: processo.parties || [],
        movimentacoes: processo.movements || []
      }))
    }

    return []

  } catch (error) {
    console.error('Erro na integração com JusBrasil:', error)
    return []
  }
}

// Integração específica com Escavador (API jurídica profissional)
async function searchWithEscavador(oabNumber: string, uf: string): Promise<any[]> {
  const ESCAVADOR_API_KEY = process.env.ESCAVADOR_API_KEY

  if (!ESCAVADOR_API_KEY || ESCAVADOR_API_KEY === 'SUA_CHAVE_ESCAVADOR_AQUI') {
    console.warn('Chave Escavador não configurada')
    return []
  }

  try {
    // Endpoint do Escavador para busca por OAB
    const response = await fetch('https://api.es cavador.com/api/v1/processos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': ESCAVADOR_API_KEY
      },
      body: JSON.stringify({
        numero_oab: oabNumber,
        uf_oab: uf,
        pagina: 1,
        limite: 50
      })
    })

    if (!response.ok) {
      console.error(`Escavador retornou status ${response.status}`)
      return []
    }

    const data = await response.json()

    // Formatar resposta do Escavador para o formato do sistema
    if (data.sucesso && data.dados && Array.isArray(data.dados.processos)) {
      return data.dados.processos.map((processo: any) => ({
        numeroProcesso: processo.numero_cnj || processo.numero,
        classe: processo.classe || 'Não informado',
        assunto: processo.assunto_principal || 'Não informado',
        tribunal: processo.tribunal || `TJ${uf}`,
        representanteOAB: `${oabNumber}/${uf}`,
        dataDistribuicao: processo.data_distribuicao || new Date().toISOString().split('T')[0],
        situacao: processo.situacao || 'Em Andamento',
        origem: 'Escavador',
        ultimaAtualizacao: new Date().toISOString(),
        partes: processo.partes || [],
        movimentacoes: processo.movimentacoes || []
      }))
    }

    return []

  } catch (error) {
    console.error('Erro na integração com Escavador:', error)
    return []
  }
}

// Integração com API gratuita do DataJud (CNJ)
async function searchWithDataJud(oabNumber: string, uf: string): Promise<any[]> {
  const DATAJUD_API_KEY = process.env.DATAJUD_API_KEY

  if (!DATAJUD_API_KEY || DATAJUD_API_KEY === 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==') {
    console.warn('Chave DataJud não configurada')
    return []
  }

  try {
    // O DataJud não suporta busca direta por OAB, então fazemos uma busca por processos
    // e filtramos aqueles que têm a OAB como representante
    const tribunalCode = getTribunalCodeFromUF(uf)

    if (!tribunalCode) {
      console.warn(`Tribunal não encontrado para UF: ${uf}`)
      return []
    }

    const response = await fetch(`https://api-publica.datajud.cnj.jus.br/api_publica_${tribunalCode}/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `APIKey ${DATAJUD_API_KEY}`
      },
      body: JSON.stringify({
        query: {
          bool: {
            should: [
              { match: { 'partes.advogados.numeroOAB': oabNumber } },
              { match: { 'partes.advogados.ufOAB': uf } }
            ],
            minimum_should_match: 2
          }
        },
        size: 50
      })
    })

    if (!response.ok) {
      console.error(`DataJud retornou status ${response.status}`)
      return []
    }

    const data = await response.json()

    // Formatar resposta do DataJud para o formato do sistema
    if (data.hits && data.hits.hits && Array.isArray(data.hits.hits)) {
      return data.hits.hits.map((hit: any) => {
        const processo = hit._source
        return {
          numeroProcesso: processo.numeroCNJ || processo.numeroProcesso,
          classe: processo.classeProcessual || 'Não informado',
          assunto: processo.assuntoPrincipal || 'Não informado',
          tribunal: processo.tribunal || `TJ${uf}`,
          representanteOAB: `${oabNumber}/${uf}`,
          dataDistribuicao: processo.dataDistribuicao || new Date().toISOString().split('T')[0],
          situacao: processo.situacao || 'Em Andamento',
          origem: 'DataJud',
          ultimaAtualizacao: new Date().toISOString(),
          partes: processo.partes || [],
          movimentacoes: processo.movimentacoes || []
        }
      })
    }

    return []

  } catch (error) {
    console.error('Erro na integração com DataJud:', error)
    return []
  }
}

// Mapear UF para código do tribunal no DataJud
function getTribunalCodeFromUF(uf: string): string | null {
  const tribunalMap: Record<string, string> = {
    'AC': 'tjac', 'AL': 'tjal', 'AM': 'tjam', 'AP': 'tjap', 'BA': 'tjba',
    'CE': 'tjce', 'DF': 'tjdf', 'ES': 'tjes', 'GO': 'tjgo', 'MA': 'tjma',
    'MG': 'tjmg', 'MS': 'tjms', 'MT': 'tjmt', 'PA': 'tjpa', 'PB': 'tjpb',
    'PE': 'tjpe', 'PI': 'tjpi', 'PR': 'tjpr', 'RJ': 'tjrj', 'RN': 'tjrn',
    'RO': 'tjro', 'RR': 'tjrr', 'RS': 'tjrs', 'SC': 'tjsc', 'SE': 'tjse',
    'SP': 'tjsp', 'TO': 'tjto'
  }

  return tribunalMap[uf.toUpperCase()] || null
}

// Função para integração com serviços pagos (recomendado para produção)
async function searchWithJuridicalAPI(oabNumber: string, uf: string, service: keyof typeof juridicalAPIServices): Promise<any[]> {
  const apiService = juridicalAPIServices[service]

  if (!apiService.supportsOAB) {
    throw new Error(`Serviço ${service} não suporta busca por OAB`)
  }

  // Em produção, usar chave API real
  const API_KEY = process.env.JURIDICAL_API_KEY

  if (!API_KEY) {
    console.warn('Chave API jurídica não configurada')
    return []
  }

  try {
    const response = await fetch(apiService.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        oab: oabNumber,
        uf: uf,
        page: 1,
        limit: 50
      })
    })

    if (!response.ok) {
      throw new Error(`${service} retornou status ${response.status}`)
    }

    const data = await response.json()
    return data.processos || []

  } catch (error) {
    console.error(`Erro com serviço ${service}:`, error)
    return []
  }
}