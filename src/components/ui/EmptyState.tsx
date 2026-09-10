import React from 'react'

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  CloudSun,
  Inbox,
  Plus,
  Search,
  ShieldCheck,
} from 'lucide-react'

export type EmptyStateIcon =
  'inbox' | 'search' | 'shield' | 'check' | 'clipboard' | 'calendar' | 'weather'

interface ActionButton {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  icon?: React.ReactNode
}

interface EmptyStateProps {
  icon?: EmptyStateIcon
  title: string
  description: string
  badgeText?: string
  primaryAction?: ActionButton
  secondaryAction?: ActionButton
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  badgeText,
  primaryAction,
  secondaryAction,
  className = '',
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'shield':
        return (
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
        )
      case 'check':
        return (
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        )
      case 'search':
        return (
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
            <Search className="w-7 h-7" />
          </div>
        )
      case 'clipboard':
        return (
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <ClipboardList className="w-7 h-7" />
          </div>
        )
      case 'calendar':
        return (
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Calendar className="w-7 h-7" />
          </div>
        )
      case 'weather':
        return (
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
            <CloudSun className="w-7 h-7" />
          </div>
        )
      case 'inbox':
      default:
        return (
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-xs">
            <Inbox className="w-7 h-7" />
          </div>
        )
    }
  }

  return (
    <div
      className={`w-full flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-white border border-slate-200 shadow-xs ${className}`}
    >
      <div className="mb-4">{renderIcon()}</div>

      {badgeText && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 mb-2 border border-slate-200">
          {badgeText}
        </span>
      )}

      <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">{description}</p>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs"
            >
              {primaryAction.icon}
              {primaryAction.label}
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
      )}
    </div>
  )
}
