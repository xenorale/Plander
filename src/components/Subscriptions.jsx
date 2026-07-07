import { useEffect, useState } from 'react'
import { Plus, Trash2, CreditCard } from 'lucide-react'
import { loadData, saveData } from '../lib/storage.js'
import { defaultSubscriptions } from '../data/defaults.js'
import { formatDay } from '../lib/date.js'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function Subscriptions() {
  const [subs, setSubs] = useState([])
  const [ready, setReady] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [period, setPeriod] = useState('monthly')
  const [nextDate, setNextDate] = useState('')

  useEffect(() => {
    ;(async () => {
      const s = await loadData('subscriptions', defaultSubscriptions)
      setSubs(s)
      setReady(true)
    })()
  }, [])

  useEffect(() => {
    if (ready) saveData('subscriptions', subs)
  }, [subs, ready])

  function add() {
    const value = parseFloat(price)
    if (!name.trim() || !value) return
    setSubs([...subs, { id: uid(), name: name.trim(), price: value, period, nextDate: nextDate || null }])
    setName('')
    setPrice('')
    setNextDate('')
    setPeriod('monthly')
  }
  function remove(id) {
    setSubs(subs.filter((s) => s.id !== id))
  }

  const monthly = subs.reduce((sum, s) => sum + (s.period === 'yearly' ? s.price / 12 : s.price), 0)

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div className="card flex items-center justify-between p-5">
        <div>
          <p className="text-cocoa/60">в месяц уходит примерно</p>
          <p className="font-script text-5xl font-bold text-ink">{Math.round(monthly)} ₽</p>
        </div>
        <div className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-cocoa/40 bg-amber/30">
          <CreditCard size={30} />
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-3 flex flex-col gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="сервис"
            className="rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 outline-none focus:border-pine"
          />
          <div className="flex flex-wrap gap-2">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="₽"
              type="number"
              className="w-20 rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 outline-none focus:border-pine"
            />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 outline-none"
            >
              <option value="monthly">в месяц</option>
              <option value="yearly">в год</option>
            </select>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="flex-1 rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 text-cocoa/80 outline-none"
            />
            <button onClick={add} className="btn bg-pine text-cream">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {subs.length === 0 && <li className="py-6 text-center text-cocoa/50">подписок пока нет, и это здорово</li>}
          {subs.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-xl border-2 border-cocoa/20 bg-white/60 px-4 py-3">
              <span className="flex-1 text-lg text-ink">{s.name}</span>
              {s.nextDate && <span className="chip bg-cream text-xs text-cocoa/70">спишут {formatDay(s.nextDate)}</span>}
              <span className="text-sm text-cocoa/60">{s.period === 'yearly' ? 'в год' : 'в месяц'}</span>
              <span className="w-20 text-right font-bold text-ink">{s.price} ₽</span>
              <button onClick={() => remove(s.id)} className="text-cocoa/40 hover:text-clay">
                <Trash2 size={17} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
