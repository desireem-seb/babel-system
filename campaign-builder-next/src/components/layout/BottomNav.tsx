'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Sparkles,
  CalendarDays,
  MoreHorizontal,
  GitBranch,
  Map,
  MessageSquare,
  X,
} from 'lucide-react'

const MAIN_NAV = [
  { href: '/framework', label: 'Framework', icon: LayoutDashboard },
  { href: '/assets', label: 'Assets', icon: Package },
  { href: '/generator', label: 'Generate', icon: Sparkles },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
]

const MORE_NAV = [
  { href: '/flow', label: 'Campaign Flow', icon: GitBranch },
  { href: '/journey', label: 'Journey Map', icon: Map },
  { href: '/feedback', label: 'Feedback', icon: MessageSquare },
]

interface BottomNavProps {
  className?: string
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const isMoreActive = MORE_NAV.some(
    (n) => pathname === n.href || pathname.startsWith(n.href + '/')
  )

  return (
    <>
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800',
          'flex items-stretch',
          className
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {MAIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[52px] transition-colors',
                active ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[52px] transition-colors',
            isMoreActive ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'
          )}
        >
          <MoreHorizontal size={20} strokeWidth={isMoreActive ? 2.5 : 1.75} />
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </nav>

      {/* More sheet */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-2xl border-t border-zinc-200 dark:border-zinc-800 pb-safe"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">More</p>
              <button
                onClick={() => setMoreOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-2 pb-2 space-y-1">
              {MORE_NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    )}
                  >
                    <Icon size={18} className={active ? 'text-indigo-600' : 'text-zinc-400'} />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
