import React from 'react'

import { cn } from '../../lib/utils'
import { Spinner } from './Spinner'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

interface LoadingStateProps {
  title?: string
  message?: string
  variant?: 'card' | 'screen' | 'inline' | 'table'
  rows?: number
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Updating Records...',
  message = 'Refreshing herd health parameters and latest cow checks...',
  variant = 'card',
  rows = 4,
}) => {
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600 py-2">
        <Spinner size="sm" variant="ring" />
        <span>{title}</span>
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className="w-full bg-white rounded-3xl border border-black/[0.06] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="p-4 sm:p-5 border-b border-black/[0.04] flex items-center justify-between bg-black/[0.01]">
          <div className="flex items-center gap-2.5">
            <Spinner size="sm" variant="radar" />
            <span className="text-xs font-semibold text-slate-800 tracking-tight">
              {title}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-normal">
            Syncing data...
          </span>
        </div>
        <div className="p-5 space-y-3.5">
          {Array.from({ length: rows }).map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: idx * 0.15,
              }}
              className="flex items-center gap-4"
            >
              <div className="h-10 w-10 rounded-2xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-slate-100 rounded-lg w-1/3" />
                <div className="h-2.5 bg-slate-50 rounded-lg w-1/2" />
              </div>
              <div className="h-6 w-16 bg-slate-100 rounded-full" />
              <div className="h-4 w-12 bg-slate-50 rounded-lg" />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'w-full flex flex-col items-center justify-center text-center p-8 sm:p-14 rounded-3xl bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)]',
        variant === 'screen' ? 'min-h-[380px]' : 'min-h-[220px]',
      )}
    >
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-2xl bg-black/[0.03] border border-black/[0.06] flex items-center justify-center">
          <Activity className="w-7 h-7 text-blue-600 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-xs border border-black/[0.06]">
          <Spinner size="sm" variant="radar" />
        </div>
      </div>

      <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed font-normal">{message}</p>

      {/* Apple-style Progress Shimmer Bar */}
      <div className="w-44 h-1 bg-black/[0.04] rounded-full mt-6 overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="h-full bg-blue-600 rounded-full w-1/2"
        />
      </div>
    </motion.div>
  )
}
