'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTasks } from '@/hooks/useTasks'
import TaskCard from '@/components/tasks/TaskCard'
import TaskForm from '@/components/tasks/TaskForm'
import { Modal, Button, Badge } from '@/components/ui'
import { Plus, Filter, SortAsc, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'overdue', label: 'Overdue' },
]

export default function TasksPage() {
  const { tasks, loading, stats, createTask, updateTask, toggleComplete, deleteTask } = useTasks()
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('deadline')

  const handleCreate = async (data) => {
    try {
      await createTask(data)
      setShowModal(false)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleEdit = async (data) => {
    try {
      await updateTask(editTask._id, data)
      setEditTask(null)
      toast.success('Task updated!')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filtered = tasks
    .filter(t => {
      if (activeFilter === 'pending') return !t.completed
      if (activeFilter === 'completed') return t.completed
      if (activeFilter === 'overdue') return !t.completed && new Date(t.deadline) < new Date()
      return true
    })
    .filter(t =>
      search === '' ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'deadline') return new Date(a.deadline) - new Date(b.deadline)
      if (sort === 'difficulty') {
        const map = { hard: 0, medium: 1, easy: 2 }
        return map[a.difficulty] - map[b.difficulty]
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary">All Tasks</h2>
          <p className="text-text-muted text-sm">{stats.total} tasks · {stats.pending} pending · {stats.completed} done</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex bg-surface border border-border rounded-lg p-1 gap-1">
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                activeFilter === key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              {label}
              {key === 'overdue' && stats.overdue > 0 && (
                <span className="ml-1.5 bg-danger text-white text-[10px] rounded-full w-4 h-4 inline-flex items-center justify-center">
                  {stats.overdue}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-secondary focus:border-primary transition-colors"
        >
          <option value="deadline">Sort: Deadline</option>
          <option value="difficulty">Sort: Difficulty</option>
          <option value="created">Sort: Newest</option>
        </select>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="font-semibold text-text-primary mb-1">
            {search ? 'No tasks match your search' : 'No tasks yet'}
          </h3>
          <p className="text-text-muted text-sm mb-4">
            {search ? 'Try a different keyword' : 'Add your first task to get started'}
          </p>
          {!search && (
            <Button onClick={() => setShowModal(true)} size="sm">
              <Plus className="w-4 h-4" /> Add your first task
            </Button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((task, i) => (
              <TaskCard
                key={task._id}
                task={task}
                index={i}
                onToggle={toggleComplete}
                onDelete={deleteTask}
                onEdit={setEditTask}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Add Task Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Task">
        <TaskForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} />
      </Modal>

      {/* Edit Task Modal */}
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && (
          <TaskForm
            initial={{
              ...editTask,
              deadline: editTask.deadline ? new Date(editTask.deadline).toISOString().split('T')[0] : '',
              tags: editTask.tags?.join(', ') || '',
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditTask(null)}
          />
        )}
      </Modal>
    </div>
  )
}
