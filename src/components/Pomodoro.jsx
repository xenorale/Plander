import { useEffect, useState } from 'react'
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react'
import { notify } from '../lib/storage.js'
import { todayKey, localKey, formatDuration } from '../lib/date.js'

const DURATIONS = { work: 25 * 60, short: 5 * 60, long: 15 * 60 }
const LABELS = { work: 'Фокус', short: 'Перерыв', long: 'Долгий перерыв' }

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function Pomodoro({ focusLog, setFocusLog, label, setLabel, tasks = [] }) {
  const [mode, setMode] = useState('work')
  const [left, setLeft] = useState(DURATIONS.work)
  const [running, setRunning] = useState(false)
  const [cycles, setCycles] = useState(0)
  const [taskId, setTaskId] = useState('')

  const openTasks = tasks.filter((t) => !t.done)

  function pickTask(id) {
    setTaskId(id)
    const t = tasks.find((x) => x.id === id)
    if (t) setLabel(t.text)
  }
  function changeLabel(value) {
    setLabel(value)
    setTaskId('')
  }

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setLeft((v) => v - 1), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (left > 0) return
    setRunning(false)
    if (mode === 'work') {
      const name = (label || '').trim() || 'Без задачи'
      const entry = {
        id: Math.random().toString(36).slice(2, 9),
        label: name,
        taskId: taskId || null,
        minutes: DURATIONS.work / 60,
        ts: Date.now()
      }
      setFocusLog((prev) => [...prev, entry])
      const done = cycles + 1
      setCycles(done)
      notify('Помидорка готова', `Записал ${entry.minutes} минут на «${name}». Можно передохнуть`)
      change(done % 4 === 0 ? 'long' : 'short')
    } else {
      notify('Перерыв закончился', 'Погнали дальше')
      change('work')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left])

  function change(next) {
    setMode(next)
    setLeft(DURATIONS[next])
  }
  function pick(next) {
    setRunning(false)
    change(next)
  }
  function skip() {
    setRunning(false)
    change(mode === 'work' ? 'short' : 'work')
  }

  const radius = 120
  const circ = 2 * Math.PI * radius
  const offset = circ * (left / DURATIONS[mode])
  const ring = mode === 'work' ? '#41725f' : mode === 'short' ? '#cf9a48' : '#5f7480'

  const name = (label || '').trim() || 'Без задачи'
  const todayMin = focusLog.filter((e) => localKey(e.ts) === todayKey()).reduce((s, e) => s + e.minutes, 0)
  const curMin = focusLog.filter((e) => e.label === name).reduce((s, e) => s + e.minutes, 0)

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5">
      <input
        value={label}
        onChange={(e) => changeLabel(e.target.value)}
        placeholder="над чем фокусируемся?"
        className="w-full rounded-2xl border-2 border-cocoa/30 bg-white/70 px-4 py-3 text-center text-lg outline-none focus:border-pine"
      />

      {openTasks.length > 0 && (
        <select
          value={taskId}
          onChange={(e) => pickTask(e.target.value)}
          className="w-full rounded-2xl border-2 border-cocoa/30 bg-white/70 px-4 py-2 text-center outline-none focus:border-pine"
        >
          <option value="">или выбери задачу из списка</option>
          {openTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.text}
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center gap-2">
        {['work', 'short', 'long'].map((m) => (
          <button key={m} onClick={() => pick(m)} className={'chip ' + (mode === m ? 'border-pine bg-pine/20' : 'bg-white/60')}>
            {LABELS[m]}
          </button>
        ))}
      </div>

      <div className="relative grid place-items-center">
        <svg width="270" height="270" className="-rotate-90">
          <circle cx="135" cy="135" r={radius} fill="none" stroke="rgba(90,80,69,0.15)" strokeWidth="15" />
          <circle
            cx="135"
            cy="135"
            r={radius}
            fill="none"
            stroke={ring}
            strokeWidth="15"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.4s linear' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-script text-6xl font-bold text-ink">
            {pad(Math.floor(left / 60))}:{pad(left % 60)}
          </span>
          <span className="text-cocoa/70">{LABELS[mode]}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => pick(mode)} className="btn">
          <RotateCcw size={20} />
        </button>
        <button onClick={() => setRunning((r) => !r)} className="btn bg-pine px-8 text-lg text-cream">
          {running ? <Pause size={22} /> : <Play size={22} />}
          {running ? 'Пауза' : 'Старт'}
        </button>
        <button onClick={skip} className="btn">
          <SkipForward size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={'h-3 w-3 rounded-full border-2 border-cocoa/40 ' + (i < cycles % 4 ? 'bg-pine' : 'bg-transparent')} />
        ))}
      </div>

      <div className="card grid w-full grid-cols-2 gap-3 p-4 text-center">
        <div>
          <p className="text-sm text-cocoa/60">сегодня в фокусе</p>
          <p className="font-script text-3xl font-bold text-ink">{formatDuration(todayMin)}</p>
        </div>
        <div>
          <p className="truncate text-sm text-cocoa/60">на «{name}»</p>
          <p className="font-script text-3xl font-bold text-ink">{formatDuration(curMin)}</p>
        </div>
      </div>
    </div>
  )
}
