'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Badge, Card } from '@/components/ui'
import { useTasks } from '@/hooks/useTasks'
import { Sparkles, CalendarDays, Clock, BookOpen, Lightbulb, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const PRIORITY_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' }

export default function PlannerPage() {
  const { tasks, stats } = useTasks()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [days, setDays] = useState(7)
  const [expandedDay, setExpandedDay] = useState(0)

  // Load existing plan on mount
  
  
    const generatePlan = async () => {
  try {
    setLoading(true);
    setFetching(true);
    console.log("CLICKED");

    const res = await fetch("/api/planner/generate", {
      method: "POST",
    });

    const data = await res.json();

    console.log("DATA FROM API:", data);

    setPlan(data.plan);   // VERY IMPORTANT
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    setLoading(false);
    setFetching(false);
  }
};
  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            AI Study Planner
          </h2>
          <p className="text-text-muted text-sm">Generate an optimized schedule from your tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
            <CalendarDays className="w-4 h-4 text-text-muted" />
            <select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="bg-transparent text-sm text-text-primary focus:outline-none"
            >
              {[3, 5, 7, 10, 14].map(d => (
                <option key={d} value={d}>{d} days</option>
              ))}
            </select>
          </div>
          <Button onClick={generatePlan} loading={loading} variant="accent">
            {plan ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {plan ? 'Regenerate' : 'Generate Plan'}
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending Tasks', value: stats.pending, color: '#3B82F6' },
          { label: 'Total Hours Est.', value: `${tasks.reduce((s, t) => s + (t.estimatedHours || 2), 0)}h`, color: '#06B6D4' },
          { label: 'Subjects', value: [...new Set(tasks.map(t => t.subject))].length, color: '#10B981' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold font-display" style={{ color }}>{value}</p>
            <p className="text-xs text-text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Plan output */}
      {fetching ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !plan ? (
        <div className="bg-surface border border-dashed border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h3 className="font-semibold font-display text-text-primary text-lg mb-2">No plan yet</h3>
          <p className="text-text-muted text-sm max-w-sm mx-auto mb-6">
            Click "Generate Plan" and AI will create a personalized study schedule based on your tasks, deadlines, and difficulty levels.
          </p>
          <Button onClick={generatePlan} loading={loading} variant="accent" size="lg">
            <Sparkles className="w-4 h-4" /> Generate My Study Plan
          </Button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text-primary mb-1">{plan.summary}</p>
                  <div className="flex gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{plan.totalHours}h total</span>
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{plan.dailyPlans?.length} days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily plans */}
            <div className="space-y-2">
              {plan.dailyPlans?.map((day, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-surface border border-border rounded-xl overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-2 transition-colors"
                    onClick={() => setExpandedDay(expandedDay === idx ? -1 : idx)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{day.day}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-text-primary">Day {day.day}</p>
                        <p className="text-xs text-text-muted">{day.date} · {day.totalHours}h · {day.sessions?.length} sessions</p>
                      </div>
                    </div>
                    {expandedDay === idx
                      ? <ChevronUp className="w-4 h-4 text-text-muted" />
                      : <ChevronDown className="w-4 h-4 text-text-muted" />
                    }
                  </button>

                  <AnimatePresence>
                    {expandedDay === idx && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 space-y-2 border-t border-border pt-3">
                          {day.sessions?.map((session, si) => (
                            <div key={si} className="flex items-start gap-3 p-3 bg-surface-2 rounded-lg">
                              <div
                                className="w-1 self-stretch rounded-full shrink-0"
                                style={{ background: PRIORITY_COLOR[session.priority] || '#3B82F6' }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-medium text-text-secondary">{session.subject}</span>
                                  <span className="text-xs text-text-muted">·</span>
                                  <span className="text-sm font-medium text-text-primary">{session.topic}</span>
                                  <Badge variant={session.priority === 'high' ? 'danger' : session.priority === 'medium' ? 'warning' : 'success'} className="ml-auto">
                                    {session.priority}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className="flex items-center gap-1 text-xs text-text-muted">
                                    <Clock className="w-3 h-3" />{session.duration} min
                                  </span>
                                  {session.tips && (
                                    <span className="text-xs text-text-muted italic">💡 {session.tips}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Recommendations */}
            {plan.recommendations?.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h3 className="font-semibold font-display text-text-primary mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-warning" /> AI Recommendations
                </h3>
                <ul className="space-y-2">
                  {plan.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-accent shrink-0 mt-0.5">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
