'use client'

import { usePathname } from 'next/navigation'
import { useStore } from '@/hooks/useStore'
import { X, RefreshCw } from 'lucide-react'

export function FrameworkUpdateBanner() {
  const pathname = usePathname()
  const { frameworkLastEdited, frameworkBannerDismissed, dismissFrameworkBanner } = useStore()

  // Only show on non-framework pages
  if (pathname === '/framework' || pathname.startsWith('/framework/')) return null
  if (!frameworkLastEdited || frameworkBannerDismissed) return null

  // Only show if edited within the last 30 minutes
  const editedAt = new Date(frameworkLastEdited)
  const minutesAgo = Math.floor((Date.now() - editedAt.getTime()) / 60000)
  if (minutesAgo > 30) return null

  const label = minutesAgo < 1 ? 'just now' : `${minutesAgo}m ago`

  return (
    <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 bg-indigo-600 text-white text-xs">
      <RefreshCw size={13} className="shrink-0" />
      <p className="flex-1">
        Your campaign framework was updated {label}. Content generated before this change may be outdated.
      </p>
      <button
        onClick={dismissFrameworkBanner}
        className="shrink-0 hover:opacity-75 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}
