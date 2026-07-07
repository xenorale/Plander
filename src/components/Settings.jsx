import { useEffect, useState } from 'react'
import { Power, Bell, LogOut } from 'lucide-react'
import { notify } from '../lib/storage.js'

export default function Settings() {
  const [autostart, setAutostart] = useState(false)

  useEffect(() => {
    if (window.api && window.api.getAutostart) window.api.getAutostart().then(setAutostart)
  }, [])

  function toggleAutostart() {
    const next = !autostart
    setAutostart(next)
    if (window.api && window.api.setAutostart) window.api.setAutostart(next).then(setAutostart)
  }
  function testNotify() {
    notify('Привет из Plander', 'Уведомления работают, все супер')
  }
  function quit() {
    if (window.api && window.api.quit) window.api.quit()
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <h2 className="font-script text-3xl text-cocoa">Настройки</h2>

      <div className="card flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Power size={22} />
          <div>
            <p className="text-ink">Запускать вместе с Windows</p>
            <p className="text-sm text-cocoa/60">старт в фоне, приложение прячется в трей</p>
          </div>
        </div>
        <button
          onClick={toggleAutostart}
          className={'relative h-8 w-14 shrink-0 rounded-full border-2 border-cocoa/50 transition-colors ' + (autostart ? 'bg-pine' : 'bg-white')}
        >
          <span className={'absolute top-0.5 h-6 w-6 rounded-full bg-cocoa/70 transition-all ' + (autostart ? 'left-6' : 'left-0.5')} />
        </button>
      </div>

      <div className="card flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Bell size={22} />
          <div>
            <p className="text-ink">Проверить уведомления</p>
            <p className="text-sm text-cocoa/60">отправить тестовый пуш в систему</p>
          </div>
        </div>
        <button onClick={testNotify} className="btn bg-slate/25">
          Тест
        </button>
      </div>

      <button onClick={quit} className="btn mt-2 self-start bg-clay/25">
        <LogOut size={18} /> Выйти из приложения
      </button>
    </div>
  )
}
