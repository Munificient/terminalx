import { Activity, User } from 'lucide-react'
import useMarketStore from '../../store/useMarketStore'

export default function Navbar() {
  const connected = useMarketStore((s) => s.connected)

  return (
    <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-3">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-up" />
        <span className="text-lg font-semibold tracking-tight">TerminalX</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <span className="relative flex h-2.5 w-2.5">
            {connected && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                connected ? 'bg-up' : 'bg-slate-500'
              }`}
            />
          </span>
          {connected ? 'Live' : 'Connecting'}
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-slate-700 py-1 pl-1 pr-3 text-sm transition-colors hover:bg-slate-600"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-600">
            <User className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">demo_trader</span>
        </button>
      </div>
    </header>
  )
}
