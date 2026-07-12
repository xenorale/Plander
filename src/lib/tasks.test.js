import { describe, it, expect } from 'vitest'
import { toggleTask } from './tasks.js'

describe('toggleTask', () => {
  it('flips done on a plain task without spawning anything', () => {
    const tasks = [{ id: 't1', categoryId: 'c1', text: 'foo', done: false, due: null, time: null, repeat: null }]
    const next = toggleTask(tasks, 't1')
    expect(next).toHaveLength(1)
    expect(next[0].done).toBe(true)
  })
  it('un-marks a done task and spawns nothing', () => {
    const tasks = [{ id: 't1', categoryId: 'c1', text: 'foo', done: true, due: '2026-07-12', time: null, repeat: 'daily' }]
    const next = toggleTask(tasks, 't1')
    expect(next).toHaveLength(1)
    expect(next[0].done).toBe(false)
  })
  it('spawns the next occurrence when completing a repeating task', () => {
    const tasks = [{ id: 't1', categoryId: 'c1', text: 'полить цветы', done: false, due: '2026-07-12', time: '09:00', repeat: 'daily' }]
    const next = toggleTask(tasks, 't1')
    expect(next).toHaveLength(2)
    expect(next[0].done).toBe(true)
    const spawned = next[1]
    expect(spawned.done).toBe(false)
    expect(spawned.due).toBe('2026-07-13')
    expect(spawned.text).toBe('полить цветы')
    expect(spawned.repeat).toBe('daily')
    expect(spawned.id).not.toBe('t1')
  })
  it('does not spawn a next occurrence when the repeating task has no due date', () => {
    const tasks = [{ id: 't1', categoryId: 'c1', text: 'foo', done: false, due: null, time: null, repeat: 'weekly' }]
    const next = toggleTask(tasks, 't1')
    expect(next).toHaveLength(1)
  })
  it('returns the same array when the id is not found', () => {
    const tasks = [{ id: 't1', categoryId: 'c1', text: 'foo', done: false, due: null, time: null, repeat: null }]
    expect(toggleTask(tasks, 'missing')).toBe(tasks)
  })
})
