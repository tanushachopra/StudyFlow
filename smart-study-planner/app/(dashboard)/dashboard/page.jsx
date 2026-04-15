'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTasks } from '@/hooks/useTasks'
import { useAuthStore } from '@/store/authStore'
import StatsCard from '@/components/dashboard/StatsCard'
import TaskCard from '@/components/tasks/TaskCard'
import { ProgressBar, Button, Badge } from '@/components/ui'
import { formatDateShort, groupTasksBySubject, getProgressColor, daysUntil } from '@/lib/utils'
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Sparkles, ArrowRight, BookOpen } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { tasks, loading, stats, toggleComplete, deleteTask } = useTasks()

  const todayTasks = tasks.filter(t => {
    const days = daysUntil(t.deadline)
    return !t.completed && days <= 1
  })

  const upcomingTasks = tasks.filter(t => {
    const days = daysUntil(t.deadline)
    return !t.completed && days > 1 && days <= 7
  }).slice(0, 4)

  const subjectGroups = groupTasksBySubject(tasks)
  const subjects = Object.keys(subjectGroups)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold font-display text-text-primary">
          {greeting}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Student'}</span> 👋
        </h2>
        <p className="text-text-muted text-sm mt-1">
          {stats.pending > 0
            ? `You have ${stats.pending} pending task${stats.pending !== 1 ? 's' : ''}. Let's crush it!`
            : 'All caught up! Add new tasks to keep the momentum going.'}
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Tasks" value={stats.total} sub="all subjects" icon={BookOpen} color="#3B82F6" index={0} />
        <StatsCard title="Completed" value={stats.completed} sub={`${stats.progress}% done`} icon={CheckSquare} color="#10B981" index={1} />
        <StatsCard title="Pending" value={stats.pending} sub="to be done" icon={Clock} color="#F59E0B" index={2} />
        <StatsCard title="Overdue" value={stats.overdue} sub={stats.overdue > 0 ? 'needs attention' : 'all on track'} icon={AlertTriangle} color={stats.overdue > 0 ? '#EF4444' : '#10B981'} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold font-display text-text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                Due Today / Tomorrow
              </h3>
              <Link href="/tasks" className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {todayTasks.length === 0 ? (
              <div className="bg-surface border border-border rounded-xl p-6 text-center">
                <CheckSquare className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-text-secondary text-sm font-medium">No urgent tasks!</p>
                <p className="text-text-muted text-xs">You're ahead of schedule 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task, i) => (
                  <TaskCard key={task._id} task={task} onToggle={toggleComplete} onDelete={deleteTask} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          {upcomingTasks.length > 0 && (
            <div>
              <h3 className="font-semibold font-display text-text-primary mb-3">This Week</h3>
              <div className="space-y-2">
                {upcomingTasks.map((task, i) => (
                  <TaskCard key={task._id} task={task} onToggle={toggleComplete} onDelete={deleteTask} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Overall progress */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold font-display text-text-primary">Overall Progress</h3>
              <TrendingUp className="w-4 h-4 text-text-muted" />
            </div>
            <div className="text-center mb-4">
              <span className="text-4xl font-bold font-display" style={{ color: getProgressColor(stats.progress) }}>
                {stats.progress}%
              </span>
              <p className="text-xs text-text-muted mt-1">{stats.completed} of {stats.total} tasks done</p>
            </div>
            <ProgressBar value={stats.progress} color={getProgressColor(stats.progress)} size="md" />
          </div>

          {/* By subject */}
          {subjects.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-semibold font-display text-text-primary mb-4">By Subject</h3>
              <div className="space-y-3">
                {subjects.map(subject => {
                  const subTasks = subjectGroups[subject]
                  const done = subTasks.filter(t => t.completed).length
                  const pct = Math.round((done / subTasks.length) * 100)
                  return (
                    <div key={subject}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-text-secondary font-medium truncate">{subject}</span>
                        <span className="text-text-muted shrink-0 ml-2">{done}/{subTasks.length}</span>
                      </div>
                      <ProgressBar value={pct} color={getProgressColor(pct)} size="sm" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* AI Planner CTA */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
            <Sparkles className="w-6 h-6 text-accent mb-3" />
            <h3 className="font-semibold font-display text-text-primary mb-1">AI Study Planner</h3>
            <p className="text-xs text-text-muted mb-4">Generate a personalized study schedule based on your tasks and deadlines.</p>
            <Link href="/planner">
              <Button variant="accent" size="sm" className="w-full">
                Generate Plan <Sparkles className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
