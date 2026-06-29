'use client'
import { useEffect, useState } from 'react'
import { Activity, FileText } from 'lucide-react'
import { getBrowserScoutStatus, subscribeToBrowserScouts } from '../lib/browser-scout-store'
import { isBrowserLocalOnlyMode } from '../lib/local-mode'

export default function ScoutChat({ scoutId }: { scoutId?: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!scoutId) return
    setLoading(true)
    const load = async () => {
      try {
        if (isBrowserLocalOnlyMode()) {
          const data = getBrowserScoutStatus(scoutId)
          const msgs: any[] = []
          for (const t of data?.todos || []) {
            msgs.push({
              type: 'task',
              title: t.title,
              content: t.description || JSON.stringify({ search: t.search, status: t.status }),
              at: t.createdAt
            })
          }
          setMessages(msgs)
          return
        }

        const res = await fetch(`/api/scout-status?scoutId=${scoutId}`, { cache: 'no-store' })
        const data = await res.json()
        const msgs: any[] = []
        // Use summaries and latest todo logs as messages
        for (const s of data.summaries || []) {
          msgs.push({ type: 'summary', title: s.title, content: s.content, at: s.createdAt })
        }
        for (const t of data.todos || []) {
          if (t.resultData) {
            msgs.push({ type: 'result', title: t.title, content: JSON.stringify(t.resultData), at: t.completedAt || t.lastRunAt })
          }
        }
        msgs.sort((a, b) => new Date(a.at || 0).getTime() - new Date(b.at || 0).getTime())
        setMessages(msgs)
      } finally {
        setLoading(false)
      }
    }
    load()
    if (isBrowserLocalOnlyMode()) {
      return subscribeToBrowserScouts(load)
    }

    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [scoutId])

  if (!scoutId) {
    return (
      <section className="grid gap-4 md:grid-cols-3">
        {['Monitor any topic', 'Live artifacts', 'Signal digest'].map((title, index) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-sm">
            <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#050706]">
              {index === 1 ? <FileText className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
            </div>
            <div className="text-lg font-semibold text-white">{title}</div>
            <p className="mt-2 text-sm leading-6 text-white/58">
              {index === 0 ? 'Tell it what to watch in natural language.' : index === 1 ? 'Keep dashboards and notes updated as the world changes.' : 'Get updates only when there is something worth knowing.'}
            </p>
          </div>
        ))}
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase text-white/45">Live workspace</div>
          <div className="text-xl font-semibold text-white">Scout activity</div>
        </div>
        {loading && <div className="text-xs text-white/45">Loading...</div>}
      </div>
      <div className="space-y-3">
      {messages.map((m, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 text-[10px] font-semibold uppercase text-white/45">{m.type.toUpperCase()}</div>
          <div className="mb-1 text-sm font-semibold text-white">{m.title}</div>
          <div className="whitespace-pre-wrap break-words text-sm leading-6 text-white/58">{m.content}</div>
        </div>
      ))}
      {(!loading && messages.length === 0) && (
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/45">Tasks will appear here.</div>
      )}
      </div>
    </section>
  )
}
