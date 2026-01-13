import { describe, expect, it } from 'vitest'
import { buildAlertPlan, computeAlertStatus, daysUntilUTC } from './alert-engine'

function mkDeadline(overrides: Partial<any> = {}) {
  return {
    id: 'd1',
    user_id: 'u1',
    process_id: 'p1',
    title: 'Protocolar contestação',
    description: null,
    deadline_date: overrides.deadline_date ?? new Date().toISOString(),
    status: overrides.status ?? 'pending',
    acknowledged_at: overrides.acknowledged_at ?? null,
    alert_status: overrides.alert_status ?? null,
  }
}

describe('alert-engine', () => {
  it('daysUntilUTC: amanhã => 1', () => {
    const now = new Date(Date.UTC(2026, 0, 12, 12, 0, 0))
    const tomorrow = new Date(Date.UTC(2026, 0, 13, 9, 0, 0)).toISOString()
    expect(daysUntilUTC(tomorrow, now)).toBe(1)
  })

  it('computeAlertStatus: <=2 dias => urgent', () => {
    const now = new Date(Date.UTC(2026, 0, 12, 12, 0, 0))
    const dueTomorrow = new Date(Date.UTC(2026, 0, 13, 12, 0, 0)).toISOString()
    const d = mkDeadline({ deadline_date: dueTomorrow, status: 'pending' })
    expect(computeAlertStatus(d, now)).toBe('urgent')
  })

  it('computeAlertStatus: vencido => overdue', () => {
    const now = new Date(Date.UTC(2026, 0, 12, 12, 0, 0))
    const yesterday = new Date(Date.UTC(2026, 0, 11, 12, 0, 0)).toISOString()
    const d = mkDeadline({ deadline_date: yesterday, status: 'pending' })
    expect(computeAlertStatus(d, now)).toBe('overdue')
  })

  it('buildAlertPlan: 7 dias => info + dedupe keys', () => {
    const now = new Date(Date.UTC(2026, 0, 12, 12, 0, 0))
    const due = new Date(Date.UTC(2026, 0, 19, 12, 0, 0)).toISOString()
    const d = mkDeadline({ deadline_date: due })
    const plans = buildAlertPlan(d, now)
    expect(plans.length).toBe(1)
    expect(plans[0].rule).toBe('DUE_IN_7_DAYS')
    expect(plans[0].severity).toBe('info')
    expect(plans[0].dedupeKeyInApp).toContain('DUE_IN_7_DAYS')
  })

  it('buildAlertPlan: hoje => danger + modal', () => {
    const now = new Date(Date.UTC(2026, 0, 12, 12, 0, 0))
    const dueToday = new Date(Date.UTC(2026, 0, 12, 8, 0, 0)).toISOString()
    const d = mkDeadline({ deadline_date: dueToday })
    const plans = buildAlertPlan(d, now)
    expect(plans[0].rule).toBe('DUE_TODAY')
    expect(plans[0].severity).toBe('danger')
    expect(plans[0].shouldOpenModal).toBe(true)
  })

  it('buildAlertPlan: vencido => persistent in-app', () => {
    const now = new Date(Date.UTC(2026, 0, 12, 12, 0, 0))
    const dueYesterday = new Date(Date.UTC(2026, 0, 11, 8, 0, 0)).toISOString()
    const d = mkDeadline({ deadline_date: dueYesterday })
    const plans = buildAlertPlan(d, now)
    expect(plans[0].rule).toBe('OVERDUE')
    expect(plans[0].persistent).toBe(true)
    expect(plans[0].dedupeKeyInApp).toContain('OVERDUE')
  })
})



