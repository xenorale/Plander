import { useState } from 'react'
import { Plus, Check, Trash2, Pencil, X } from 'lucide-react'
import { formatDay } from '../lib/date.js'
import { TONE_KEYS, toneClass } from '../lib/categories.js'
import { toggleTask } from '../lib/tasks.js'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function byTime(a, b) {
  return (a.time || '99:99') > (b.time || '99:99') ? 1 : -1
}

const REPEAT_LABELS = { daily: 'каждый день', weekly: 'каждую неделю', monthly: 'каждый месяц' }

export default function Todo({ tasks, setTasks, categories, setCategories }) {
  const [active, setActive] = useState(categories[0] ? categories[0].id : null)
  const [text, setText] = useState('')
  const [due, setDue] = useState('')
  const [time, setTime] = useState('')
  const [repeat, setRepeat] = useState('')
  const [newCat, setNewCat] = useState('')
  const [adding, setAdding] = useState(false)
  const [managing, setManaging] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editDue, setEditDue] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editRepeat, setEditRepeat] = useState('')
  const [editCat, setEditCat] = useState(null)

  const shown = tasks
    .filter((t) => t.categoryId === active)
    .slice()
    .sort(byTime)

  function addTask() {
    const value = text.trim()
    if (!value || !active) return
    setTasks([
      ...tasks,
      { id: uid(), categoryId: active, text: value, done: false, due: due || null, time: time || null, repeat: repeat || null }
    ])
    setText('')
    setDue('')
    setTime('')
    setRepeat('')
  }
  function toggle(id) {
    setTasks(toggleTask(tasks, id))
  }
  function remove(id) {
    setTasks(tasks.filter((t) => t.id !== id))
  }
  function startEdit(t) {
    setEditingId(t.id)
    setEditText(t.text)
    setEditDue(t.due || '')
    setEditTime(t.time || '')
    setEditRepeat(t.repeat || '')
    setEditCat(t.categoryId)
  }
  function cancelEdit() {
    setEditingId(null)
  }
  function saveEdit() {
    const value = editText.trim()
    if (!value) return
    setTasks(
      tasks.map((t) =>
        t.id === editingId
          ? {
              ...t,
              text: value,
              due: editDue || null,
              time: editTime || null,
              repeat: editRepeat || null,
              categoryId: editCat || t.categoryId
            }
          : t
      )
    )
    setEditingId(null)
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
  function renameCategory(id, name) {
    setCategories(categories.map((c) => (c.id === id ? { ...c, name } : c)))
  }
  function recolorCategory(id, color) {
    setCategories(categories.map((c) => (c.id === id ? { ...c, color } : c)))
  }
  function removeCategory(id) {
    if (categories.length <= 1) return
    const remaining = categories.filter((c) => c.id !== id)
    const fallback = remaining[0].id
    setTasks(tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: fallback } : t)))
    setCategories(remaining)
    if (active === id) setActive(fallback)
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      {!managing && (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={'chip flex items-center gap-2 ' + (active === c.id ? toneClass(c.color) + ' text-cream' : 'bg-white/60')}
            >
              <span className={'h-3 w-3 rounded-full ' + toneClass(c.color)} />
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
          <button onClick={() => setManaging(true)} className="chip flex items-center gap-1 bg-white/60">
            <Pencil size={14} />
          </button>
        </div>
      )}

      {managing && (
        <div className="card flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg text-cocoa">Категории</h3>
            <button onClick={() => setManaging(false)} className="btn px-2 py-1">
              <X size={16} />
            </button>
          </div>
          {categories.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 rounded-xl border-2 border-cocoa/20 bg-white/60 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={c.name}
                  onChange={(e) => renameCategory(c.id, e.target.value)}
                  className="flex-1 rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-1.5 outline-none focus:border-pine"
                />
                <button
                  onClick={() => removeCategory(c.id)}
                  disabled={categories.length <= 1}
                  className="text-cocoa/40 hover:text-clay disabled:opacity-30"
                >
                  <Trash2 size={17} />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {TONE_KEYS.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => recolorCategory(c.id, tone)}
                    className={'h-5 w-5 rounded-full ' + toneClass(tone) + (c.color === tone ? ' ring-2 ring-cocoa ring-offset-1' : '')}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-4">
        <div className="mb-3 flex flex-col gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="что нужно сделать?"
            className="rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 outline-none focus:border-pine"
          />
          <div className="flex flex-wrap gap-2">
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
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className="rounded-xl border-2 border-cocoa/30 bg-white/80 px-2 py-2 text-cocoa/80 outline-none"
            >
              <option value="">без повтора</option>
              <option value="daily">каждый день</option>
              <option value="weekly">каждую неделю</option>
              <option value="monthly">каждый месяц</option>
            </select>
            <button onClick={addTask} className="btn bg-pine text-cream">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {shown.length === 0 && <li className="py-6 text-center text-cocoa/50">пока пусто, добавь первую задачу</li>}
          {shown.map((t) =>
            editingId === t.id ? (
              <li key={t.id} className="flex flex-col gap-2 rounded-xl border-2 border-pine/50 bg-white/70 px-3 py-2">
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  className="rounded-xl border-2 border-cocoa/30 bg-white/80 px-3 py-2 outline-none focus:border-pine"
                />
                <div className="flex flex-wrap gap-2">
                  <input
                    type="date"
                    value={editDue}
                    onChange={(e) => setEditDue(e.target.value)}
                    className="flex-1 rounded-xl border-2 border-cocoa/30 bg-white/80 px-2 py-1.5 text-cocoa/80 outline-none"
                  />
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="rounded-xl border-2 border-cocoa/30 bg-white/80 px-2 py-1.5 text-cocoa/80 outline-none"
                  />
                  <select
                    value={editRepeat}
                    onChange={(e) => setEditRepeat(e.target.value)}
                    className="rounded-xl border-2 border-cocoa/30 bg-white/80 px-2 py-1.5 text-cocoa/80 outline-none"
                  >
                    <option value="">без повтора</option>
                    <option value="daily">каждый день</option>
                    <option value="weekly">каждую неделю</option>
                    <option value="monthly">каждый месяц</option>
                  </select>
                  <select
                    value={editCat || ''}
                    onChange={(e) => setEditCat(e.target.value)}
                    className="rounded-xl border-2 border-cocoa/30 bg-white/80 px-2 py-1.5 text-cocoa/80 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={cancelEdit} className="btn px-3 py-1.5">
                    <X size={16} />
                  </button>
                  <button onClick={saveEdit} className="btn bg-pine px-3 py-1.5 text-cream">
                    <Check size={16} />
                  </button>
                </div>
              </li>
            ) : (
              <li key={t.id} className="flex items-center gap-3 rounded-xl border-2 border-cocoa/20 bg-white/60 px-3 py-2">
                <button
                  onClick={() => toggle(t.id)}
                  className={
                    'grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 border-cocoa/50 ' + (t.done ? 'bg-pine' : 'bg-white')
                  }
                >
                  {t.done && <Check size={15} className="text-cream" />}
                </button>
                <span className={'flex-1 ' + (t.done ? 'text-cocoa/40 line-through' : 'text-ink')}>{t.text}</span>
                {t.repeat && <span className="chip bg-slate/25 text-xs">{REPEAT_LABELS[t.repeat]}</span>}
                {t.time && <span className="chip bg-amber/25 text-xs">{t.time}</span>}
                {t.due && <span className="chip bg-cream text-xs text-cocoa/70">{formatDay(t.due)}</span>}
                <button onClick={() => startEdit(t)} className="text-cocoa/40 hover:text-pine">
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(t.id)} className="text-cocoa/40 hover:text-clay">
                  <Trash2 size={17} />
                </button>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  )
}
