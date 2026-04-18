'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function StatsCard({ title, value, sub, icon: Icon, color = '#3B82F6', trend, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-surface border border-border rounded-xl p-5 relative overflow-hidden group hover:border-border-bright transition-all duration-200"
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl group-hover:opacity-10 transition-opacity"
        style={{ background: color, transform: 'translate(30%, -30%)' }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">{title}</p>
          <p className="text-3xl font-bold font-display" style={{ color }}>{value}</p>
          {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
          {trend !== undefined && (
            <p className={cn('text-xs mt-2 font-medium', trend >= 0 ? 'text-success' : 'text-danger')}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </motion.div>
  )
}
