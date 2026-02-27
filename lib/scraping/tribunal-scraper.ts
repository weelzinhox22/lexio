// Sistema customizado de scraping - Nosso próprio Escavador!

import { RateLimiter } from './rate-limiter'

interface TribunalScraper {
  name: string
  baseUrl: string
  searchByOAB: (oabNumber: string, uf: string) => Promise<any[]>
  supportsOAB: boolean
}

interface Processo {
  numeroProcesso: string
  classe?: string
  assunto?: string
  tribunal: string
  representanteOAB: string
  dataDistribuicao?: string
  situacao?: string
  origem: string
  ultimaAtualizacao: string
  urlDetalhes?: string
  partes?: any[]
  movimentacoes?: any[]
}

class TribunalScraperService {
  private scrapers: Map<string, TribunalScraper>
  private rateLimiter: RateLimiter
  private cache: Map<string, { processos: Processo[]; timestamp: number }>

  constructor() {
    this.scrapers = new Map()
    this.rateLimiter = new RateLimiter(5, 60000) // 5 requests por minuto
    this.cache = new Map()
    this.initializeScrapers()
  }

  private initializeScrapers() {
    // TJBA - Já implementado
    this.scrapers.set('TJBA', {
      name: 'Tribunal de Justiça da Bahia',
      baseUrl: 'https://esaj.tjba.jus.br',
      supportsOAB: true,
      searchByOAB: this.searchTJBA.bind(this)
    })

    // TJSP - A implementar
    this.scrapers.set('TJSP', {
      name: 'Tribunal de Justiça de São Paulo',
      baseUrl: 'https://esaj.tjsp.jus.br',
      supportsOAB: true,
      searchByOAB: this.searchTJSP.bind(this)
    })

    // TJRJ - A implementar
    this.scrapers.set('TJRJ', {
      name: 'Tribunal de Justiça do Rio de Janeiro',
      baseUrl: 'https://esaj.tjrj.jus.br',
      supportsOAB: true,
      searchByOAB: this.searchTJRJ.bind(this)
    })
  }

  async searchByOAB(oabNumber: string, uf: string): Promise<Processo[]> {
    const cacheKey = `${oabNumber}-${uf}`

    // Verificar cache (5 minutos)
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 300000) {
      return cached.processos
    }

    // Rate limiting
    await this.rateLimiter.acquire()

    const tribunalCode = this.getTribunalCodeFromUF(uf)
    if (!tribunalCode) {
      console.warn(`[Scraper] Tribunal não mapeado para UF: ${uf}`)
      return []
    }

    const scraper = this.scrapers.get(tribunalCode)
    if (!scraper || !scraper.supportsOAB) {
      console.warn(`[Scraper] Busca por OAB não implementada para ${tribunalCode}`)
      return []
    }

