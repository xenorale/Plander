import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react'
import Stats from './Stats.jsx'
import { loadData, saveData, notify } from '../lib/storage.js'

const DURATIONS = { work: 25 * 60, short: 5 * 60, long: 15 * 60 }
const LABELS = { work: 'Фокус', short: 'Перерыв', long: 'Долгий перерыв' }

function todayKey() {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function Pomodoro() {
  const [mode, setMode] = useState('work')
  const [left, setLeft] = useState(DURATIONS.work)
  const [running, setRunning] = useState(false)
  const [cycles, setCycles] = useState(0)
  const [stats, setStats] = useState({})
  const ready = useRef(false)

  useEffect(() => {
    ;(async () => {
      const s = await loadData('pomodoroStats', {})
      setStats(s)
      ready.current = true
    })()
  }, [])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setLeft((v) => v - 1), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (left > 0) return
    setRunning(false)
    if (mode === 'work') {
      const key = todayKey()
      setStats((prev) => {
        const updated = { ...prev, [key]: (prev[key] || 0) + 1 }
        saveData('pomodoroStats', updated)
        return updated
      })
      const done = cycles + 1
      setCycles(done)
      notify('Помидорка готова 🍅', 'Отдохни немного, ты молодец')
      change(done % 4 === 0 ? 'long' : 'short')
    } else {
      notify('Перерыв закончился', 'Погнали работать')
      change('work')
    }
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

  const total = DURATIONS[mode]
  const radius = 130
  const circ = 2 * Math.PI * radius
  const offset = circ * (left / total)
  const ring = mode === 'work' ? '#e8a7b4' : mode === 'short' ? '#9fceb6' : '#b3a4e0'

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-7">
      <div className="flex items-center gap-3">
        {['work', 'short', 'long'].map((m) => (
          <button key={m} onClick={() => pick(m)} className={'chip ' + (mode === m ? 'bg-lavender' : 'bg-white/60')}>
            {LABELS[m]}
          </button>
        ))}
      </div>

      <div className="relative grid place-items-center">
        <svg width="300" height="300" className="-rotate-90">
          <circle cx="150" cy="150" r={radius} fill="none" stroke="rgba(107,91,75,0.14)" strokeWidth="16" />
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            stroke={ring}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.4s linear' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-script text-7xl font-bold text-ink">
            {pad(Math.floor(left / 60))}:{pad(left % 60)}
          </span>
          <span className="text-cocoa/70">{LABELS[mode]}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => pick(mode)} className="btn">
          <RotateCcw size={20} />
        </button>
        <button onClick={() => setRunning((r) => !r)} className="btn bg-blush px-8 text-lg">
          {running ? <Pause size={22} /> : <Play size={22} />}
          {running ? 'Пауза' : 'Старт'}
        </button>
        <button onClick={skip} className="btn">
          <SkipForward size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-cocoa/70">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={'h-3 w-3 rounded-full border-2 border-cocoa/40 ' + (i < cycles % 4 ? 'bg-rose' : 'bg-transparent')}
          />
        ))}
        <span className="ml-2 text-sm">закрыто сегодня: {stats[todayKey()] || 0}</span>
      </div>

      <Stats data={stats} />
    </div>
  )
}
