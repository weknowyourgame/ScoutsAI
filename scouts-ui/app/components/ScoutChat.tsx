'use client'
import { useEffect, useState } from 'react'

export default function ScoutChat({ scoutId }: { scoutId?: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!scoutId) return
    setLoading(true)
    const load = async () => {
      try {
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
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [scoutId])

  if (!scoutId) return <div className="text-neutral-500">Select a scout from the left.</div>
  return (
    <div className="w-full space-y-3">
      {loading && <div className="text-xs text-neutral-500">Loading updates...</div>}
      {messages.map((m, i) => (
        <div key={i} className="p-3 border border-neutral-800 rounded">
          <div className="text-xs text-neutral-500 mb-1">{m.type.toUpperCase()}</div>
          <div className="text-sm font-semibold mb-1">{m.title}</div>
          <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
        </div>
      ))}
      {(!loading && messages.length === 0) && (
        <div className="text-xs text-neutral-500">No messages yet. Tasks will appear here.</div>
      )}
    </div>
  )
}


