import React from 'react'

import { AlertTriangle, LifeBuoy, RefreshCw, ShieldAlert, WifiOff } from 'lucide-react'

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
  title = 'Failed to Load Data',
  message = 'An unexpected error occurred while communicating with the parlor telemetry hub.',
  errorCode = 'ERR_HUB_TIMEOUT',
  onRetry,
  retryLabel = 'Retry Sync',
  isRetrying = false,
  secondaryAction,
  className = '',
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={`p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-left ${className}`}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-red-900">{title}</h4>
            <p className="text-[11px] text-red-700 leading-tight mt-0.5">{message}</p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-300 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors shrink-0 shadow-2xs"
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
      className={`w-full flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-white border-2 border-red-100 shadow-xs ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-xs mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-red-100 text-red-800 mb-2 border border-red-200">
        <ShieldAlert className="w-3 h-3" />
        <span>Status Code: {errorCode}</span>
      </div>

      <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">{message}</p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-60 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying Connection...' : retryLabel}
          </button>
        )}

        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-colors border border-slate-200"
          >
            {secondaryAction.icon}
            {secondaryAction.label}
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
        <LifeBuoy className="w-3.5 h-3.5" />
        <span>
          Local parlor hub offline buffer is active. All offline operations remain preserved.
        </span>
      </div>
    </div>
  )
}
