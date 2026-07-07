import { Minus, X, Settings } from 'lucide-react'

export default function TitleBar({ onSettings }) {
  const min = () => window.api && window.api.minimize()
  const hide = () => window.api && window.api.hide()

  return (
    <header className="drag flex h-11 items-center justify-between px-4">
      <span className="font-script text-2xl font-bold text-cocoa">Plander</span>
      <div className="no-drag flex items-center gap-2">
        <button
          onClick={onSettings}
          className="grid h-7 w-7 place-items-center rounded-full border-2 border-cocoa/40 bg-cream hover:bg-sand"
        >
          <Settings size={14} />
        </button>
        <button
          onClick={min}
          className="grid h-7 w-7 place-items-center rounded-full border-2 border-cocoa/40 bg-cream hover:bg-sand"
        >
          <Minus size={15} />
        </button>
        <button
          onClick={hide}
          className="grid h-7 w-7 place-items-center rounded-full border-2 border-cocoa/40 bg-clay/25 hover:bg-clay/45"
        >
          <X size={15} />
        </button>
      </div>
    </header>
  )
}
