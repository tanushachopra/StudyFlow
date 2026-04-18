'use client'
import { motion } from 'framer-motion'
import { Badge, ProgressBar } from '@/components/ui'
import { formatDateShort, daysUntil, getDifficultyColor } from '@/lib/utils'
import { Clock, Calendar, Trash2, Pencil, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TaskCard({ task, onToggle, onDelete, onEdit, index = 0 }) {
  const days = daysUntil(task.deadline)
  const isOverdue = days < 0 && !task.completed

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'bg-surface border rounded-xl p-4 transition-all duration-200 group',
        task.completed
          ? 'border-border opacity-60'
          : isOverdue
            ? 'border-danger/40 hover:border-danger/60'
            : 'border-border hover:border-border-bright',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task._id)}
          className="mt-0.5 shrink-0 transition-transform hover:scale-110"
        >
          {task.completed
            ? <CheckCircle2 className="w-5 h-5 text-success" />
            : <Circle className="w-5 h-5 text-text-muted hover:text-primary" />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-text-muted mb-0.5">{task.subject}</p>
              <h3 className={cn('text-sm font-semibold text-text-primary', task.completed && 'line-through text-text-muted')}>
                {task.title}
              </h3>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {onEdit && (
                <button onClick={() => onEdit(task)} className="p-1.5 rounded-md hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => onDelete(task._id)} className="p-1.5 rounded-md hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-text-muted mt-1 line-clamp-2">{task.description}</p>
          )}

          {/* Meta */}
          <div className="flex items-center flex-wrap gap-2 mt-3">
            <Badge variant={task.difficulty}>{task.difficulty}</Badge>
            <span className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue ? 'text-danger' : days <= 3 ? 'text-warning' : 'text-text-muted'
            )}>
              <Calendar className="w-3 h-3" />
              {task.completed
                ? formatDateShort(task.deadline)
                : isOverdue
                  ? `${Math.abs(days)}d overdue`
                  : days === 0
                    ? 'Due today'
                    : `${days}d left`
              }
            </span>
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="w-3 h-3" />
              {task.estimatedHours}h
            </span>
            {task.tags?.map(tag => (
              <span key={tag} className="text-xs text-text-muted bg-surface-2 px-1.5 py-0.5 rounded">#{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
