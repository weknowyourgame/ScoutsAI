'use client'
import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { isBrowserLocalOnlyMode } from '../lib/local-mode'
import { listBrowserScouts, subscribeToBrowserScouts } from '../lib/browser-scout-store'

type Scout = {
  id: string
  userQuery: string
  status: string
}

export default function SidebarScouts({ onSelect, selectedId }: { onSelect: (id: string) => void, selectedId?: string }) {
  const [scouts, setScouts] = useState<Scout[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      if (isBrowserLocalOnlyMode()) {
        setScouts(listBrowserScouts())
        return
      }

      const res = await fetch('/api/scouts', { cache: 'no-store' })
      const data = await res.json()
      setScouts(data.scouts || [])
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    if (isBrowserLocalOnlyMode()) {
      return subscribeToBrowserScouts(load)
    }
  }, [])

  return (
    <aside className="order-3 max-h-[20rem] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] p-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.22)] lg:order-none lg:h-[35rem] lg:max-h-none">
      <div className="mb-4 flex items-center justify-between px-2 pt-2">
        <div>
          <div className="text-xs uppercase text-[#aaa08f]">Active</div>
          <div className="text-lg font-semibold">Scouts</div>
        </div>
        <button
          onClick={load}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3a342a] text-[#d8cfbf] hover:bg-[#29241d]"
          aria-label="Refresh scouts"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2 overflow-y-auto pr-1">
        {loading && <div className="px-2 text-xs text-[#aaa08f]">Loading...</div>}
        {scouts.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full rounded-2xl border px-3 py-3 text-left transition ${selectedId === s.id ? 'border-[#23a77d] bg-[#23a77d] text-white' : 'border-white/10 bg-black/20 text-white hover:border-white/20'}`}
          >
            <div className="truncate text-sm font-semibold">{s.userQuery}</div>
            <div className={`mt-1 text-[10px] uppercase ${selectedId === s.id ? 'text-white/70' : 'text-white/40'}`}>{s.status}</div>
          </button>
        ))}
        {(!loading && scouts.length === 0) && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            <div className="relative h-36 border-b border-white/10 bg-[#07130f]">
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
              {[
                ['left-[18%] top-[28%]', 'h-2 w-2'],
                ['left-[52%] top-[42%]', 'h-3 w-3'],
                ['left-[72%] top-[22%]', 'h-2 w-2'],
                ['left-[35%] top-[66%]', 'h-2.5 w-2.5'],
              ].map(([position, size], index) => (
                <span
                  key={index}
                  className={`absolute ${position} ${size} rounded-full bg-[#23a77d] shadow-[0_0_24px_rgba(35,167,125,0.9)]`}
                />
              ))}
            </div>
            <div className="p-4 pl-11 sm:pl-4">
              <div className="text-sm font-semibold text-white">Live monitoring workspace</div>
              <p className="mt-2 text-xs leading-5 text-white/45">Create a Scout and findings will collect here.</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
