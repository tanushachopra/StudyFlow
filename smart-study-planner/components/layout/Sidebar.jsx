'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, CheckSquare, CalendarDays,
  TrendingUp, MessageSquareText, LogOut, Sparkles, BookOpen
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/planner', icon: CalendarDays, label: 'AI Planner' },
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/assistant', icon: MessageSquareText, label: 'AI Assistant' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold font-display gradient-text">StudyFlow</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-text-muted font-semibold">Menu</p>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              )}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary/10 rounded-lg border-r-2 border-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn('w-4 h-4 shrink-0 relative z-10', active ? 'text-primary' : 'group-hover:text-text-primary')} />
              <span className="relative z-10">{label}</span>
              {href === '/planner' && (
                <span className="ml-auto relative z-10">
                  <Sparkles className="w-3 h-3 text-accent" />
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'Student'}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
