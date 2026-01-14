/**
 * Utilitários para trabalhar com HTML
 */

/**
 * Converte texto simples para HTML básico
 * Preserva quebras de linha e parágrafos
 */
export function textToHtml(text: string): string {
  if (!text) return ''
  
  // Se já parece HTML, retornar como está
  if (text.trim().startsWith('<')) {
    return text
  }
  
  // Converter quebras de linha para <br> e parágrafos para <p>
  return text
    .split('\n\n')
    .map((paragraph) => {
      const lines = paragraph.split('\n')
      return `<p>${lines.join('<br>')}</p>`
    })
    .join('')
}

/**
 * Converte HTML para texto simples
 * Remove tags HTML preservando o conteúdo
 */
export function htmlToText(html: string): string {
  if (!html) return ''
  
  // Se não parece HTML, retornar como está
  if (!html.trim().startsWith('<')) {
    return html
  }
  
  // Criar elemento temporário para extrair texto
  const temp = document.createElement('div')
  temp.innerHTML = html
  
  // Converter <br> para \n e <p> para \n\n
  const text = temp.textContent || temp.innerText || ''
  
  // Limpar espaços extras
  return text.replace(/\n\s*\n/g, '\n\n').trim()
}

/**
 * Extrai placeholders de HTML ou texto
 * Remove tags HTML antes de extrair
 */
export function extractPlaceholdersFromHtml(html: string): string[] {
  const text = htmlToText(html)
  const regex = /{{([A-Z_]+)}}/g
  const matches = Array.from(text.matchAll(regex))
  const placeholders = matches.map((match) => match[1])
  return [...new Set(placeholders)]
}

