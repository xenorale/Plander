const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

function dayFor(offset) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - offset)
  return d
}

function keyOf(d) {
  return d.toISOString().slice(0, 10)
}

function tone(count) {
  if (!count) return 'bg-white/50'
  if (count < 2) return 'bg-mint'
  if (count < 4) return 'bg-sage'
  if (count < 6) return 'bg-rose'
  return 'bg-grape'
}

export default function Stats({ data }) {
  const days = []
  for (let i = 6; i >= 0; i--) days.push(dayFor(i))
  const week = days.reduce((sum, d) => sum + (data[keyOf(d)] || 0), 0)

  return (
    <div className="card w-full p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl text-cocoa">Помидорки за неделю</h3>
        <span className="text-sm text-cocoa/60">всего: {week}</span>
      </div>
      <div className="flex justify-between gap-2">
        {days.map((d) => {
          const c = data[keyOf(d)] || 0
          return (
            <div key={keyOf(d)} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={'grid h-14 w-full place-items-center rounded-xl border-2 border-cocoa/30 ' + tone(c)}
                title={keyOf(d) + ': ' + c}
              >
                <span className="text-lg text-ink">{c || ''}</span>
              </div>
              <span className="text-xs text-cocoa/60">{WD[d.getDay()]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
