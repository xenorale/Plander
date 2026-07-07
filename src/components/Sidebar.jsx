import { Timer, ListTodo, CalendarDays, CreditCard, Settings } from 'lucide-react'

const items = [
  { id: 'pomodoro', label: 'Помодоро', icon: Timer },
  { id: 'tasks', label: 'Задачи', icon: ListTodo },
  { id: 'calendar', label: 'Календарь', icon: CalendarDays },
  { id: 'subs', label: 'Подписки', icon: CreditCard }
]

function NavButton({ item, active, onSelect, activeTone }) {
  const Icon = item.icon
  return (
    <button
      onClick={() => onSelect(item.id)}
      className={
        'flex w-16 flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 transition-all ' +
        (active ? 'border-cocoa/60 shadow-sketchsm ' + activeTone : 'border-transparent text-cocoa/70 hover:bg-white/60')
      }
    >
      <Icon size={22} />
      <span className="text-xs">{item.label}</span>
    </button>
  )
}

export default function Sidebar({ view, onSelect }) {
  return (
    <aside className="flex w-24 flex-col items-center gap-2 py-4">
      {items.map((it) => (
        <NavButton key={it.id} item={it} active={view === it.id} onSelect={onSelect} activeTone="bg-lavender" />
      ))}
      <div className="mt-auto">
        <NavButton
          item={{ id: 'settings', label: 'Настройки', icon: Settings }}
          active={view === 'settings'}
          onSelect={onSelect}
          activeTone="bg-mint"
        />
      </div>
    </aside>
  )
}
