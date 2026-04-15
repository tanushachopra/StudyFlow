'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Button, Input } from '@/components/ui'
import { BookOpen, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const perks = ['AI-generated study plans', 'Smart task management', 'Progress tracking', 'AI Study Assistant']

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await signup(form.name, form.email, form.password)
      toast.success('Account created! Welcome to StudyFlow 🎉')
      router.push('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg shadow-primary/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display gradient-text">StudyFlow</h1>
          <p className="text-text-muted text-sm mt-1">Your AI-powered study companion</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold font-display text-text-primary mb-1">Create your account</h2>
          <p className="text-text-muted text-sm mb-4">Free forever. No credit card required.</p>

          {/* Perks */}
          <div className="grid grid-cols-2 gap-1.5 mb-6">
            {perks.map(p => (
              <div key={p} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
                {p}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" placeholder="Alex Johnson" value={form.name} onChange={set('name')} autoComplete="name" />
            <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} autoComplete="new-password" />

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Create free account <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-blue-400 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
