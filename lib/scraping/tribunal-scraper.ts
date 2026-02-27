// Sistema customizado de scraping - Nosso próprio Escavador!

import { RateLimiter } from './rate-limiter'
import https from 'https'
import http from 'http'

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
    this.rateLimiter = new RateLimiter(10, 60000) // 10 requests por minuto
    this.cache = new Map()
    this.initializeScrapers()
  }

  /**
   * Helper para fazer requisições HTTPS suportando protocolos legados (BA usa TLS antigo)
   */
  private async secureFetch(url: string, options: any = {}): Promise<{ data: string; headers: http.IncomingHttpHeaders }> {
    return new Promise((resolve, reject) => {
      try {
        const urlObj = new URL(url);
        const requestOptions: https.RequestOptions = {
          hostname: urlObj.hostname,
          port: urlObj.port || 443,
          path: urlObj.pathname + (urlObj.search || ''),
          method: options.method || 'GET',
          headers: options.headers || {},
          rejectUnauthorized: false, // Permitir certificados mal configurados de tribunais
          minVersion: 'TLSv1', // Suporte a TLS 1.0/1.1 (CRITICAL para TJBA)
          timeout: 30000 // 30 segundos
        };

        const req = https.request(requestOptions, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => resolve({ data, headers: res.headers }));
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Timeout na conexão com o tribunal'));
        });

        req.on('error', (e) => reject(e));
        if (options.body) req.write(options.body);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  private initializeScrapers() {
    // TJBA - Já implementado
    this.scrapers.set('TJBA', {
      name: 'Tribunal de Justiça da Bahia',
      baseUrl: 'https://esaj.tjba.jus.br',
      supportsOAB: true,
      searchByOAB: this.searchTJBA.bind(this)
    })

    // TJSP - Já implementado
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
    const formats = [
      `${oabNumber}${uf.toUpperCase()}`,
      `${oabNumber}/${uf.toUpperCase()}`,
      `${uf.toUpperCase()}${oabNumber}`
    ]
    const results: Processo[] = []

    // 1. Tentar e-SAJ (1º e 2º Graus) - Usando secureFetch para evitar erros de SSL
    const endpoints = [
      { url: 'https://esaj.tjba.jus.br/cpopg', name: 'e-SAJ 1º Grau' },
      { url: 'https://esaj.tjba.jus.br/cposg5', name: 'e-SAJ 2º Grau' }
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`[Scraper TJBA] Obtendo sessão para ${endpoint.name}`)

        // Obter cookie de sessão inicial
        const initial = await this.secureFetch(`${endpoint.url}/open.do`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
        })
        const cookies = initial.headers['set-cookie']?.join('; ') || ''

        const searchTypes = ['NUMOAB', 'DOCADVOGADO', 'ADVOGADO']

        for (const format of formats) {
          let foundInFormat = false
          for (const searchType of searchTypes) {
            const searchUrl = `${endpoint.url}/search.do?cbPesquisa=${searchType}&dadosConsulta.valorConsulta=${format}&cdForo=-1`

            try {
              const res = await this.secureFetch(searchUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml',
                  'Referer': `${endpoint.url}/open.do`,
                  'Cookie': cookies
                }
              })

              const html = res.data
              if (html.includes('captcha') || html.includes('Proteção contra robôs') || html.includes('vlCaptcha')) {
                console.warn(`[Scraper TJBA] Bloqueio por CAPTCHA em ${endpoint.name} (${searchType})`)
                continue
              }

              const found = this.parseTJBAHTML(html, oabNumber, uf)
              if (found.length > 0) {
                results.push(...found)
                foundInFormat = true
                break
              }
            } catch (fetchErr) {
              console.error(`[Scraper TJBA] Falha secureFetch no ${endpoint.name}:`, fetchErr)
            }
          }
          if (foundInFormat) break
        }
      } catch (err) {
        console.error(`[Scraper TJBA Error] no ${endpoint.name}:`, err)
      }
    }

    // Remover duplicatas
    const uniqueResults = results.filter((p, index, self) =>
      index === self.findIndex((t) => t.numeroProcesso === p.numeroProcesso)
    )

    console.log(`[Scraper TJBA] Total Bahia encontrado: ${uniqueResults.length} processos`)
    return uniqueResults
  }

  private async searchTJSP(oabNumber: string, uf: string): Promise<Processo[]> {
    const oabComUf = `${oabNumber}${uf.toUpperCase()}`
    const baseUrl = 'https://esaj.tjsp.jus.br/cpopg'
    const searchUrl = `${baseUrl}/search.do?cbPesquisa=NUMOAB&dadosConsulta.valorConsulta=${oabComUf}&cdForo=-1`

    console.log(`[Scraper TJSP] Iniciando busca para ${oabComUf}`)

    try {
      // 1. Obter cookie inicial
      const initial = await this.secureFetch(`${baseUrl}/open.do`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' }
      })
      const cookies = initial.headers['set-cookie']?.join('; ') || ''

      // 2. Realizar a busca
      const res = await this.secureFetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Cookie': cookies,
          'Referer': `${baseUrl}/open.do`
        }
      })

      const html = res.data
      if (html.includes('captcha') || html.includes('Proteção contra robôs') || html.includes('vlCaptcha')) {
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