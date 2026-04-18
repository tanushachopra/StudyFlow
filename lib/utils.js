import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function daysUntil(date) {
  const now = new Date()
  const target = new Date(date)
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  return diff
}

export function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case 'easy': return 'badge-easy'
    case 'medium': return 'badge-medium'
    case 'hard': return 'badge-hard'
    default: return 'badge-medium'
  }
}

export function getProgressColor(percentage) {
  if (percentage >= 80) return '#10B981'
  if (percentage >= 50) return '#F59E0B'
  return '#3B82F6'
}

export function groupTasksBySubject(tasks) {
  return tasks.reduce((acc, task) => {
    if (!acc[task.subject]) acc[task.subject] = []
    acc[task.subject].push(task)
    return acc
  }, {})
}

export function calculateProgress(tasks) {
  if (!tasks.length) return 0
  const completed = tasks.filter(t => t.completed).length
  return Math.round((completed / tasks.length) * 100)
}

export function isToday(date) {
  const today = new Date()
  const d = new Date(date)
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

export function isThisWeek(date) {
  const now = new Date()
  const d = new Date(date)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  return d >= startOfWeek && d <= endOfWeek
}
