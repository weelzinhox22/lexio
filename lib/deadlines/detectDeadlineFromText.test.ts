import { describe, expect, it } from 'vitest'
import { detectDeadlineFromText } from './detectDeadlineFromText'

describe('detectDeadlineFromText (rule-based)', () => {
  it('detecta prazo com número explícito: "prazo de 15 dias"', () => {
    const r = detectDeadlineFromText('Intime-se a parte autora para, no prazo de 15 dias, manifestar-se.')
    expect(r.deadline_detected).toBe(true)
    expect(r.deadline_days).toBe(15)
    expect(r.confidence_score).toBeGreaterThanOrEqual(0.7)
    expect(r.confidence_score).toBeLessThan(1)
    expect(r.matched_keywords).toContain('intime-se')
    expect(r.matched_keywords).toContain('no prazo de')
  })

  it('detecta prazo com número e palavra entre parênteses: "em 5 (cinco) dias"', () => {
    const r = detectDeadlineFromText('Apresentar documentos em 5 (cinco) dias, sob pena de indeferimento.')
    expect(r.deadline_detected).toBe(true)
    expect(r.deadline_days).toBe(5)
    expect(r.matched_keywords).toContain('sob pena de')
  })

  it('detecta prazo com número por extenso: "prazo de quinze dias"', () => {
    const r = detectDeadlineFromText('Concedo o prazo de quinze dias para juntar comprovantes.')
    expect(r.deadline_detected).toBe(true)
    expect(r.deadline_days).toBe(15)
    expect(r.confidence_score).toBeGreaterThanOrEqual(0.7)
  })

  it('keyword apenas (sem número) => baixa confiança e deadline_days null', () => {
    const r = detectDeadlineFromText('No prazo legal, aguarde-se a manifestação da parte.')
    expect(r.deadline_detected).toBe(true)
    expect(r.deadline_days).toBeNull()
    expect(r.confidence_score).toBeCloseTo(0.4, 2)
  })

  it('não detecta quando não há sinal de prazo', () => {
    const r = detectDeadlineFromText('Juntada de petição intermediária.')
    expect(r.deadline_detected).toBe(false)
    expect(r.deadline_days).toBeNull()
    expect(r.confidence_score).toBe(0)
  })

  it('evita falso positivo explícito: "sem prazo"', () => {
    const r = detectDeadlineFromText('Certifico que não há prazo pendente / sem prazo.')
    expect(r.deadline_detected).toBe(false)
    expect(r.deadline_days).toBeNull()
    expect(r.confidence_score).toBe(0)
  })

  it('nunca retorna confiança 1', () => {
    const r = detectDeadlineFromText('Intime-se no prazo de 10 dias, sob pena de multa.')
    expect(r.confidence_score).toBeLessThan(1)
    expect(r.confidence_score).toBeLessThanOrEqual(0.9)
  })
})


