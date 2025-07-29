'use client'
import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { EyeOpenIcon, PaperPlaneIcon } from '@radix-ui/react-icons'
import { Search, Clock, AlertCircle, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AiInputProps {
  placeholder?: string
  onSubmit?: (value: string) => void | Promise<void>
  className?: string
}

interface AnalysisStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'processing' | 'complete'
  details?: string[]
}

const AiInput = ({ 
  placeholder = "Ask Scout anything...", 
  onSubmit, 
  className 
}: AiInputProps) => {
  const [inputValue, setInputValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([])

  // Show analysis when user starts typing
  useEffect(() => {
    if (inputValue.trim().length > 0) {
      setShowAnalysis(true)
      // Simulate analysis steps
      const steps: AnalysisStep[] = [
        {
          id: 'what',
          title: 'WHAT',
          description: 'Understanding what you\'re looking for...',
          icon: <Search className="w-4 h-4" />,
          status: 'processing'
        },
        {
          id: 'when',
          title: 'WHEN TO NOTIFY OF ANY UPDATES',
          description: 'Setting up notification preferences...',
          icon: <Bell className="w-4 h-4" />,
          status: 'pending',
          details: ['Every hour', 'Once a day', 'Once a week']
        }
      ]
      setAnalysisSteps(steps)
    } else {
      setShowAnalysis(false)
    }
  }, [inputValue])

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await onSubmit?.(inputValue)
      setInputValue("")
      setShowAnalysis(false)
    } catch (error) {
      console.error('Error submitting:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={cn('w-full flex flex-col items-center justify-center relative', className)}>
      {/* Input field with FloatingMenu styling */}
      <div className="flex items-center gap-3 w-full max-w-3xl mb-4">
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isSubmitting}
              className={cn(
                "w-full pl-12 pr-6 py-5 rounded-xl border font-medium relative overflow-hidden",
                "bg-neutral-800 text-white placeholder:text-neutral-400",
                "focus:outline-none focus:ring-2 focus:ring-neutral-600",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "text-lg"
              )}
            />
          </div>
        </div>
      </div>

      {/* Analysis Tab */}
      <AnimatePresence>
        {showAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-3xl bg-neutral-800 rounded-xl border border-neutral-700 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 bg-neutral-600 rounded-full animate-pulse" />
              <span className="text-neutral-300 font-medium">Analyzing your request...</span>
              <span className="text-neutral-500 text-sm">0.5s</span>
            </div>

            <div className="space-y-4">
              {analysisSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    {step.status === 'processing' ? (
                      <div className="w-4 h-4 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
                    ) : (
                      <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                        <AlertCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {step.icon}
                      <span className="text-sm font-semibold text-neutral-300 uppercase">
                        {step.title}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-sm mb-2">
                      {step.description}
                    </p>
                    
                    {step.details && (
                      <div className="space-y-1">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-neutral-600 rounded-full" />
                            <span className="text-neutral-500 text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-700">
              <button
                onClick={() => setShowAnalysis(false)}
                className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isSubmitting}
                className={cn(
                  "hover:opacity-[0.90] rounded-[1.1rem] border font-extralight relative overflow-hidden",
                  "after:absolute after:content-[''] after:inset-0 after:[box-shadow:0_0_15px_-1px_#ffffff90_inset] after:rounded-[1rem]",
                  "before:absolute before:content-[''] before:inset-0 before:rounded-[1rem]",
                  "flex items-center before:z-20 after:z-10 text-lg",
                  "bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-200"
                )}
              >
                <div className="flex items-center gap-3 border-r border-[#fff]/40 px-6 py-4 z-0">
                  <EyeOpenIcon className='w-6 h-6' />
                  <p className="text-lg font-medium">
                    {isSubmitting ? "Sending..." : "Scout"}
                  </p>
                </div>
                <div className="px-4">
                  <PaperPlaneIcon className='w-6 h-6' />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AiInput 