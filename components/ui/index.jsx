'use client'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

// ─── Button ─────────────────────────────────────────────────────────────────
export function Button({
  children, variant = 'primary', size = 'md',
  className, loading, disabled, ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-primary hover:bg-blue-500 text-white focus:ring-primary shadow-lg shadow-primary/20',
    secondary: 'bg-surface-2 hover:bg-surface-3 text-text-primary border border-border hover:border-border-bright focus:ring-border',
    ghost: 'hover:bg-surface-2 text-text-secondary hover:text-text-primary focus:ring-border',
    danger: 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 focus:ring-danger',
    accent: 'bg-accent hover:bg-cyan-400 text-background font-semibold focus:ring-accent shadow-lg shadow-accent/20',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, className, hover = false, glow = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-xl p-5',
        hover && 'hover:border-border-bright hover:bg-surface-2 transition-all duration-200 cursor-pointer',
        glow && 'glow-blue',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-surface-2 text-text-secondary border-border',
    easy: 'badge-easy',
    medium: 'badge-medium',
    hard: 'badge-hard',
    primary: 'bg-primary/10 text-primary border-primary/30',
    accent: 'bg-accent/10 text-accent border-accent/30',
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    danger: 'bg-danger/10 text-danger border-danger/30',
  }
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border',
      variants[variant] || variants.default,
      className
    )}>
      {children}
    </span>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value = 0, max = 100, color = '#3B82F6', showLabel = false, size = 'md', className }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' }
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-text-muted">Progress</span>
          <span className="text-xs font-medium" style={{ color }}>{pct}%</span>
        </div>
      )}
      <div className={cn('w-full bg-surface-3 rounded-full overflow-hidden', heights[size])}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl z-10 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold font-display text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </motion.div>
    </div>
  )
}

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      <input
        className={cn(
          'w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted',
          'focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-150',
          error && 'border-danger focus:border-danger focus:ring-danger',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

// ─── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, error, className, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      <select
        className={cn(
          'w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary',
          'focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-150',
          error && 'border-danger',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      <textarea
        className={cn(
          'w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted resize-none',
          'focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-150',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
