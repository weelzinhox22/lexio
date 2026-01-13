import { describe, expect, it } from 'vitest'
import { isEligibleForDeadlineEmail } from './deadline-email-eligibility'

describe('deadline-email-eligibility', () => {
  it('não envia se email_enabled=false', () => {
    expect(
      isEligibleForDeadlineEmail({
        emailEnabled: false,
        alertDays: [7, 3, 1, 0],
        daysRemaining: 3,
        toEmail: 'a@b.com',
      })
    ).toBe(false)
  })

  it('não envia se e-mail vazio', () => {
    expect(
      isEligibleForDeadlineEmail({
        emailEnabled: true,
        alertDays: [7, 3, 1, 0],
        daysRemaining: 3,
        toEmail: '',
      })
    ).toBe(false)
  })

  it('não envia se daysRemaining não estiver em alertDays', () => {
    expect(
      isEligibleForDeadlineEmail({
        emailEnabled: true,
        alertDays: [7, 1, 0],
        daysRemaining: 3,
        toEmail: 'a@b.com',
      })
    ).toBe(false)
  })

  it('não envia para vencidos (dias < 0)', () => {
    expect(
      isEligibleForDeadlineEmail({
        emailEnabled: true,
        alertDays: [7, 3, 1, 0],
        daysRemaining: -1,
        toEmail: 'a@b.com',
      })
    ).toBe(false)
  })

  it('envia quando habilitado e dentro da janela (ex: 1 dia)', () => {
    expect(
      isEligibleForDeadlineEmail({
        emailEnabled: true,
        alertDays: [7, 3, 1, 0],
        daysRemaining: 1,
        toEmail: 'a@b.com',
      })
    ).toBe(true)
  })
})




