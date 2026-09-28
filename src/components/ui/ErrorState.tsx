import React from 'react'

import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ActionButton {
  label: string
  onClick: () => void
  loading?: boolean
  icon?: React.ReactNode
}

interface ErrorStateProps {
  title?: string
  message?: string
  errorCode?: string
  onRetry?: () => void
  retryLabel?: string
  isRetrying?: boolean
  secondaryAction?: ActionButton
  className?: string
  compact?: boolean
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'We could not reach the farm data server. Please check your internet connection.',
  onRetry,
  retryLabel = 'Try Again',
  isRetrying = false,
  secondaryAction,
  className = '',
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={`p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex items-center justify-between gap-3 text-left ${className}`}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-rose-900">{title}</h4>
            <p className="text-xs text-rose-700/90 leading-tight mt-0.5">{message}</p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors shrink-0 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : retryLabel}
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`w-full flex flex-col items-center justify-center text-center p-8 sm:p-14 rounded-3xl bg-white border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed font-normal">{message}</p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Connecting...' : retryLabel}
          </button>
        )}

        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-black/[0.04] text-slate-700 hover:bg-black/[0.08] active:scale-[0.98] transition-all"
          >
            {secondaryAction.icon}
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  )
}
