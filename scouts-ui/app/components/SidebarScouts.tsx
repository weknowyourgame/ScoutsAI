'use client'
import { useEffect, useState } from 'react'

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
      const res = await fetch('/api/scouts', { cache: 'no-store' })
      const data = await res.json()
      setScouts(data.scouts || [])
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="w-72 h-full border-r border-neutral-800 p-3 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-neutral-400">Scouts</div>
        <button onClick={load} className="text-xs px-2 py-1 rounded border border-neutral-700 hover:bg-neutral-800">Refresh</button>
      </div>
      <div className="space-y-2">
        {loading && <div className="text-xs text-neutral-500">Loading...</div>}
        {scouts.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full text-left px-3 py-2 rounded border ${selectedId === s.id ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-800 hover:border-neutral-700'}`}
          >
            <div className="text-sm truncate">{s.userQuery}</div>
            <div className="text-[10px] uppercase text-neutral-500">{s.status}</div>
          </button>
        ))}
        {(!loading && scouts.length === 0) && (
          <div className="text-xs text-neutral-500">No scouts yet. Create one.</div>
        )}
      </div>
    </div>
  )
}


