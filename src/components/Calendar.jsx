import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, MapPin, X, CreditCard } from 'lucide-react'
import { dateKey, formatDay } from '../lib/date.js'

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]
const WD = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
const EVENT_TONES = ['denim', 'olive', 'clay', 'slate', 'amber', 'pine']
const TONE_BG = { denim: 'bg-denim', olive: 'bg-olive', clay: 'bg-clay', slate: 'bg-slate', amber: 'bg-amber', pine: 'bg-pine' }

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function byTime(a, b) {
  return (a.time || '99:99') > (b.time || '99:99') ? 1 : -1
}

export default function Calendar({ tasks, setTasks, events, setEvents, subs, categories }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(dateKey(now.getFullYear(), now.getMonth(), now.getDate()))
  const [multi, setMulti] = useState(false)
  const [picked, setPicked] = useState([])
  const [tripName, setTripName] = useState('')
  const [taskText, setTaskText] = useState('')
  const [taskTime, setTaskTime] = useState('')

  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const dueByDay = {}
  tasks.forEach((t) => {
    if (t.due && !t.done) dueByDay[t.due] = (dueByDay[t.due] || 0) + 1
  })
  const eventByDay = {}
  events.forEach((e) => e.dates.forEach((k) => { if (!eventByDay[k]) eventByDay[k] = e }))
  const subByDay = {}
  subs.forEach((s) => {
    if (!s.nextDate) return
    if (!subByDay[s.nextDate]) subByDay[s.nextDate] = []
    subByDay[s.nextDate].push(s)
  })

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

  function clickDay(d) {
    const key = dateKey(year, month, d)
    if (multi) {
      setPicked((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]))
    } else {
      setSelected(key)
    }
  }

  function saveTrip() {
    if (!tripName.trim() || picked.length === 0) return
    const color = EVENT_TONES[events.length % EVENT_TONES.length]
    setEvents([...events, { id: uid(), title: tripName.trim(), dates: [...picked].sort(), color }])
    setTripName('')
    setPicked([])
    setMulti(false)
  }
  function cancelTrip() {
    setPicked([])
    setTripName('')
    setMulti(false)
  }
  function removeEvent(id) {
    setEvents(events.filter((e) => e.id !== id))
  }

  function addTaskToDay() {
    const value = taskText.trim()
    const cat = categories[0] ? categories[0].id : null
    if (!value || !cat) return
    setTasks([...tasks, { id: uid(), categoryId: cat, text: value, done: false, due: selected, time: taskTime || null }])
    setTaskText('')
    setTaskTime('')
  }
  function toggleTask(id) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const dayTasks = tasks.filter((t) => t.due === selected).slice().sort(byTime)
  const dayEvents = events.filter((e) => e.dates.includes(selected))
  const daySubs = subs.filter((s) => s.nextDate === selected)
  const isToday = (d) => d === now.getDate() && month === now.getMonth() && year === now.getFullYear()

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => move(-1)} className="btn px-3">
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-script text-2xl text-cocoa">
          {MONTHS[month]} {year}
        </h2>
        <button onClick={() => move(1)} className="btn px-3">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="card p-4">
        <div className="mb-2 grid grid-cols-7 text-center text-sm text-cocoa/60">
          {WD.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />
            const key = dateKey(year, month, d)
            const count = dueByDay[key] || 0
            const ev = eventByDay[key]
            const picked2 = picked.includes(key)
            const sel = !multi && key === selected
            return (
              <button
                key={i}
                onClick={() => clickDay(d)}
                className={
                  'relative grid h-12 place-items-center rounded-xl border-2 transition-all ' +
                  (picked2
                    ? 'border-pine bg-pine/25'
                    : sel
                    ? 'border-pine bg-pine/10'
                    : isToday(d)
                    ? 'border-cocoa/50 bg-cream'
                    : 'border-cocoa/15 bg-white/50')
                }
              >
                <span className="text-ink">{d}</span>
                {count > 0 && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-clay" />}
                {subByDay[key] && <span className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-amber" />}
                {ev && <span className={'absolute bottom-1 h-1.5 w-6 rounded-full ' + (TONE_BG[ev.color] || 'bg-denim')} />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-cocoa/60">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-clay" /> задачи</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber" /> подписки</span>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-full bg-denim" /> события</span>
      </div>

      {multi ? (
        <div className="card flex flex-col gap-2 p-4">
          <p className="text-sm text-cocoa/70">тыкай дни в календаре, выбрано: {picked.length}</p>
          <div className="flex gap-2">
            <input
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveTrip()}
              placeholder="например Поездка"
              className="flex-1 rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 outline-none focus:border-pine"
            />
            <button onClick={saveTrip} className="btn bg-pine text-cream">
              <Check size={18} />
            </button>
            <button onClick={cancelTrip} className="btn">
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setMulti(true)} className="btn self-start bg-white/70">
          <MapPin size={16} /> отметить период
        </button>
      )}

      {!multi && (
        <div className="card flex flex-col gap-3 p-4">
          <h3 className="font-script text-2xl text-cocoa">{formatDay(selected)}</h3>

          {dayEvents.map((e) => (
            <div key={e.id} className="flex items-center gap-2 rounded-xl border-2 border-cocoa/20 bg-white/60 px-3 py-2">
              <span className={'h-3 w-3 rounded-full ' + (TONE_BG[e.color] || 'bg-denim')} />
              <span className="flex-1 text-ink">{e.title}</span>
              <span className="text-xs text-cocoa/50">{e.dates.length} дн</span>
              <button onClick={() => removeEvent(e.id)} className="text-cocoa/40 hover:text-clay">
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {daySubs.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-xl border-2 border-cocoa/20 bg-amber/15 px-3 py-2">
              <CreditCard size={16} className="text-cocoa/60" />
              <span className="flex-1 text-ink">{s.name}</span>
              <span className="text-sm text-cocoa/70">спишут {s.price} ₽</span>
            </div>
          ))}

          {dayTasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl border-2 border-cocoa/20 bg-white/60 px-3 py-2">
              <button
                onClick={() => toggleTask(t.id)}
                className={'grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 border-cocoa/50 ' + (t.done ? 'bg-pine' : 'bg-white')}
              >
                {t.done && <Check size={15} className="text-cream" />}
              </button>
              {t.time && <span className="chip bg-amber/25 text-xs">{t.time}</span>}
              <span className={'flex-1 ' + (t.done ? 'text-cocoa/40 line-through' : 'text-ink')}>{t.text}</span>
            </div>
          ))}

          {dayTasks.length === 0 && dayEvents.length === 0 && daySubs.length === 0 && (
            <p className="text-cocoa/50">на этот день ничего нет</p>
          )}

          <div className="flex gap-2">
            <input
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTaskToDay()}
              placeholder="добавить дело"
              className="flex-1 rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 outline-none focus:border-pine"
            />
            <input
              type="time"
              value={taskTime}
              onChange={(e) => setTaskTime(e.target.value)}
              className="rounded-xl border-2 border-cocoa/30 bg-white/80 px-2 py-2 text-cocoa/80 outline-none"
            />
            <button onClick={addTaskToDay} className="btn bg-pine text-cream">
              <Plus size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