    try {
      const processos = await scraper.searchByOAB(oabNumber, uf)

      // Atualizar cache
      this.cache.set(cacheKey, {
        processos,
        timestamp: Date.now()
      })

      return processos
    } catch (error) {
      console.error(`Erro no scraper ${tribunalCode}:`, error)
      throw error
    }
  }

  // Implementações dos scrapers
  private async searchTJBA(oabNumber: string, uf: string): Promise<Processo[]> {
    const oabComUf = `${oabNumber}${uf.toUpperCase()}`
    // TJBA usa HTTP, não HTTPS!
    const baseUrl = 'http://esaj.tjba.jus.br/cpopg'
    const searchUrl = `${baseUrl}/search.do?conversationId=&cbPesquisa=NUMOAB&dadosConsulta.valorConsulta=${oabComUf}&cdForo=-1`

    console.log(`[Scraper TJBA] Iniciando busca para ${oabComUf} em ${searchUrl}`)

    try {
      // 1. Obter cookie inicial para passar pelo firewall do e-SAJ
      const initialResponse = await fetch(`${baseUrl}/open.do`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml'
        }
      })
      const cookies = initialResponse.headers.get('set-cookie')
      console.log(`[Scraper TJBA] Cookies obtidos: ${cookies ? 'SIM' : 'NÃO'}`)

      // 2. Realizar a busca com os cookies e headers simulando navegador
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'Cookie': cookies || '',
          'Referer': `${baseUrl}/open.do`
        }
      })

      if (!response.ok) throw new Error(`TJBA status ${response.status}`)

      const html = await response.text()

      // Log do conteúdo para debug
      console.log(`[Scraper TJBA] HTML recebido: ${html.length} chars`)
      console.log(`[Scraper TJBA] Contém linkProcesso: ${html.includes('linkProcesso')}`)
      console.log(`[Scraper TJBA] Contém captcha: ${html.includes('captcha') || html.includes('Captcha')}`)
      console.log(`[Scraper TJBA] Contém processo CNJ: ${/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/.test(html)}`)

      if (html.includes('captcha') || html.includes('Captcha') || html.includes('Proteção contra robôs') || html.includes('idCaptcha')) {
        console.warn('[Scraper TJBA] ⚠️ CAPTCHA detectado - tribunal exige verificação humana')
        return []
      }

      return this.parseTJBAHTML(html, oabNumber, uf)
    } catch (err) {
      console.error('[Scraper TJBA Error]', err)
      return []
    }
  }

  private async searchTJSP(oabNumber: string, uf: string): Promise<Processo[]> {
    const oabComUf = `${oabNumber}${uf.toUpperCase()}`
    const baseUrl = 'https://esaj.tjsp.jus.br/cpopg'
    const searchUrl = `${baseUrl}/search.do?conversationId=&cbPesquisa=NUMOAB&dadosConsulta.valorConsulta=${oabComUf}&cdForo=-1`

    console.log(`[Scraper TJSP] Iniciando busca para ${oabComUf}`)

    try {
      // 1. Obter cookie inicial para passar pelo firewall do e-SAJ
      const initialResponse = await fetch(`${baseUrl}/open.do`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      })
      const cookies = initialResponse.headers.get('set-cookie')

      // 2. Realizar a busca com os cookies e headers simulando navegador
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Cookie': cookies || '',
          'Referer': `${baseUrl}/open.do`
        }
      })

      if (!response.ok) throw new Error(`TJSP status ${response.status}`)

      const html = await response.text()

      if (html.includes('captcha') || html.includes('Proteção contra robôs')) {
        console.warn('[Scraper TJSP] Bloqueio por CAPTCHA detectado')
        return []
      }

      return this.parseTJSPHTML(html, oabNumber, uf)
    } catch (err) {
      console.error('[Scraper TJSP Error]', err)
      return []
    }
  }

  private parseTJSPHTML(html: string, oabNumber: string, uf: string): Processo[] {
    const processos: Processo[] = []
    const baseUrl = 'https://esaj.tjsp.jus.br/cpopg'

    // 1. Tentar layout Unified (UNJ)
    if (html.includes('linkProcesso')) {
      const links = html.matchAll(/class="linkProcesso"[^>]*>([\s\S]*?)<\/a>/gi)
      for (const linkMatch of links) {
        const numeroProcesso = linkMatch[1].replace(/\s/g, '').trim()
        if (!numeroProcesso.includes('.') || numeroProcesso.length < 15) continue

        processos.push({
          numeroProcesso,
          classe: 'Processo Localizado',
          tribunal: 'TJSP',
          representanteOAB: `${oabNumber}/${uf.toUpperCase()}`,
          origem: 'Scraper (e-SAJ)',
          ultimaAtualizacao: new Date().toISOString(),
          urlDetalhes: `${baseUrl}/show.do?processo.codigo=${numeroProcesso.replace(/\D/g, '')}`
        })
      }
    }

    // 2. Fallback: Qualquer número no padrão CNJ (NNNNNNN-DD.AAAA.J.TR.OOOO)
    if (processos.length === 0) {
      const cnjRegex = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/g
      const cnjMatches = html.match(cnjRegex) || []
      const uniqueNumbers = [...new Set(cnjMatches)]

      uniqueNumbers.forEach(num => {
        processos.push({
          numeroProcesso: num,
          classe: 'Localizado via padrão CNJ',
          tribunal: 'TJSP',
          representanteOAB: `${oabNumber}/${uf.toUpperCase()}`,
          origem: 'Scraper (Fallthrough)',
          ultimaAtualizacao: new Date().toISOString(),
          urlDetalhes: `${baseUrl}/show.do?processo.codigo=${num.replace(/\D/g, '')}`
        })
      })
    }

    return processos
  }

  private async searchTJRJ(oabNumber: string, uf: string): Promise<Processo[]> {
    // Implementação para TJRJ (a ser desenvolvida)
    console.log(`Buscando processos no TJRJ para OAB: ${oabNumber}`)
    return []
  }

  private parseTJBAHTML(html: string, oabNumber: string, uf: string): Processo[] {
    const processos: Processo[] = []
    const baseUrl = 'https://esaj.tjba.jus.br/cpopg'

    // 1. Tentar capturar via linkProcesso (funciona em ambos os layouts)
    if (html.includes('linkProcesso')) {
      const links = html.matchAll(/class="linkProcesso"[^>]*>([\s\S]*?)<\/a>/gi)
      for (const linkMatch of links) {
        const numeroProcesso = linkMatch[1].replace(/\s/g, '').trim()
        if (!numeroProcesso.includes('.') || numeroProcesso.length < 15) continue

        processos.push({
          numeroProcesso,
          classe: 'Processo Localizado',
          tribunal: 'TJBA',
          representanteOAB: `${oabNumber}/${uf.toUpperCase()}`,
          origem: 'Scraper (e-SAJ TJBA)',
          ultimaAtualizacao: new Date().toISOString(),
          urlDetalhes: `${baseUrl}/show.do?processo.codigo=${numeroProcesso.replace(/\D/g, '')}`
        })
      }
    }

    // 2. Fallback: Qualquer número no padrão CNJ
    if (processos.length === 0) {
      const cnjRegex = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/g
      const cnjMatches = html.match(cnjRegex) || []
      const uniqueNumbers = [...new Set(cnjMatches)]

      uniqueNumbers.forEach(num => {
        processos.push({
          numeroProcesso: num,
          classe: 'Localizado via padrão CNJ',
          tribunal: 'TJBA',
          representanteOAB: `${oabNumber}/${uf.toUpperCase()}`,
          origem: 'Scraper (TJBA Fallthrough)',
          ultimaAtualizacao: new Date().toISOString(),
          urlDetalhes: `${baseUrl}/show.do?processo.codigo=${num.replace(/\D/g, '')}`
        })
      })
    }

    console.log(`[Scraper TJBA] Parsing concluído: ${processos.length} processos encontrados`)
    return processos
  }

  private getTribunalCodeFromUF(uf: string): string | null {
    const tribunalMap: Record<string, string> = {
      'AC': 'TJAC', 'AL': 'TJAL', 'AM': 'TJAM', 'AP': 'TJAP', 'BA': 'TJBA',
      'CE': 'TJCE', 'DF': 'TJDF', 'ES': 'TJES', 'GO': 'TJGO', 'MA': 'TJMA',
      'MG': 'TJMG', 'MS': 'TJMS', 'MT': 'TJMT', 'PA': 'TJPA', 'PB': 'TJPB',
      'PE': 'TJPE', 'PI': 'TJPI', 'PR': 'TJPR', 'RJ': 'TJRJ', 'RN': 'TJRN',
      'RO': 'TJRO', 'RR': 'TJRR', 'RS': 'TJRS', 'SC': 'TJSC', 'SE': 'TJSE',
      'SP': 'TJSP', 'TO': 'TJTO'
    }

    return tribunalMap[uf.toUpperCase()] || null
  }

  // Métodos de administração do sistema
  async getScraperStatus() {
    const status: any = {}

    for (const [code, scraper] of this.scrapers.entries()) {
      status[code] = {
        name: scraper.name,
        supportsOAB: scraper.supportsOAB,
        baseUrl: scraper.baseUrl,
        enabled: true
      }
    }

    return status
  }

  clearCache() {
    this.cache.clear()
  }

  getRateLimitInfo() {
    return this.rateLimiter.getInfo()
  }
}

export const tribunalScraper = new TribunalScraperService()