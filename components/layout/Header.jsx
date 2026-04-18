'use client'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { Bell, Search } from 'lucide-react'

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Your study overview' },
  '/tasks': { title: 'Tasks', sub: 'Manage your study tasks' },
  '/planner': { title: 'AI Planner', sub: 'Generate your smart study plan' },
  '/progress': { title: 'Progress', sub: 'Track your learning journey' },
  '/assistant': { title: 'AI Assistant', sub: 'Chat with your study coach' },
}

export default function Header() {
  const pathname = usePathname()
  const page = pageTitles[pathname] || { title: 'StudyFlow', sub: '' }
  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold font-display text-text-primary leading-tight">{page.title}</h1>
        <p className="text-xs text-text-muted">{page.sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted hidden sm:block">{today}</span>
        <div className="w-px h-4 bg-border hidden sm:block" />
        <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
