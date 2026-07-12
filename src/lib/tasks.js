import { advanceByRepeat } from './date.js'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function toggleTask(tasks, id) {
  const t = tasks.find((x) => x.id === id)
  if (!t) return tasks
  const willBeDone = !t.done
  let next = tasks.map((x) => (x.id === id ? { ...x, done: willBeDone } : x))
  if (willBeDone && t.repeat && t.due) {
    const nextDue = advanceByRepeat(t.due, t.repeat)
    next = [
      ...next,
      { id: uid(), categoryId: t.categoryId, text: t.text, done: false, due: nextDue, time: t.time || null, repeat: t.repeat }
    ]
  }
  return next
}
