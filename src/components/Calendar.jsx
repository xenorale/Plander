import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]
const WD = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

function keyOf(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function Calendar({ tasks }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const due = {}
  tasks.forEach((t) => {
    if (t.due && !t.done) due[t.due] = (due[t.due] || 0) + 1
  })

  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function move(step) {
    let m = month + step
    let y = year
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    setMonth(m)
    setYear(y)
  }

  const isToday = (d) => d === now.getDate() && month === now.getMonth() && year === now.getFullYear()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => move(-1)} className="btn px-3">
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-script text-3xl text-cocoa">
          {MONTHS[month]} {year}
        </h2>
        <button onClick={() => move(1)} className="btn px-3">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="card p-5">
        <div className="mb-2 grid grid-cols-7 text-center text-sm text-cocoa/60">
          {WD.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />
            const count = due[keyOf(year, month, d)] || 0
            return (
              <div
                key={i}
                className={
                  'relative grid h-14 place-items-center rounded-xl border-2 ' +
                  (isToday(d) ? 'border-cocoa/60 bg-lavender' : 'border-cocoa/15 bg-white/50')
                }
              >
                <span className="text-ink">{d}</span>
                {count > 0 && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                      <span key={j} className="h-1.5 w-1.5 rounded-full bg-rose" />
                    ))}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <p className="text-center text-sm text-cocoa/50">точками отмечены дни с дедлайнами по задачам</p>
    </div>
  )
}
