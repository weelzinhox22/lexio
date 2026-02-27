/**
 * Integração com o CNA - Cadastro Nacional dos Advogados (OAB)
 * https://cna.oab.org.br
 * 
 * Permite buscar informações de advogados pelo número de inscrição na OAB.
 * Funciona para TODOS os estados brasileiros.
 */

export interface CNAResult {
    nome: string
    inscricao: string
    uf: string
    tipo: string // ADVOGADO, ESTAGIÁRIO, etc.
    situacao?: string
}

/**
 * Busca o nome do advogado no CNA (Cadastro Nacional dos Advogados) da OAB.
 * 
 * Fluxo:
 * 1. GET na home do CNA para obter cookie e token anti-forgery
 * 2. POST com os dados de busca
 * 3. Parse do JSON retornado
 */
export async function searchCNA(oabNumber: string, uf?: string): Promise<CNAResult | null> {
    try {
        console.log(`[CNA] Buscando advogado OAB ${oabNumber}${uf ? '/' + uf : ''}`)

        // Step 1: GET na home para pegar cookie + token
        const homeRes = await fetch('https://cna.oab.org.br/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html'
            }
        })

        if (!homeRes.ok) {
            console.error(`[CNA] Erro ao acessar home: ${homeRes.status}`)
            return null
        }

        const homeHtml = await homeRes.text()

        // Extrair cookies
        let allCookies = ''
        if (typeof (homeRes.headers as any).getSetCookie === 'function') {
            const setCookies = (homeRes.headers as any).getSetCookie()
            allCookies = setCookies.map((c: string) => c.split(';')[0]).join('; ')
        } else {
            const setCookie = homeRes.headers.get('set-cookie') || ''
            allCookies = setCookie.split(';')[0]
        }

        // Extrair token anti-forgery do formulário
        const tokenMatch = homeHtml.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/)
        const token = tokenMatch?.[1]

        if (!token || !allCookies) {
            console.error('[CNA] Falha ao obter token ou cookies')
            return null
        }

        // Step 2: POST de busca
        const cleanOab = oabNumber.replace(/\D/g, '')
        const body = `__RequestVerificationToken=${encodeURIComponent(token)}&IsMobile=false&NomeAdvo=&Insc=${cleanOab}&Uf=${uf?.toUpperCase() || ''}&TipoInsc=`

        const searchRes = await fetch('https://cna.oab.org.br/Home/Search', {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': allCookies,
                'Referer': 'https://cna.oab.org.br/',
                'Origin': 'https://cna.oab.org.br'
            },
            body
        })

        if (!searchRes.ok) {
            console.error(`[CNA] Erro na busca: ${searchRes.status}`)
            return null
        }

        const data = await searchRes.json()

        if (!data.Success || !data.Data || !Array.isArray(data.Data) || data.Data.length === 0) {
            console.log('[CNA] Nenhum resultado encontrado')
            return null
        }

        // Se UF foi especificado, filtrar pelo UF. Senão, pegar o primeiro.
        const match = uf
            ? data.Data.find((item: any) => item.UF?.toUpperCase() === uf.toUpperCase())
            : data.Data[0]

        if (!match) {
            console.log(`[CNA] Nenhum resultado para UF ${uf}`)
            return null
        }

        const result: CNAResult = {
            nome: match.Nome,
            inscricao: match.Inscricao,
            uf: match.UF,
            tipo: match.TipoInscOab
        }

        console.log(`[CNA] ✅ Encontrado: ${result.nome} - OAB ${result.inscricao}/${result.uf} (${result.tipo})`)
        return result

    } catch (error: any) {
        console.error(`[CNA] Exceção: ${error.message}`)
        return null
    }
}
