'use client'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const buildQuery = (f) => {
    const params = new URLSearchParams()
    if (f.subject) params.set('subject', f.subject)
    if (f.completed !== undefined) params.set('completed', f.completed)
    if (f.sort) params.set('sort', f.sort)
    return params.toString()
  }

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const query = buildQuery(filters)
      const res = await fetch(`/api/tasks${query ? `?${query}` : ''}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTasks(data.tasks)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const createTask = async (taskData) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setTasks(prev => [data.task, ...prev])
    toast.success('Task added!')
    return data.task
  }

  const updateTask = async (id, updates) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setTasks(prev => prev.map(t => t._id === id ? data.task : t))
    return data.task
  }

  const toggleComplete = async (id) => {
    const task = tasks.find(t => t._id === id)
    if (!task) return
    const updated = await updateTask(id, { completed: !task.completed })
    if (updated.completed) toast.success('Task completed! 🎉')
    return updated
  }

  const deleteTask = async (id) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete')
    setTasks(prev => prev.filter(t => t._id !== id))
    toast.success('Task deleted')
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.deadline) < new Date()).length,
    progress: tasks.length
      ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
      : 0,
  }

  return { tasks, loading, error, stats, fetchTasks, createTask, updateTask, toggleComplete, deleteTask }
}
