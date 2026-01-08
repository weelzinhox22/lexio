/**
 * Utilitários para integração com PJe do TJBA
 * https://pje.tjba.jus.br/pje/Processo
 */

export interface PJeProcessData {
  processNumber: string
  title?: string
  parties?: string[]
  publications?: PJePublication[]
  movements?: PJeMovement[]
}

export interface PJePublication {
  type: string
  date: string
  diary: string
  content: string
}

export interface PJeMovement {
  date: string
  description: string
  type: string
}

/**
 * Busca informações de um processo no PJe do TJBA
 * NOTA: O PJe requer autenticação para acessar dados completos
 * Esta função tenta fazer uma consulta pública básica
 */
export async function searchPJeTJBA(processNumber: string): Promise<PJeProcessData | null> {
  try {
    // URL de consulta pública do PJe
    // O PJe do TJBA permite consulta pública por número de processo
    const searchUrl = `https://pje.tjba.jus.br/pje/Processo/ConsultaProcesso/listView.seam`
    
    // Tentar fazer uma requisição para buscar o processo
    // NOTA: O PJe pode requerer autenticação ou ter proteção contra scraping
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    // Se conseguir acessar, processar o HTML
    // Por enquanto, retornamos null e deixamos o frontend acessar diretamente
    // Em produção, você precisaria:
    // 1. Fazer parsing do HTML retornado
    // 2. Extrair informações do processo
    // 3. Ou usar uma API de terceiros que acessa o PJe
    
    return null
  } catch (error) {
    console.error('[PJe TJBA] Erro ao buscar processo:', error)
    return null
  }
}

/**
 * Gera URL para acessar o processo no PJe
 */
export function getPJeURL(processNumber: string): string {
  // Formato da URL do PJe para consulta por número
  return `https://pje.tjba.jus.br/pje/Processo/ConsultaProcesso/listView.seam?numeroProcesso=${encodeURIComponent(processNumber)}`
}

