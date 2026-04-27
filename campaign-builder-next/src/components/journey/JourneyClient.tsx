'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/hooks/useStore'
import { Framework, Campaign, Asset, AssetStage } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { AssetDialog } from '@/components/assets/AssetDialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Map, ArrowRight, ExternalLink, SlidersHorizontal, X, Pencil, CheckCheck } from 'lucide-react'
import {
  STAGE_LABELS,
  STAGE_COLORS,
  STAGE_ACCENT,
  TYPE_ICONS,
  TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  ASSET_STAGES,
  ALL_CHANNELS,
  ALL_REGIONS,
} from '@/lib/utils'
import { cn } from '@/lib/utils'

interface JourneyClientProps {
  frameworks: Framework[]
  initialCampaign: Campaign | null
}

const PERSONA_COLORS = [
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-pink-100 text-pink-700 border-pink-200',
]

export function JourneyClient({ frameworks, initialCampaign }: JourneyClientProps) {
  const { selectedProduct } = useStore()
  const product = selectedProduct ?? frameworks[0]?.id
  const framework = frameworks.find((f) => f.id === product)
  const queryClient = useQueryClient()

  const [filterPersona, setFilterPersona] = useState('')
  const [filterChannel, setFilterChannel] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editAsset, setEditAsset] = useState<Asset | null>(null)

  const { data: campaign } = useQuery({
    queryKey: ['campaign', product],
    queryFn: async () => {
      if (!product) return null
      const res = await fetch(`/api/campaigns/${product}`)
      if (!res.ok) return null
      return res.json() as Promise<Campaign>
    },
    initialData: initialCampaign,
    enabled: !!product,
  })

  const updateMutation = useMutation({
    mutationFn: async (asset: Asset) => {
      const res = await fetch(`/api/campaigns/${product}/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      })
      if (!res.ok) throw new Error('Failed to update asset')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaign', product] }),
  })

  const assets = campaign?.assets ?? []

  const personaOptions = (framework?.personas ?? []).map((p) => ({ value: p, label: p }))
  const activeFilterCount = [filterPersona, filterChannel, filterRegion].filter(Boolean).length

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (filterPersona && !a.personas.includes(filterPersona)) return false
      if (filterChannel && !a.channels.includes(filterChannel)) return false
      if (filterRegion && !a.regions.includes(filterRegion)) return false
      return true
    })
  }, [assets, filterPersona, filterChannel, filterRegion])

  const byStage = useMemo(() => {
    const groups: Record<AssetStage, Asset[]> = {
      awareness: [], familiarity: [], consideration: [], decision: [],
    }
    for (const a of filtered) groups[a.stage]?.push(a)
    return groups
  }, [filtered])

  // Group personas across all assets for swimlane rows
  const allPersonas = useMemo(() => {
    const seen = new Set<string>()
    for (const a of filtered) {
      for (const p of a.personas) seen.add(p)
    }
    return Array.from(seen)
  }, [filtered])

  if (!product) {
    return (
      <EmptyState
        icon={Map}
        title="No product selected"
        description="Select a product to view its journey map."
      />
    )
  }

  return (
    <>
    {editAsset && (
      <AssetDialog
        open={!!editAsset}
        onClose={() => setEditAsset(null)}
        framework={framework}
        asset={editAsset}
        onSave={(updated) => {
          updateMutation.mutate(updated)
          setEditAsset(null)
          setSelectedAsset(null)
        }}
        saving={updateMutation.isPending}
      />
    )}
    <div className="pb-8">
      <PageHeader
        title="Journey Map"
        description={`Buyer journey by persona · ${framework?.name ?? product}`}
        actions={
          <div className="flex items-center gap-2">
            {!editMode && (
              <Button
                size="sm"
                variant="outline"
                icon={<SlidersHorizontal size={14} />}
                onClick={() => setShowFilters((v) => !v)}
                className={cn(activeFilterCount > 0 && 'border-indigo-300 text-indigo-700')}
              >
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant={editMode ? 'primary' : 'outline'}
              icon={editMode ? <CheckCheck size={14} /> : <Pencil size={14} />}
              onClick={() => setEditMode((v) => !v)}
            >
              {editMode ? 'Done' : 'Edit'}
            </Button>
          </div>
        }
      />

      {/* Filters */}
      {showFilters && (
        <div className="px-4 md:px-6 mb-4">
          <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Select
              placeholder="All personas"
              value={filterPersona}
              onChange={(e) => setFilterPersona(e.target.value)}
              options={[{ value: '', label: 'All personas' }, ...personaOptions]}
              className="w-full sm:w-44"
            />
            <Select
              placeholder="All channels"
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              options={[{ value: '', label: 'All channels' }, ...ALL_CHANNELS]}
              className="w-full sm:w-44"
            />
            <Select
              placeholder="All regions"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              options={[{ value: '', label: 'All regions' }, ...ALL_REGIONS]}
              className="w-full sm:w-40"
            />
            {activeFilterCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                icon={<X size={12} />}
                onClick={() => { setFilterPersona(''); setFilterChannel(''); setFilterRegion('') }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="px-4 md:px-6">
          <EmptyState
            icon={Map}
            title="No assets to map"
            description="Add assets with personas assigned to see them in the journey map."
          />
        </div>
      ) : (
        <div className="px-4 md:px-6 overflow-x-auto -mx-0">
          <p className="sm:hidden text-xs text-zinc-400 mb-2 flex items-center gap-1">
            <span>←</span> Scroll to see all stages <span>→</span>
          </p>
          <div className="min-w-[700px]">

            {/* Stage header row */}
            <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: '140px repeat(4, 1fr)' }}>
              <div />
              {ASSET_STAGES.map((stage) => (
                <div
                  key={stage}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold',
                    STAGE_COLORS[stage]
                  )}
                >
                  <span>{STAGE_LABELS[stage]}</span>
                  <span className="opacity-60 font-normal">{byStage[stage].length}</span>
                </div>
              ))}
            </div>

            {/* Arrow row */}
            <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: '140px repeat(4, 1fr)' }}>
              <div />
              {ASSET_STAGES.map((_, i) => (
                <div key={i} className="flex items-center justify-end pr-1">
                  {i < ASSET_STAGES.length - 1 && (
                    <ArrowRight size={14} className="text-zinc-300" />
                  )}
                </div>
              ))}
            </div>

            {/* Persona swimlane rows */}
            {allPersonas.length > 0 ? (
              allPersonas.map((persona, pi) => (
                <div key={persona} className="grid gap-2 mb-3 items-start" style={{ gridTemplateColumns: '140px repeat(4, 1fr)' }}>
                  {/* Persona label */}
                  <div className="flex items-start pt-1 pr-3">
                    <span className={cn(
                      'text-[11px] font-semibold px-2 py-1 rounded-lg border w-full text-center leading-snug',
                      PERSONA_COLORS[pi % PERSONA_COLORS.length]
                    )}>
                      {persona}
                    </span>
                  </div>

                  {/* Stage cells for this persona */}
                  {ASSET_STAGES.map((stage) => {
                    const stagePersonaAssets = byStage[stage].filter((a) =>
                      a.personas.includes(persona)
                    )
                    return (
                      <div
                        key={stage}
                        className={cn(
                          'min-h-[60px] rounded-xl border-l-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-2 space-y-1.5',
                          STAGE_ACCENT[stage]
                        )}
                      >
                        {stagePersonaAssets.length === 0 ? (
                          <div className="h-full flex items-center justify-center py-4">
                            <span className="text-[10px] text-zinc-200">—</span>
                          </div>
                        ) : (
                          stagePersonaAssets.map((a) => (
                            <div key={a.id} className="relative group/card">
                              <button
                                onClick={() => !editMode && setSelectedAsset(selectedAsset?.id === a.id ? null : a)}
                                className={cn(
                                  'w-full text-left flex items-start gap-1.5 p-2 rounded-lg border transition-colors',
                                  editMode
                                    ? 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                                    : selectedAsset?.id === a.id
                                      ? 'bg-indigo-50 border-indigo-200'
                                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-700'
                                )}
                              >
                                <span className="text-sm shrink-0">{TYPE_ICONS[a.type]}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2">
                                    {a.name}
                                  </p>
                                  <span className={cn(
                                    'inline-flex mt-1 px-1 py-0.5 rounded text-[9px] font-semibold border',
                                    STATUS_COLORS[a.status]
                                  )}>
                                    {STATUS_LABELS[a.status]}
                                  </span>
                                </div>
                              </button>
                              {editMode && (
                                <button
                                  onClick={() => setEditAsset(a)}
                                  className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-400 hover:text-indigo-600 hover:border-indigo-300 shadow-sm transition-colors"
                                  title="Edit asset"
                                >
                                  <Pencil size={9} />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            ) : (
              /* No personas assigned — show all assets in flat rows */
              <div className="grid gap-2 mb-3 items-start" style={{ gridTemplateColumns: '140px repeat(4, 1fr)' }}>
                <div className="flex items-start pt-1 pr-3">
                  <span className="text-[11px] text-zinc-400 font-medium px-2 py-1 text-center w-full">
                    All assets
                  </span>
                </div>
                {ASSET_STAGES.map((stage) => (
                  <div
                    key={stage}
                    className={cn(
                      'min-h-[60px] rounded-xl border-l-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-2 space-y-1.5',
                      STAGE_ACCENT[stage]
                    )}
                  >
                    {byStage[stage].map((a) => (
                      <div key={a.id} className="relative group/card">
                        <button
                          onClick={() => !editMode && setSelectedAsset(selectedAsset?.id === a.id ? null : a)}
                          className={cn(
                            'w-full text-left flex items-start gap-1.5 p-2 rounded-lg border transition-colors',
                            editMode
                              ? 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                              : selectedAsset?.id === a.id
                                ? 'bg-indigo-50 border-indigo-200'
                                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                          )}
                        >
                          <span className="text-sm shrink-0">{TYPE_ICONS[a.type]}</span>
                          <p className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2 flex-1">
                            {a.name}
                          </p>
                        </button>
                        {editMode && (
                          <button
                            onClick={() => setEditAsset(a)}
                            className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-400 hover:text-indigo-600 hover:border-indigo-300 shadow-sm transition-colors"
                            title="Edit asset"
                          >
                            <Pencil size={9} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Asset detail panel */}
      {selectedAsset && (
        <div className="px-4 md:px-6 mt-6">
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{TYPE_ICONS[selectedAsset.type]}</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{selectedAsset.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{TYPE_LABELS[selectedAsset.type]} · {STAGE_LABELS[selectedAsset.stage]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {selectedAsset.url && (
                  <a
                    href={selectedAsset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    <ExternalLink size={12} />
                    Open
                  </a>
                )}
                <button
                  onClick={() => setEditAsset(selectedAsset)}
                  className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 hover:border-indigo-300 transition-colors"
                >
                  <Pencil size={11} />
                  Edit
                </button>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="text-zinc-400 hover:text-zinc-600 text-xs"
                >
                  Close
                </button>
              </div>
            </div>

            {selectedAsset.description && (
              <p className="text-sm text-zinc-600 leading-relaxed">{selectedAsset.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <span className={cn('inline-flex px-2 py-0.5 rounded-md text-xs font-medium border', STATUS_COLORS[selectedAsset.status])}>
                {STATUS_LABELS[selectedAsset.status]}
              </span>
              {selectedAsset.channels.map((ch) => (
                <Badge key={ch} className="text-xs">{ch}</Badge>
              ))}
              {selectedAsset.personas.map((p) => (
                <Badge key={p} variant="info" className="text-xs">{p}</Badge>
              ))}
              {selectedAsset.regions.map((r) => (
                <Badge key={r} variant="purple" className="text-xs">{r}</Badge>
              ))}
            </div>

            {selectedAsset.launchDate && (
              <p className="text-xs text-zinc-400">
                Launch: {new Date(selectedAsset.launchDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}

            {selectedAsset.next_touchpoints && selectedAsset.next_touchpoints.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Next Touchpoints</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAsset.next_touchpoints.map((t) => (
                    <Badge key={t} variant="default" className="text-xs">→ {t}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  )
}
