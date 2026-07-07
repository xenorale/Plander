import { useEffect, useState } from 'react'
import TitleBar from './components/TitleBar.jsx'
import BottomNav from './components/BottomNav.jsx'
import Pomodoro from './components/Pomodoro.jsx'
import Reports from './components/Reports.jsx'
import Todo from './components/Todo.jsx'
import Calendar from './components/Calendar.jsx'
import Subscriptions from './components/Subscriptions.jsx'
import Settings from './components/Settings.jsx'
import { loadData, saveData } from './lib/storage.js'
import { defaultTasks, defaultCategories, defaultEvents, defaultSubscriptions } from './data/defaults.js'

export default function App() {
  const [view, setView] = useState('pomodoro')
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [events, setEvents] = useState([])
  const [focusLog, setFocusLog] = useState([])
  const [label, setLabel] = useState('')
  const [subs, setSubs] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [t, c, e, f, l, s] = await Promise.all([
        loadData('tasks', defaultTasks),
        loadData('categories', defaultCategories),
        loadData('events', defaultEvents),
        loadData('focusLog', []),
        loadData('focusLabel', ''),
        loadData('subscriptions', defaultSubscriptions)
      ])
      if (!alive) return
      setTasks(t)
      setCategories(c)
      setEvents(e)
      setFocusLog(f)
      setLabel(l)
      setSubs(s)
      setReady(true)
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (ready) saveData('tasks', tasks)
  }, [tasks, ready])
  useEffect(() => {
    if (ready) saveData('categories', categories)
  }, [categories, ready])
  useEffect(() => {
    if (ready) saveData('events', events)
  }, [events, ready])
  useEffect(() => {
    if (ready) saveData('focusLog', focusLog)
  }, [focusLog, ready])
  useEffect(() => {
    if (ready) saveData('focusLabel', label)
  }, [label, ready])
  useEffect(() => {
    if (ready) saveData('subscriptions', subs)
  }, [subs, ready])

  useEffect(() => {
    if (!window.api || !window.api.onNavigate) return
    return window.api.onNavigate((v) => setView(v))
  }, [])

  const views = {
    pomodoro: <Pomodoro focusLog={focusLog} setFocusLog={setFocusLog} label={label} setLabel={setLabel} />,
    reports: <Reports focusLog={focusLog} />,
    tasks: <Todo tasks={tasks} setTasks={setTasks} categories={categories} setCategories={setCategories} />,
    calendar: <Calendar tasks={tasks} setTasks={setTasks} events={events} setEvents={setEvents} subs={subs} categories={categories} />,
    subs: <Subscriptions subs={subs} setSubs={setSubs} />,
    settings: <Settings />
  }

  return (
    <div className="flex h-full flex-col">
      <TitleBar onSettings={() => setView('settings')} />
      <main className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{ready ? views[view] : null}</main>
      <BottomNav view={view} onSelect={setView} />
    </div>
  )
}
