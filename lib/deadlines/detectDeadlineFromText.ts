export type DeadlineDetectionResult = {
  /** true = "Possível prazo detectado" (nunca “confirmado”) */
  deadline_detected: boolean
  /** número de dias somente quando explicitamente indicado no texto */
  deadline_days: number | null
  /** 0..1 (nunca 1) */
  confidence_score: number
  matched_keywords: string[]
}

/**
 * Detecta possível prazo em texto jurídico brasileiro (rule-based).
 *
 * Segurança:
 * - NÃO calcula datas.
 * - NÃO assume intimação/citação.
 * - Apenas sinaliza “Possível prazo detectado”.
 */
export function detectDeadlineFromText(text: string): DeadlineDetectionResult {
  const raw = (text || '').toString()
  const normalized = normalize(raw)

  if (!normalized.trim()) {
    return {
      deadline_detected: false,
      deadline_days: null,
      confidence_score: 0,
      matched_keywords: [],
    }
  }

  // Anti-sinais (evita falso positivo óbvio)
  if (/(sem\s+prazo|nao\s+ha\s+prazo|não\s+há\s+prazo)/i.test(normalized)) {
    return {
      deadline_detected: false,
      deadline_days: null,
      confidence_score: 0,
      matched_keywords: [],
    }
  }

  const keywordRules: Array<{ key: string; pattern: RegExp; strength: 'weak' | 'strong' }> = [
    { key: 'prazo', pattern: /\bprazo\b/i, strength: 'weak' },
    { key: 'no prazo de', pattern: /\bno\s+prazo\s+de\b/i, strength: 'strong' },
    { key: 'prazo de', pattern: /\bprazo\s+de\b/i, strength: 'strong' },
    { key: 'prazo legal', pattern: /\bprazo\s+legal\b/i, strength: 'weak' },
    { key: 'no prazo legal', pattern: /\bno\s+prazo\s+legal\b/i, strength: 'weak' },
    { key: 'prazo comum', pattern: /\bprazo\s+comum\b/i, strength: 'weak' },
    { key: 'intime-se', pattern: /\bintime-?se\b/i, strength: 'strong' },
    { key: 'manifestar-se', pattern: /\bmanifestar-?se\b/i, strength: 'strong' },
    { key: 'apresentar', pattern: /\bapresentar\b/i, strength: 'weak' },
    { key: 'juntar', pattern: /\bjuntar\b/i, strength: 'weak' },
    { key: 'contestar', pattern: /\bcontestar\b/i, strength: 'strong' },
    { key: 'cumprir', pattern: /\bcumprir\b/i, strength: 'weak' },
    { key: 'sob pena de', pattern: /\bsob\s+pena\s+de\b/i, strength: 'strong' },
    { key: 'em X dias', pattern: /\bem\s+\d{1,3}\s+dias\b/i, strength: 'strong' },
  ]

  const matched_keywords = unique(
    keywordRules.filter((r) => r.pattern.test(normalized)).map((r) => r.key)
  )

  const strongMatches = keywordRules.filter((r) => r.strength === 'strong' && r.pattern.test(normalized))

  const deadline_days = extractExplicitDays(normalized)
  const deadline_detected = matched_keywords.length > 0

  let confidence = 0
  if (!deadline_detected) {
    confidence = 0
  } else if (deadline_days == null) {
    confidence = 0.4
  } else {
    // Keyword + number
    confidence = 0.7
    if (/\bintime-?se\b/i.test(normalized)) {
      confidence = 0.85
    }
    // múltiplos sinais fortes → elevar, mas nunca 1
    if (strongMatches.length >= 2 || matched_keywords.length >= 4) {
      confidence = Math.max(confidence, 0.9)
    }
  }

  // Guardrails
  if (confidence >= 1) confidence = 0.9
  if (confidence < 0) confidence = 0

  return {
    deadline_detected,
    deadline_days,
    confidence_score: round2(confidence),
    matched_keywords,
  }
}

function normalize(input: string): string {
  return stripDiacritics(input).toLowerCase()
}

function stripDiacritics(input: string): string {
  try {
    return input.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  } catch {
    // fallback antigo sem unicode properties
    return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

const NUMBER_WORDS: Record<string, number> = {
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  três: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  onze: 11,
  doze: 12,
  treze: 13,
  quatorze: 14,
  catorze: 14,
  quinze: 15,
  dezesseis: 16,
  dezassete: 17,
  dezessete: 17,
  dezoito: 18,
  dezenove: 19,
  vinte: 20,
  trinta: 30,
}

function parseWordNumber(word: string): number | null {
  const w = word.trim().toLowerCase()
  return NUMBER_WORDS[w] ?? null
}

/**
 * Extrai dias somente quando explicitamente indicado.
 * Prioridade: "prazo de X dias" > "no prazo de X dias" > "em X dias"
 */
function extractExplicitDays(normalized: string): number | null {
  const patterns: Array<RegExp> = [
    // prazo (legal) de 15 dias / prazo de 15 dias úteis
    /\bprazo(?:\s+legal)?\s+de\s+(\d{1,3})\s+dias(?:\s+uteis|\s+úteis)?\b/i,
    /\bno\s+prazo\s+de\s+(\d{1,3})\s+dias(?:\s+uteis|\s+úteis)?\b/i,
    /\bem\s+(\d{1,3})\s+dias(?:\s+uteis|\s+úteis)?\b/i,
    // em 5 (cinco) dias / prazo de 10 (dez) dias
    /\bem\s+(\d{1,3})\s*\(\s*([a-zçãáéíóúâêôõ]+)\s*\)\s+dias(?:\s+uteis|\s+úteis)?\b/i,
    /\bprazo(?:\s+legal)?\s+de\s+(\d{1,3})\s*\(\s*([a-zçãáéíóúâêôõ]+)\s*\)\s+dias(?:\s+uteis|\s+úteis)?\b/i,
    // prazo de cinco dias / em dez dias
    /\bprazo(?:\s+legal)?\s+de\s+([a-zçãáéíóúâêôõ]+)\s+dias(?:\s+uteis|\s+úteis)?\b/i,
    /\bem\s+([a-zçãáéíóúâêôõ]+)\s+dias(?:\s+uteis|\s+úteis)?\b/i,
  ]

  for (const re of patterns) {
    const m = normalized.match(re)
    if (!m) continue

    // digit-first
    const digit = m[1] ? Number(m[1]) : NaN
    if (Number.isFinite(digit) && digit > 0 && digit <= 365) {
      return digit
    }

    // word number (m[1] could be word, or m[2] in parentheses)
    const maybeWord = m[2] || m[1]
    if (typeof maybeWord === 'string') {
      const parsed = parseWordNumber(maybeWord)
      if (parsed != null && parsed > 0 && parsed <= 365) return parsed
    }
  }

  return null
}






