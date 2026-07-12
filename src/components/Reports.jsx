import { todayKey, localKey, formatDuration, weekdayName } from '../lib/date.js'

function lastDays(n) {
  const arr = []
  const base = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(base)
    x.setDate(base.getDate() - i)
    arr.push(localKey(x))
  }
  return arr
}

const BUCKETS = [
  { name: 'Ночь', from: 0, to: 6 },
  { name: 'Утро', from: 6, to: 12 },
  { name: 'День', from: 12, to: 18 },
  { name: 'Вечер', from: 18, to: 24 }
]

export default function Reports({ focusLog }) {
  const week = lastDays(7)
  const totalToday = focusLog.filter((e) => localKey(e.ts) === todayKey()).reduce((s, e) => s + e.minutes, 0)
  const totalWeek = focusLog.filter((e) => week.includes(localKey(e.ts))).reduce((s, e) => s + e.minutes, 0)

  const byLabel = {}
  focusLog.forEach((e) => {
    byLabel[e.label] = (byLabel[e.label] || 0) + e.minutes
  })
  const labels = Object.entries(byLabel)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const labelMax = labels.reduce((m, x) => Math.max(m, x[1]), 0) || 1

  const buckets = BUCKETS.map((b) => ({
    name: b.name,
    mins: focusLog
      .filter((e) => {
        const h = new Date(e.ts).getHours()
        return h >= b.from && h < b.to
      })
      .reduce((s, e) => s + e.minutes, 0)
  }))
  const bucketMax = buckets.reduce((m, x) => Math.max(m, x.mins), 0) || 1

  const byDay = week.map((k) => ({
    key: k,
    mins: focusLog.filter((e) => localKey(e.ts) === k).reduce((s, e) => s + e.minutes, 0)
  }))
  const dayMax = byDay.reduce((m, x) => Math.max(m, x.mins), 0) || 1

  const empty = focusLog.length === 0

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-xs text-cocoa/60">сегодня</p>
          <p className="font-script text-2xl font-bold text-ink">{formatDuration(totalToday)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-cocoa/60">за неделю</p>
          <p className="font-script text-2xl font-bold text-ink">{formatDuration(totalWeek)}</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-cocoa/60">сессий</p>
          <p className="font-script text-2xl font-bold text-ink">{focusLog.length}</p>
        </div>
      </div>

      {empty && (
        <p className="card p-8 text-center text-cocoa/50">пока пусто. запусти помодоро на какую нибудь задачу и тут появятся графики</p>
      )}

      {!empty && (
        <div className="card p-4">
          <h3 className="mb-3 text-lg text-cocoa">На что уходит время</h3>
          <div className="flex flex-col gap-2">
            {labels.map(([name, mins]) => (
              <div key={name} className="flex items-center gap-2">
                <span className="w-24 shrink-0 truncate text-sm text-ink">{name}</span>
                <div className="h-5 flex-1 overflow-hidden rounded-lg border-2 border-cocoa/20 bg-white/50">
                  <div className="h-full rounded-md bg-pine/70" style={{ width: `${Math.max(6, (mins / labelMax) * 100)}%` }} />
                </div>
                <span className="w-16 shrink-0 text-right text-sm text-cocoa/70">{formatDuration(mins)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!empty && (
        <div className="card p-4">
          <h3 className="mb-3 text-lg text-cocoa">Когда фокусируешься</h3>
          <div className="flex items-end justify-between gap-3" style={{ height: '140px' }}>
            {buckets.map((b) => (
              <div key={b.name} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-xs text-cocoa/60">{b.mins ? formatDuration(b.mins) : ''}</span>
                <div
                  className="w-full rounded-t-lg border-2 border-cocoa/20 bg-clay/70"
                  style={{ height: `${(b.mins / bucketMax) * 88 + 4}%` }}
                />
                <span className="text-xs text-cocoa/70">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!empty && (
        <div className="card p-4">
          <h3 className="mb-3 text-lg text-cocoa">Последние 7 дней</h3>
          <div className="flex items-end justify-between gap-2" style={{ height: '120px' }}>
            {byDay.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="w-full rounded-t-lg border-2 border-cocoa/20 bg-slate/70"
                  style={{ height: `${(d.mins / dayMax) * 86 + 4}%` }}
                />
                <span className="text-xs text-cocoa/70">{weekdayName(d.key)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
