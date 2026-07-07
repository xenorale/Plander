import { useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

const TONES = {
  blush: 'bg-blush',
  mint: 'bg-mint',
  lavender: 'bg-lavender',
  sage: 'bg-sage'
}

export default function Todo({ tasks, setTasks, categories, setCategories }) {
  const [active, setActive] = useState(categories[0] ? categories[0].id : null)
  const [text, setText] = useState('')
  const [due, setDue] = useState('')
  const [newCat, setNewCat] = useState('')
  const [adding, setAdding] = useState(false)

  const shown = tasks.filter((t) => t.categoryId === active)

  function addTask() {
    const value = text.trim()
    if (!value || !active) return
    setTasks([...tasks, { id: uid(), categoryId: active, text: value, done: false, due: due || null }])
    setText('')
    setDue('')
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
    const tones = ['blush', 'mint', 'lavender', 'sage']
    setCategories([...categories, { id, name: value, color: tones[categories.length % tones.length] }])
    setActive(id)
    setNewCat('')
    setAdding(false)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={'chip flex items-center gap-2 ' + (active === c.id ? TONES[c.color] || 'bg-lavender' : 'bg-white/60')}
          >
            <span className={'h-3 w-3 rounded-full ' + (TONES[c.color] || 'bg-lavender')} />
            {c.name}
          </button>
        ))}
        {adding ? (
          <span className="flex items-center gap-2">
            <input
              autoFocus
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              placeholder="название"
              className="chip bg-white outline-none"
            />
            <button onClick={addCategory} className="btn px-3 py-1">
              <Check size={16} />
            </button>
          </span>
        ) : (
          <button onClick={() => setAdding(true)} className="chip flex items-center gap-1 bg-white/60">
            <Plus size={16} /> категория
          </button>
        )}
      </div>

      <div className="card p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="что нужно сделать?"
            className="flex-1 rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 outline-none"
          />
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 text-cocoa/80 outline-none"
          />
          <button onClick={addTask} className="btn bg-mint">
            <Plus size={18} /> добавить
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          {shown.length === 0 && <li className="py-6 text-center text-cocoa/50">пока пусто, добавь первую задачу</li>}
          {shown.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-xl border-2 border-cocoa/20 bg-white/60 px-3 py-2">
              <button
                onClick={() => toggle(t.id)}
                className={'grid h-6 w-6 place-items-center rounded-lg border-2 border-cocoa/50 ' + (t.done ? 'bg-sage' : 'bg-white')}
              >
                {t.done && <Check size={15} />}
              </button>
              <span className={'flex-1 ' + (t.done ? 'text-cocoa/40 line-through' : 'text-ink')}>{t.text}</span>
              {t.due && <span className="chip bg-cream text-xs text-cocoa/70">{t.due.slice(5)}</span>}
              <button onClick={() => remove(t.id)} className="text-cocoa/40 hover:text-rose">
                <Trash2 size={17} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
