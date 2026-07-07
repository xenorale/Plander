import { Timer, ListTodo, CalendarDays, CreditCard, BarChart3 } from 'lucide-react'

const items = [
  { id: 'pomodoro', label: 'Фокус', icon: Timer },
  { id: 'tasks', label: 'Задачи', icon: ListTodo },
  { id: 'calendar', label: 'Календарь', icon: CalendarDays },
  { id: 'subs', label: 'Подписки', icon: CreditCard },
  { id: 'reports', label: 'Отчёты', icon: BarChart3 }
]

export default function BottomNav({ view, onSelect }) {
  return (
    <nav className="flex items-stretch justify-around gap-1 border-t-2 border-cocoa/20 bg-cream/80 px-2 py-2">
      {items.map((it) => {
        const Icon = it.icon
        const active = view === it.id
        return (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            className={
              'flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 py-2 transition-all ' +
              (active ? 'border-pine/50 bg-pine/15 text-pine' : 'border-transparent text-cocoa/60 hover:bg-white/50')
            }
          >
            <Icon size={21} />
            <span className="text-xs">{it.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
