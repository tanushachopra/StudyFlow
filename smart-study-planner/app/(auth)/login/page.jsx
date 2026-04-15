'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { Button, Input } from '@/components/ui'
import { BookOpen, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg shadow-primary/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display gradient-text">StudyFlow</h1>
          <p className="text-text-muted text-sm mt-1">Plan smarter. Study better.</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold font-display text-text-primary mb-1">Welcome back</h2>
          <p className="text-text-muted text-sm mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full mt-6" size="lg">
              Sign in <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:text-blue-400 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs text-text-muted mt-4">
          First time? <Link href="/signup" className="text-accent hover:underline">Create a free account →</Link>
        </p>
      </motion.div>
    </div>
  )
}
