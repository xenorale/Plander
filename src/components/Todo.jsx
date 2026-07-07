import { useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import { formatDay } from '../lib/date.js'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

const TONES = { clay: 'bg-clay', pine: 'bg-pine', slate: 'bg-slate', amber: 'bg-amber', olive: 'bg-olive', denim: 'bg-denim' }
const TONE_KEYS = ['clay', 'pine', 'slate', 'amber', 'olive', 'denim']

function byTime(a, b) {
  return (a.time || '99:99') > (b.time || '99:99') ? 1 : -1
}

export default function Todo({ tasks, setTasks, categories, setCategories }) {
  const [active, setActive] = useState(categories[0] ? categories[0].id : null)
  const [text, setText] = useState('')
  const [due, setDue] = useState('')
  const [time, setTime] = useState('')
  const [newCat, setNewCat] = useState('')
  const [adding, setAdding] = useState(false)

  const shown = tasks.filter((t) => t.categoryId === active).slice().sort(byTime)

  function addTask() {
    const value = text.trim()
    if (!value || !active) return
    setTasks([...tasks, { id: uid(), categoryId: active, text: value, done: false, due: due || null, time: time || null }])
    setText('')
    setDue('')
    setTime('')
  }
  function toggle(id) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }
  function remove(id) {
    setTasks(tasks.filter((t) => t.id !== id))
  }
  function addCategory() {
    const value = newCat.trim()
    if (!value) return
    const id = uid()
    setCategories([...categories, { id, name: value, color: TONE_KEYS[categories.length % TONE_KEYS.length] }])
    setActive(id)
    setNewCat('')
    setAdding(false)
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={'chip flex items-center gap-2 ' + (active === c.id ? (TONES[c.color] || 'bg-pine') + ' text-cream' : 'bg-white/60')}
          >
            <span className={'h-3 w-3 rounded-full ' + (TONES[c.color] || 'bg-pine')} />
            {c.name}
          </button>
        ))}
        {adding ? (
          <span className="flex items-center gap-1">
            <input
              autoFocus
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              placeholder="название"
              className="chip bg-white outline-none"
            />
            <button onClick={addCategory} className="btn px-2 py-1">
              <Check size={16} />
            </button>
          </span>
        ) : (
          <button onClick={() => setAdding(true)} className="chip flex items-center gap-1 bg-white/60">
            <Plus size={16} /> категория
          </button>
        )}
      </div>

      <div className="card p-4">
        <div className="mb-3 flex flex-col gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="что нужно сделать?"
            className="rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 outline-none focus:border-pine"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="flex-1 rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 text-cocoa/80 outline-none"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 text-cocoa/80 outline-none"
            />
            <button onClick={addTask} className="btn bg-pine text-cream">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {shown.length === 0 && <li className="py-6 text-center text-cocoa/50">пока пусто, добавь первую задачу</li>}
          {shown.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-xl border-2 border-cocoa/20 bg-white/60 px-3 py-2">
              <button
                onClick={() => toggle(t.id)}
                className={'grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 border-cocoa/50 ' + (t.done ? 'bg-pine' : 'bg-white')}
              >
                {t.done && <Check size={15} className="text-cream" />}
              </button>
              <span className={'flex-1 ' + (t.done ? 'text-cocoa/40 line-through' : 'text-ink')}>{t.text}</span>
              {t.time && <span className="chip bg-amber/25 text-xs">{t.time}</span>}
              {t.due && <span className="chip bg-cream text-xs text-cocoa/70">{formatDay(t.due)}</span>}
              <button onClick={() => remove(t.id)} className="text-cocoa/40 hover:text-clay">
                <Trash2 size={17} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
