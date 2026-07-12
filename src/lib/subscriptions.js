import { localKey } from './date.js'

function addPeriod(dateKeyStr, period) {
  const [y, m, d] = dateKeyStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (period === 'yearly') date.setFullYear(date.getFullYear() + 1)
  else date.setMonth(date.getMonth() + 1)
  return localKey(date)
}

export function rollForward(sub, todayKeyStr) {
  if (!sub.nextDate) return sub
  let next = sub.nextDate
  let guard = 0
  while (next < todayKeyStr && guard < 1000) {
    next = addPeriod(next, sub.period)
    guard++
  }
  return next === sub.nextDate ? sub : { ...sub, nextDate: next }
}

export function rollForwardAll(subs, todayKeyStr) {
  let changed = false
  const next = subs.map((s) => {
    const rolled = rollForward(s, todayKeyStr)
    if (rolled !== s) changed = true
    return rolled
  })
  return changed ? next : subs
}
