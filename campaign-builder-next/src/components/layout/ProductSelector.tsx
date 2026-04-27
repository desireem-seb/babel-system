'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/hooks/useStore'
import { Framework } from '@/types'
import { ChevronDown, Box } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ProductSelectorProps {
  frameworks: Framework[]
}

export function ProductSelector({ frameworks }: ProductSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { selectedProduct, setSelectedProduct } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = frameworks.find((f) => f.id === selectedProduct)

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function select(id: string) {
    setSelectedProduct(id)
    setOpen(false)
    // Stay on same page section but re-render with new product
    const section = pathname.split('/')[1] || 'framework'
    router.push(`/${section}`)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors w-full max-w-xs',
          'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800',
          open && 'border-indigo-300 ring-2 ring-indigo-100'
        )}
      >
        <Box size={14} className="text-zinc-400 shrink-0" />
        <span className="flex-1 text-left truncate text-zinc-700 dark:text-zinc-200">
          {current?.name ?? 'Select product…'}
        </span>
        <ChevronDown
          size={14}
          className={cn('text-zinc-400 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-64 z-50 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg overflow-hidden">
          <div className="p-1.5 max-h-72 overflow-y-auto">
            {frameworks.map((fw) => (
              <button
                key={fw.id}
                onClick={() => select(fw.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                  selectedProduct === fw.id
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0',
                    selectedProduct === fw.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  )}
                >
                  {fw.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="truncate">{fw.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
