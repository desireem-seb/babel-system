'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Framework } from '@/types'
import {
  LayoutDashboard,
  Package,
  Sparkles,
  CalendarDays,
  GitBranch,
  Map,
  MessageSquare,
} from 'lucide-react'

interface SidebarProps {
  frameworks: Framework[]
  className?: string
}

const NAV_ITEMS = [
  { href: '/framework', label: 'Framework', icon: LayoutDashboard },
  { href: '/assets', label: 'Assets', icon: Package },
  { href: '/generator', label: 'Generator', icon: Sparkles },
  { href: '/flow', label: 'Campaign Flow', icon: GitBranch },
  { href: '/journey', label: 'Journey Map', icon: Map },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
]

export function Sidebar({ frameworks: _frameworks, className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'w-56 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-screen sticky top-0',
        className
      )}
    >
      {/* Logo */}
      <Link href="/framework" className="flex items-center gap-2.5 px-4 h-14 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">CB</span>
          </div>
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Campaign Builder</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <div className="px-2 pt-1 pb-2">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
            Workspace
          </span>
        </div>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors duration-150',
                active
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              <Icon
                size={16}
                className={cn(
                  'shrink-0',
                  active ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-zinc-200 dark:border-zinc-800">
        <Link
          href="/feedback"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          <MessageSquare size={15} className="shrink-0 text-zinc-400" />
          Feedback
        </Link>
        <div className="mt-2 px-2.5 py-2">
          <div className="text-[10px] text-zinc-300 dark:text-zinc-600">Open Source · MIT License</div>
        </div>
      </div>
    </aside>
  )
}
