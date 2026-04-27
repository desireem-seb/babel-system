'use client'

import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { Framework, Pillar } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { EditFrameworkDialog } from './EditFrameworkDialog'
import { EditBriefDialog } from './EditBriefDialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, ChevronDown, ChevronUp, Lightbulb, Target, FileText, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FrameworkClientProps {
  frameworks: Framework[]
}

export function FrameworkClient({ frameworks }: FrameworkClientProps) {
  const { selectedProduct } = useStore()
  const [editOpen, setEditOpen] = useState(false)
  const [briefOpen, setBriefOpen] = useState(false)
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const framework = frameworks.find((f) => f.id === selectedProduct) ?? frameworks[0]

  const { setFrameworkLastEdited } = useStore()

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Framework>) => {
      const res = await fetch(`/api/frameworks/${framework.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update framework')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frameworks'] })
      setFrameworkLastEdited(new Date().toISOString())
    },
  })

  if (!framework) {
    return (
      <EmptyState
        icon={Target}
        title="No product selected"
        description="Select a product from the dropdown above to view its framework."
      />
    )
  }

  return (
    <div className="px-4 md:px-6 pb-8 space-y-6">
      <PageHeader
        title={framework.name}
        description="Campaign framework, messaging pillars, and brief"
        actions={
          <Button
            size="sm"
            icon={<Pencil size={13} />}
            onClick={() => setEditOpen(true)}
          >
            Edit Framework
          </Button>
        }
      />

      {/* Portfolio message + tagline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                <Lightbulb size={14} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Portfolio Message</CardTitle>
            </div>
          </CardHeader>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{framework.portfolio}</p>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950 flex items-center justify-center">
                <Target size={14} className="text-violet-600 dark:text-violet-400" />
              </div>
              <CardTitle>Tagline</CardTitle>
            </div>
          </CardHeader>
          <p className="text-base font-medium text-zinc-800 dark:text-zinc-200 italic leading-snug">
            &ldquo;{framework.tagline}&rdquo;
          </p>
        </Card>
      </div>

      {/* Personas */}
      {framework.personas?.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                <Users size={14} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle>Target Personas</CardTitle>
            </div>
          </CardHeader>
          <div className="flex flex-wrap gap-1.5">
            {framework.personas.map((p) => (
              <Badge key={p} variant="info">
                {p}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Messaging Pillars */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 px-1 mb-3">
          Messaging Pillars ({framework.pillars.length})
        </h2>
        <div className="space-y-3">
          {framework.pillars.map((pillar, i) => (
            <PillarCard
              key={pillar.id}
              pillar={pillar}
              index={i}
              expanded={expandedPillar === pillar.id}
              onToggle={() =>
                setExpandedPillar(expandedPillar === pillar.id ? null : pillar.id)
              }
            />
          ))}
        </div>
      </div>

      {/* Campaign Brief */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
              <FileText size={14} className="text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle>Campaign Brief</CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            icon={<Pencil size={12} />}
            onClick={() => setBriefOpen(true)}
          >
            Edit
          </Button>
        </CardHeader>
        {framework.campaignBrief?.content ? (
          <div className="prose prose-sm max-w-none text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
            {framework.campaignBrief.content}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-zinc-400">No campaign brief yet.</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setBriefOpen(true)}
            >
              Add Brief
            </Button>
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <EditFrameworkDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        framework={framework}
        onSave={(updates) => updateMutation.mutate(updates)}
        saving={updateMutation.isPending}
      />

      <EditBriefDialog
        open={briefOpen}
        onClose={() => setBriefOpen(false)}
        framework={framework}
        onSave={(content) =>
          updateMutation.mutate({ campaignBrief: { content } })
        }
        saving={updateMutation.isPending}
      />
    </div>
  )
}

// ─── Pillar Card ──────────────────────────────────────────────────────────────

const PILLAR_COLORS = [
  'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
]

function PillarCard({
  pillar,
  index,
  expanded,
  onToggle,
}: {
  pillar: Pillar
  index: number
  expanded: boolean
  onToggle: () => void
}) {
  const color = PILLAR_COLORS[index % PILLAR_COLORS.length]

  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-3 text-left p-4 md:p-5"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              'w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
              color
            )}
          >
            {index + 1}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">{pillar.name}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-snug line-clamp-2">
              {pillar.description}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-zinc-400 shrink-0 mt-1" />
        ) : (
          <ChevronDown size={16} className="text-zinc-400 shrink-0 mt-1" />
        )}
      </button>

      {expanded && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 leading-relaxed">{pillar.description}</p>
          {pillar.capabilities.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Capabilities
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pillar.capabilities.map((cap) => (
                  <Badge key={cap} variant="default">
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
