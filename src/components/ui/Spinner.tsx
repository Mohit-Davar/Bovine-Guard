import React from 'react'

import { cn } from '../../lib/utils'
import { motion } from 'framer-motion'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'ring' | 'radar' | 'pulse' | 'dots'
  className?: string
  label?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'ring',
  className,
  label,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  if (variant === 'radar') {
    return (
      <div className={cn('relative flex items-center justify-center', sizeMap[size], className)}>
        <motion.div
          animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full bg-blue-500"
        />
        <motion.div
          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
          transition={{
            duration: 1.6,
            delay: 0.4,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="absolute inset-0 rounded-full bg-blue-400"
        />
        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 z-10 shadow-xs" />
        {label && <span className="sr-only">{label}</span>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <motion.span
          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"
        />
        {label && <span className="text-xs font-semibold text-slate-700">{label}</span>}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
            className="w-2 h-2 rounded-full bg-blue-600"
          />
        ))}
        {label && <span className="text-xs font-semibold text-slate-700 ml-1.5">{label}</span>}
      </div>
    )
  }

  // Default: SVG Smooth Dual-Ring Spinner
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <motion.svg
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        className={cn('text-blue-600', sizeMap[size])}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className="opacity-20 stroke-current" cx="12" cy="12" r="10" strokeWidth="3" />
        <path
          className="opacity-90 stroke-current"
          d="M12 2a10 10 0 0 1 10 10"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.svg>
      {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
    </div>
  )
}
