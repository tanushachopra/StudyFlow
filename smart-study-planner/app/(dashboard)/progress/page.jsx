'use client'
import { motion } from 'framer-motion'
import { useTasks } from '@/hooks/useTasks'
import { ProgressBar } from '@/components/ui'
import { groupTasksBySubject, getProgressColor, formatDateShort } from '@/lib/utils'
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Award } from 'lucide-react'

export default function ProgressPage() {
  const { tasks, loading, stats } = useTasks()

  const subjects = groupTasksBySubject(tasks)
  const completedTasks = tasks.filter(t => t.completed).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  const overdueTasks = tasks.filter(t => !t.completed && new Date(t.deadline) < new Date())

  const difficultyStats = {
    easy: tasks.filter(t => t.difficulty === 'easy'),
    medium: tasks.filter(t => t.difficulty === 'medium'),
    hard: tasks.filter(t => t.difficulty === 'hard'),
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-text-primary">Progress Tracker</h2>
        <p className="text-text-muted text-sm">Your learning journey at a glance</p>
      </div>

      {/* Hero metric */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary/10 via-surface to-accent/10 border border-primary/20 rounded-2xl p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-primary to-accent rounded-b-full" />
        <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-1.5 mb-4">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="text-xs font-medium text-text-secondary">Overall Completion</span>
        </div>
        <p className="text-7xl font-bold font-display mb-2" style={{ color: getProgressColor(stats.progress) }}>
          {stats.progress}%
        </p>
        <p className="text-text-muted text-sm mb-6">
          {stats.completed} of {stats.total} tasks completed
        </p>
        <div className="max-w-sm mx-auto">
          <ProgressBar value={stats.progress} color={getProgressColor(stats.progress)} size="lg" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick stats */}
        {[
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: '#10B981' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: '#F59E0B' },
          { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: stats.overdue > 0 ? '#EF4444' : '#10B981' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold font-display" style={{ color }}>{value}</p>
              <p className="text-xs text-text-muted">{label} tasks</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By subject */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-semibold font-display text-text-primary mb-4">By Subject</h3>
          {Object.keys(subjects).length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">No subjects yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(subjects).map(([subject, subTasks], i) => {
                const done = subTasks.filter(t => t.completed).length
                const pct = Math.round((done / subTasks.length) * 100)
                return (
                  <motion.div
                    key={subject}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{subject}</p>
                        <p className="text-xs text-text-muted">{done}/{subTasks.length} tasks</p>
                      </div>
                      <span className="text-sm font-bold font-display" style={{ color: getProgressColor(pct) }}>{pct}%</span>
                    </div>
                    <ProgressBar value={pct} color={getProgressColor(pct)} size="md" />
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* By difficulty */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-semibold font-display text-text-primary mb-4">By Difficulty</h3>
          <div className="space-y-4">
            {[
              { key: 'easy', label: 'Easy', color: '#10B981' },
              { key: 'medium', label: 'Medium', color: '#F59E0B' },
              { key: 'hard', label: 'Hard', color: '#EF4444' },
            ].map(({ key, label, color }) => {
              const dTasks = difficultyStats[key]
              const done = dTasks.filter(t => t.completed).length
              const pct = dTasks.length ? Math.round((done / dTasks.length) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium" style={{ color }}>{label}</p>
                    <span className="text-xs text-text-muted">{done}/{dTasks.length}</span>
                  </div>
                  <ProgressBar value={pct} color={color} size="md" />
                </div>
              )
            })}
          </div>

          {/* Achievement */}
          {stats.completed >= 5 && (
            <div className="mt-5 bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-center gap-3">
              <Award className="w-5 h-5 text-warning shrink-0" />
              <div>
                <p className="text-xs font-semibold text-warning">Achievement Unlocked!</p>
                <p className="text-xs text-text-muted">Completed {stats.completed}+ tasks 🏆</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent completions */}
      {completedTasks.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-semibold font-display text-text-primary mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" /> Recently Completed
          </h3>
          <div className="space-y-2">
            {completedTasks.slice(0, 6).map((task, i) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
              >
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{task.title}</p>
                  <p className="text-xs text-text-muted">{task.subject}</p>
                </div>
                {task.completedAt && (
                  <span className="text-xs text-text-muted shrink-0">{formatDateShort(task.completedAt)}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-5">
          <h3 className="font-semibold font-display text-danger mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Overdue Tasks ({overdueTasks.length})
          </h3>
          <div className="space-y-2">
            {overdueTasks.map(task => (
              <div key={task._id} className="flex items-center justify-between py-2 border-b border-danger/10 last:border-0">
                <div>
                  <p className="text-sm text-text-primary">{task.title}</p>
                  <p className="text-xs text-text-muted">{task.subject}</p>
                </div>
                <span className="text-xs text-danger font-medium">
                  {Math.abs(Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24)))}d overdue
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
