import React from 'react';
import { motion } from 'motion/react';
import { Spinner } from './Spinner';
import { Activity, Sparkles, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingStateProps {
  title?: string;
  message?: string;
  variant?: 'card' | 'screen' | 'inline' | 'table';
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Receiving Data...',
  message = 'Processing hardware sensor telemetry and early mastitis risk metrics from barn hub...',
  variant = 'card',
  rows = 4,
}) => {
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 py-2">
        <Spinner size="sm" variant="ring" />
        <span>{title}</span>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <Spinner size="sm" variant="radar" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Receiving telemetry stream...</span>
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: rows }).map((_, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.15 }}
              className="flex items-center gap-4"
            >
              <div className="h-9 w-9 rounded-xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                <div className="h-2.5 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="h-6 w-16 bg-slate-200 rounded-full" />
              <div className="h-4 w-12 bg-slate-200 rounded" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'w-full flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white border border-slate-200 shadow-xs',
        variant === 'screen' ? 'min-h-[380px]' : 'min-h-[220px]'
      )}
    >
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center shadow-xs">
          <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
        <div className="absolute -bottom-1.5 -right-1.5 bg-white p-1 rounded-full shadow-xs border border-slate-200">
          <Spinner size="sm" variant="radar" />
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 mt-1.5 max-w-md leading-relaxed">{message}</p>

      {/* Progress Shimmer Bar */}
      <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-5 overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="h-full bg-blue-600 rounded-full w-1/2"
        />
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-3 font-medium">
        <Cpu className="w-3.5 h-3.5 text-blue-500" />
        <span>Portable Scanner & Wearable Telemetry</span>
      </div>
    </motion.div>
  );
};
