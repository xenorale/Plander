const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

export function localKey(input) {
  const d = input instanceof Date ? input : new Date(input)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey() {
  return localKey(new Date())
}

export function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function formatDay(key) {
  if (!key) return ''
  const [, m, d] = key.split('-')
  return `${d}.${m}`
}

export function weekdayName(key) {
  const [y, m, d] = key.split('-').map(Number)
  return WEEKDAYS[new Date(y, m - 1, d).getDay()]
}

export function advanceByRepeat(key, repeat) {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (repeat === 'daily') date.setDate(date.getDate() + 1)
  else if (repeat === 'weekly') date.setDate(date.getDate() + 7)
  else if (repeat === 'monthly') date.setMonth(date.getMonth() + 1)
  else return key
  return localKey(date)
}

export function formatDuration(mins) {
  const m = Math.round(mins)
  if (m < 60) return `${m} мин`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h} ч ${r} мин` : `${h} ч`
}
