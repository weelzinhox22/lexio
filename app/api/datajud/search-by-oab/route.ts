import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { tribunalScraper } from '@/lib/scraping/tribunal-scraper'

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

    // 1. Tentar busca via DataJud (Mais rápido e oficial)
    let processos: any[] = []
    let source = 'datajud'

    try {
      debugLog.push(`[1] Iniciando busca DataJud para OAB ${oabNumber}/${uf}`)
      const { searchDataJudByOAB } = await import('@/lib/datajud-api')
      processos = await searchDataJudByOAB(oabNumber, uf)
      debugLog.push(`[1] DataJud retornou ${processos?.length || 0} processos`)
    } catch (djError: any) {
      debugLog.push(`[1] DataJud ERRO: ${djError.message}`)
      console.error('[DataJud OAB Error]:', djError.message)
    }

    // 2. Se DataJud não retornar nada (ou falhar), tentar scraper local (TJBA etc)
    if (!processos || processos.length === 0) {
      debugLog.push(`[2] DataJud sem resultados. Tentando scraper para TJ${uf}...`)
      try {
        processos = await tribunalScraper.searchByOAB(oabNumber, uf)
        source = 'scraper'
        debugLog.push(`[2] Scraper retornou ${processos?.length || 0} processos`)
      } catch (scraperError: any) {
        debugLog.push(`[2] Scraper ERRO: ${scraperError.message}`)
        console.error('[Scraper OAB Error]:', scraperError.message)
        // Se ambos falharem, podemos tentar as outras funções de busca real do próprio route.ts
        try {
          processos = await searchRealOABProcesses(oabNumber, uf)
          source = 'legacy_search'
          debugLog.push(`[3] Legacy search retornou ${processos?.length || 0} processos`)
        } catch (legacyError: any) {
          debugLog.push(`[3] Legacy ERRO: ${legacyError.message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      processes: processos || [],
      count: processos?.length || 0,
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

// Integração real com APIs de tribunais
async function searchRealOABProcesses(oabNumber: string, uf: string): Promise<any[]> {
  const tribunalAPIs = {
    'SP': searchTJSPProcesses,
    'RJ': searchTJRJProcesses,
    'BA': searchTJBAProcesses,
    'MG': searchTJMGProcesses,
    'RS': searchTJRSProcesses
  }

  const searchFunction = tribunalAPIs[uf as keyof typeof tribunalAPIs]

  if (!searchFunction) {
    console.warn(`Busca por OAB não implementada para o TJ${uf}`)
    return []
  }

  try {
    return await searchFunction(oabNumber)
  } catch (error) {
    console.error(`Erro ao buscar processos no TJ${uf}:`, error)
    return []
  }
}

// Implementação para TJSP (ESAJ)
async function searchTJSPProcesses(oabNumber: string): Promise<any[]> {
  // O TJSP não possui API pública direta, mas podemos tentar web scraping ou usar serviços terceiros
  // Esta é uma implementação placeholder para demonstração
  console.log(`Buscando processos do TJSP para OAB: ${oabNumber}`)

  // Em produção, integrar com:
  // - API do JusAPI (https://jusapi.com.br)
  // - API do Juridoc (https://juridoc.com.br) 
  // - Ou implementar web scraping do ESAJ

  return []
}

// Implementação para TJRJ
async function searchTJRJProcesses(oabNumber: string): Promise<any[]> {
  console.log(`Buscando processos do TJRJ para OAB: ${oabNumber}`)
  // Integração similar ao TJSP
  return []
}

// Implementação para TJBA - Busca real por OAB
async function searchTJBAProcesses(oabNumber: string): Promise<any[]> {
  console.log(`Buscando processos do TJBA para OAB: ${oabNumber}`)

  try {
    // Primeiro, fazer a busca no TJBA usando o formulário de busca por advogado
    const searchUrl = 'https://esaj.tjba.jus.br/cposg5/search.do'

    const formData = new URLSearchParams()
    formData.append('conversationId', '')
    formData.append('dadosConsulta.localPesquisa.cdLocal', '-1')
    formData.append('cbPesquisa', 'ADVOGADO')
    formData.append('dadosConsulta.tipoNuProcesso', 'UNIFICADO')
    formData.append('dadosConsulta.valorConsulta', oabNumber)
    formData.append('uuidCaptcha', '')

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://esaj.tjba.jus.br/cposg5/open.do',
        'Origin': 'https://esaj.tjba.jus.br'
      },
      body: formData.toString()
    })

    if (!response.ok) {
      console.warn(`TJBA retornou status ${response.status} para OAB ${oabNumber}`)
      return []
    }

    const html = await response.text()

    // Verificar se há resultados - padrões comuns de "nenhum processo"
    if (html.includes('Nenhum processo encontrado') ||
      html.includes('listaVazia') ||
      html.includes('nenhum registro') ||
      html.includes('resultado não localizado')) {
      console.log(`Nenhum processo encontrado para OAB ${oabNumber} no TJBA`)
      return []
    }

    // Verificar se há CAPTCHA ou bloqueio
    if (html.includes('captcha') || html.includes('CAPTCHA') || html.includes('bloqueado')) {
      console.warn(`TJBA exigiu CAPTCHA ou bloqueou acesso para OAB ${oabNumber}`)
      return []
    }

    // Extrair processos do HTML com parsing mais robusto
    const processos = extractTJBAProcessesFromHTML(html, oabNumber)

    console.log(`Encontrados ${processos.length} processos para OAB ${oabNumber} no TJBA`)
    return processos

  } catch (error) {
    console.error('Erro na integração com TJBA:', error)
    return []
  }
}

// Extrair processos do HTML do TJBA com parsing mais robusto
function extractTJBAProcessesFromHTML(html: string, oabNumber: string): any[] {
  const processos: any[] = []

  try {
    // Método mais robusto: buscar por linhas de tabela que contenham processos
    const processoRegex = /<tr[^>]*class="(?:(?:ementa|fundo)?Claro|fundoEscuro)"[^>]*>([\s\S]*?)<\/tr>/gi

    let match
    while ((match = processoRegex.exec(html)) !== null) {
      const linhaProcesso = match[1]

      // Extrair número do processo
      const numeroMatch = linhaProcesso.match(/numeroProcesso"[^>]*>\s*([^<]+)\s*<\/span>/i)
      if (!numeroMatch) continue

      const numeroProcesso = numeroMatch[1].trim()
      if (!isValidCNJFormat(numeroProcesso)) continue

      // Extrair classe processual
      const classeMatch = linhaProcesso.match(/classeProcesso"[^>]*>\s*([^<]+)\s*<\/span>/i)
      const classe = classeMatch ? classeMatch[1].trim() : 'Não informado'

      // Extrair assunto
      const assuntoMatch = linhaProcesso.match(/assuntoProcesso"[^>]*>\s*([^<]+)\s*<\/span>/i)
      const assunto = assuntoMatch ? assuntoMatch[1].trim() : 'Não informado'

      // Extrair situação (se disponível)
      const situacaoMatch = linhaProcesso.match(/situacao"[^>]*>\s*([^<]+)\s*<\/span>/i)
      const situacao = situacaoMatch ? situacaoMatch[1].trim() : 'Em Andamento'

      // Extrair data de distribuição (se disponível)
      const dataMatch = linhaProcesso.match(/dataDistribuicao"[^>]*>\s*([^<]+)\s*<\/span>/i)
      const dataDistribuicao = dataMatch ? dataMatch[1].trim() : new Date().toISOString().split('T')[0]

      processos.push({
        numeroProcesso: formatCNJNumber(numeroProcesso),
        classe: classe,
        assunto: assunto,
        tribunal: 'TJBA',
        representanteOAB: `${oabNumber}/BA`,
        dataDistribuicao: dataDistribuicao,
        situacao: situacao,
        origem: 'TJBA',
        ultimaAtualizacao: new Date().toISOString(),
        urlDetalhes: `https://esaj.tjba.jus.br/cposg5/show.do?processo.codigo=${numeroProcesso.replace(/[^\d]/g, '')}`
      })
    }

    // Método alternativo: buscar por links de processos
    if (processos.length === 0) {
      const linkRegex = /<a[^>]*href="[^"]*show\.do\?processo\.codigo=(\d+)[^"]*"[^>]*>/gi
      let linkMatch

      while ((linkMatch = linkRegex.exec(html)) !== null) {
        const codigoProcesso = linkMatch[1]
        if (codigoProcesso && codigoProcesso.length >= 7) {
          processos.push({
            numeroProcesso: formatCNJNumber(codigoProcesso),
            classe: 'Não informado',
            assunto: 'Não informado',
            tribunal: 'TJBA',
            representanteOAB: `${oabNumber}/BA`,
            dataDistribuicao: new Date().toISOString().split('T')[0],
            situacao: 'Em Andamento',
            origem: 'TJBA',
            ultimaAtualizacao: new Date().toISOString(),
            urlDetalhes: `https://esaj.tjba.jus.br/cposg5/show.do?processo.codigo=${codigoProcesso}`
          })
        }
      }
    }

  } catch (error) {
    console.error('Erro ao extrair processos do HTML do TJBA:', error)
  }

  return processos
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