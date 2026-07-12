import { describe, it, expect } from 'vitest'
import { rollForward, rollForwardAll } from './subscriptions.js'

describe('rollForward', () => {
  it('leaves a future date untouched', () => {
    const sub = { period: 'monthly', nextDate: '2026-08-01' }
    expect(rollForward(sub, '2026-07-12')).toBe(sub)
  })
  it('advances a monthly subscription past today', () => {
    const sub = { period: 'monthly', nextDate: '2026-05-01' }
    const rolled = rollForward(sub, '2026-07-12')
    expect(rolled.nextDate).toBe('2026-08-01')
  })
  it('advances a yearly subscription past today', () => {
    const sub = { period: 'yearly', nextDate: '2024-07-01' }
    const rolled = rollForward(sub, '2026-07-12')
    expect(rolled.nextDate).toBe('2027-07-01')
  })
  it('leaves subscriptions without a nextDate untouched', () => {
    const sub = { period: 'monthly', nextDate: null }
    expect(rollForward(sub, '2026-07-12')).toBe(sub)
  })
})

describe('rollForwardAll', () => {
  it('only replaces entries that actually rolled forward', () => {
    const subs = [
      { id: 'a', period: 'monthly', nextDate: '2026-05-01' },
      { id: 'b', period: 'monthly', nextDate: '2026-08-01' }
    ]
    const next = rollForwardAll(subs, '2026-07-12')
    expect(next[0].nextDate).toBe('2026-08-01')
    expect(next[1]).toBe(subs[1])
  })
  it('returns the same array reference when nothing changed', () => {
    const subs = [{ id: 'a', period: 'monthly', nextDate: '2026-08-01' }]
    expect(rollForwardAll(subs, '2026-07-12')).toBe(subs)
  })
})
