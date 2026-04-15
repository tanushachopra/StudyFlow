'use client'
import { useState } from 'react'
import { Button, Input, Select, Textarea } from '@/components/ui'

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']

const defaultForm = {
  subject: '', title: '', description: '',
  difficulty: 'medium', deadline: '', estimatedHours: 2,
  priority: 'medium', tags: '',
}

export default function TaskForm({ onSubmit, onCancel, initial = {} }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.subject.trim()) errs.subject = 'Subject required'
    if (!form.title.trim()) errs.title = 'Title required'
    if (!form.deadline) errs.deadline = 'Deadline required'
    setErrors(errs)
    return !Object.keys(errs).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        ...form,
        estimatedHours: Number(form.estimatedHours),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      await onSubmit(payload)
    } finally {
      setLoading(false)
    }
  }

  // Min date = today
  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Subject *" placeholder="e.g. Mathematics" value={form.subject} onChange={set('subject')} error={errors.subject} />
        <Input label="Topic / Task *" placeholder="e.g. Integration by parts" value={form.title} onChange={set('title')} error={errors.title} />
      </div>

      <Textarea label="Description" placeholder="Optional notes about this task..." value={form.description} onChange={set('description')} rows={2} />

      <div className="grid grid-cols-3 gap-4">
        <Select label="Difficulty *" value={form.difficulty} onChange={set('difficulty')}>
          {DIFFICULTY_OPTIONS.map(d => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </Select>

        <Select label="Priority" value={form.priority} onChange={set('priority')}>
          {PRIORITY_OPTIONS.map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </Select>

        <Input
          label="Est. Hours"
          type="number" min="0.5" max="40" step="0.5"
          value={form.estimatedHours}
          onChange={set('estimatedHours')}
        />
      </div>

      <Input
        label="Deadline *"
        type="date" min={today}
        value={form.deadline}
        onChange={set('deadline')}
        error={errors.deadline}
      />

      <Input
        label="Tags (comma-separated)"
        placeholder="e.g. exam, chapter-5, revision"
        value={form.tags}
        onChange={set('tags')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {initial._id ? 'Save Changes' : 'Add Task'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  )
}
