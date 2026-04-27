'use client'

import { useState } from 'react'
import { Asset, AssetStatus } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  TYPE_ICONS,
  TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  cn,
} from '@/lib/utils'
import { Pencil, Trash2, ExternalLink, MoreVertical, Copy } from 'lucide-react'

const STATUS_CYCLE: AssetStatus[] = ['draft', 'in_progress', 'live', 'refreshing', 'archived']

interface AssetCardProps {
  asset: Asset
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onStatusChange: (status: AssetStatus) => void
}

export function AssetCard({ asset, onEdit, onDelete, onDuplicate, onStatusChange }: AssetCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  function cycleStatus() {
    const i = STATUS_CYCLE.indexOf(asset.status)
    const next = STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length]
    onStatusChange(next)
  }

  return (
    <Card className="relative group overflow-visible" padding="none">
      <div className="p-3.5 space-y-2.5">
        {/* Type + status row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base shrink-0">{TYPE_ICONS[asset.type]}</span>
            <span className="text-[11px] font-medium text-zinc-500 truncate">
              {TYPE_LABELS[asset.type]}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status badge — clickable to cycle */}
            <button
              onClick={cycleStatus}
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border leading-none transition-opacity hover:opacity-80',
                STATUS_COLORS[asset.status]
              )}
            >
              {STATUS_LABELS[asset.status]}
            </button>

            {/* More menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <MoreVertical size={13} />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-7 z-20 w-36 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg overflow-hidden py-1">
                    <button
                      onClick={() => { onEdit(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => { onDuplicate(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Copy size={12} />
                      Duplicate
                    </button>
                    {asset.url && (
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <ExternalLink size={12} />
                        Open URL
                      </a>
                    )}
                    <hr className="my-1 border-zinc-100 dark:border-zinc-800" />
                    <button
                      onClick={() => { onDelete(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Name */}
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
          {asset.name}
        </p>

        {/* Description */}
        {asset.description && (
          <p className="text-xs text-zinc-400 leading-snug line-clamp-2">
            {asset.description}
          </p>
        )}

        {/* Launch date */}
        {asset.launchDate && (
          <p className="text-[10px] text-zinc-400">
            Launch: {new Date(asset.launchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {asset.channels.slice(0, 3).map((ch) => (
            <Badge key={ch} className="text-[10px]">
              {ch}
            </Badge>
          ))}
          {asset.personas.slice(0, 2).map((p) => (
            <Badge key={p} variant="info" className="text-[10px]">
              {p}
            </Badge>
          ))}
          {(asset.channels.length + asset.personas.length) > 5 && (
            <Badge className="text-[10px]">
              +{asset.channels.length + asset.personas.length - 5}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
