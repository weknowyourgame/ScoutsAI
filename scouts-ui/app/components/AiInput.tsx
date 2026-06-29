'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, Mail, Search } from 'lucide-react'

interface AiInputProps {
  placeholder?: string
  onSubmit?: (value: string) => void | Promise<void>
  className?: string
}

export default function AiInput({
  placeholder = "What should your Scout watch?",
  onSubmit,
  className
}: AiInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSubmit?.(JSON.stringify({
        query: inputValue,
        notificationFrequency: 'Once a day',
        email: email || undefined
      }))
      setInputValue('')
      setEmail('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={className}>
      <div className="rounded-3xl border border-white/10 bg-white p-6 text-[#171713] shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase text-[#23a77d]">New Scout</div>
          <div className="mt-1 text-xl font-semibold">What should stay on your radar?</div>
        </div>

        <label className="mb-2 block text-xs font-medium text-[#6f746d]">Scout request</label>
        <div className="mb-3 flex h-12 items-center gap-2 rounded-lg border border-[#deded9] bg-white px-3">
          <Search className="h-4 w-4 text-[#8a9088]" />
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={placeholder}
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#858b84]"
          />
        </div>

        <label className="mb-2 block text-xs font-medium text-[#6f746d]">Email address</label>
        <div className="mb-3 flex h-12 items-center gap-2 rounded-lg border border-[#deded9] bg-white px-3">
          <Mail className="h-4 w-4 text-[#8a9088]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#858b84]"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#23a77d] text-sm font-semibold text-white transition hover:bg-[#1b906b] disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
          {!isSubmitting && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="rounded-b-3xl border-x border-b border-white/10 bg-white/[0.08] px-6 py-5 text-center text-sm text-white/62">
        Private local mode. No production database required.
      </div>
    </div>
  )
}
