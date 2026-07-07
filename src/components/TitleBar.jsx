import { Minus, X } from 'lucide-react'

export default function TitleBar() {
  const min = () => window.api && window.api.minimize()
  const hide = () => window.api && window.api.hide()

  return (
    <header className="drag flex h-11 items-center justify-between px-4">
      <div className="flex items-baseline gap-2">
        <span className="font-script text-3xl font-bold text-cocoa">Plander</span>
        <span className="text-sm text-cocoa/50">твой уютный планер</span>
      </div>
      <div className="no-drag flex items-center gap-2">
        <button
          onClick={min}
          className="grid h-7 w-7 place-items-center rounded-full border-2 border-cocoa/50 bg-cream hover:bg-sand"
        >
          <Minus size={15} />
        </button>
        <button
          onClick={hide}
          className="grid h-7 w-7 place-items-center rounded-full border-2 border-cocoa/50 bg-blush hover:bg-rose"
        >
          <X size={15} />
        </button>
      </div>
    </header>
  )
}
