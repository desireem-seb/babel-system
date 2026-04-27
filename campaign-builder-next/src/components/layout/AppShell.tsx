'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { ProductSelector } from './ProductSelector'
import { FrameworkUpdateBanner } from './FrameworkUpdateBanner'
import { useStore } from '@/hooks/useStore'
import { Framework } from '@/types'
import { Moon, Sun } from 'lucide-react'

interface AppShellProps {
  children: React.ReactNode
  frameworks: Framework[]
}

export function AppShell({ children, frameworks }: AppShellProps) {
  const { selectedProduct, darkMode, toggleDarkMode } = useStore()

  // Apply dark class to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="flex h-full min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar — visible md+ */}
      <Sidebar frameworks={frameworks} className="hidden md:flex" />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          {/* Mobile: logo */}
          <Link href="/framework" className="flex items-center gap-1.5 md:hidden">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">CB</span>
            </div>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Campaign Builder</span>
          </Link>

          {/* Product selector */}
          <div className="ml-auto md:ml-0 flex-1 max-w-xs">
            <ProductSelector frameworks={frameworks} />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {selectedProduct && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {frameworks.find((f) => f.id === selectedProduct)?.name}
              </span>
            )}
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* Framework update banner */}
        <FrameworkUpdateBanner />

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom nav — visible on mobile only */}
      <BottomNav className="md:hidden" />
    </div>
  )
}
