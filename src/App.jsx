import { useEffect, useState } from 'react'
import TitleBar from './components/TitleBar.jsx'
import Sidebar from './components/Sidebar.jsx'
import Pomodoro from './components/Pomodoro.jsx'
import Todo from './components/Todo.jsx'
import Calendar from './components/Calendar.jsx'
import Subscriptions from './components/Subscriptions.jsx'
import Settings from './components/Settings.jsx'
import { loadData, saveData } from './lib/storage.js'
import { defaultTasks, defaultCategories } from './data/defaults.js'

export default function App() {
  const [view, setView] = useState('pomodoro')
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const t = await loadData('tasks', defaultTasks)
      const c = await loadData('categories', defaultCategories)
      if (!alive) return
      setTasks(t)
      setCategories(c)
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
    if (!window.api || !window.api.onNavigate) return
    return window.api.onNavigate((v) => setView(v))
  }, [])

  const views = {
    pomodoro: <Pomodoro />,
    tasks: <Todo tasks={tasks} setTasks={setTasks} categories={categories} setCategories={setCategories} />,
    calendar: <Calendar tasks={tasks} />,
    subs: <Subscriptions />,
    settings: <Settings />
  }

  return (
    <div className="flex h-full flex-col">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar view={view} onSelect={setView} />
        <main className="min-h-0 flex-1 overflow-y-auto px-8 py-6">{ready ? views[view] : null}</main>
      </div>
    </div>
  )
}
