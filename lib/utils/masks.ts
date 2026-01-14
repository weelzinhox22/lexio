/**
 * Utilitários para formatação de máscaras
 */

/**
 * Formata CPF: 000.000.000-00
 */
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return value
}

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 14) {
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
  }
  return value
}

/**
 * Formata CPF ou CNPJ automaticamente baseado no tamanho
 */
export function formatCPFCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 11) {
    return formatCPF(value)
  }
  return formatCNPJ(value)
}

/**
 * Formata telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2')
  } else {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
  }
}

/**
 * Formata número de processo: 0000000-00.0000.0.00.0000
 */
export function formatProcessNumber(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 20) {
    return numbers
      .replace(/(\d{7})(\d)/, '$1-$2')
      .replace(/(\d{7}-\d{2})(\d)/, '$1.$2')
      .replace(/(\d{7}-\d{2}\.\d{4})(\d)/, '$1.$2')
      .replace(/(\d{7}-\d{2}\.\d{4}\.\d{1})(\d)/, '$1.$2')
      .replace(/(\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2})(\d)/, '$1.$2')
      .replace(/(\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4})(\d)/, '$1')
  }
  return value
}

/**
 * Remove formatação (apenas números)
 */
export function unformat(value: string): string {
  return value.replace(/\D/g, '')
}












