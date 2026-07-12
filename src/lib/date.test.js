import { describe, it, expect } from 'vitest'
import { localKey, dateKey, formatDay, weekdayName, formatDuration, advanceByRepeat } from './date.js'

describe('localKey', () => {
  it('formats a Date using local y-m-d with zero padding', () => {
    expect(localKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
  it('accepts a timestamp or date string', () => {
    expect(localKey(new Date(2026, 6, 12).getTime())).toBe('2026-07-12')
  })
})

describe('dateKey', () => {
  it('builds a key from zero-based month', () => {
    expect(dateKey(2026, 0, 5)).toBe('2026-01-05')
  })
})

describe('formatDay', () => {
  it('formats as day.month', () => {
    expect(formatDay('2026-07-12')).toBe('12.07')
  })
  it('returns empty string for falsy input', () => {
    expect(formatDay(null)).toBe('')
  })
})

describe('weekdayName', () => {
  it('returns the short russian weekday name', () => {
    expect(weekdayName('2026-07-12')).toBe('вс')
  })
})

describe('formatDuration', () => {
  it('formats minutes under an hour', () => {
    expect(formatDuration(45)).toBe('45 мин')
  })
  it('formats whole hours without a remainder', () => {
    expect(formatDuration(120)).toBe('2 ч')
  })
  it('formats hours with a remainder', () => {
    expect(formatDuration(125)).toBe('2 ч 5 мин')
  })
})

describe('advanceByRepeat', () => {
  it('advances by a day', () => {
    expect(advanceByRepeat('2026-07-12', 'daily')).toBe('2026-07-13')
  })
  it('advances by a week', () => {
    expect(advanceByRepeat('2026-07-12', 'weekly')).toBe('2026-07-19')
  })
  it('advances by a month and handles month-length overflow', () => {
    expect(advanceByRepeat('2026-01-31', 'monthly')).toBe('2026-03-03')
  })
  it('returns the same key when repeat is falsy', () => {
    expect(advanceByRepeat('2026-07-12', null)).toBe('2026-07-12')
  })
})
