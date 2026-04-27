'use client'

import { useMemo, useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { Framework, Campaign, Asset, AssetStage } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { AssetDialog } from '@/components/assets/AssetDialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GitBranch, ArrowRight, SlidersHorizontal, X, Pencil, ChevronUp, ChevronDown, CheckCheck } from 'lucide-react'
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

interface FlowClientProps {
  frameworks: Framework[]
  initialCampaign: Campaign | null
}

export function FlowClient({ frameworks, initialCampaign }: FlowClientProps) {
  const { selectedProduct } = useStore()
  const product = selectedProduct ?? frameworks[0]?.id
  const queryClient = useQueryClient()

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

  const framework = frameworks.find((f) => f.id === product)
  const assets = campaign?.assets ?? []

  const [filterPersona, setFilterPersona] = useState('')
  const [filterChannel, setFilterChannel] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editAsset, setEditAsset] = useState<Asset | null>(null)

  const personaOptions = (framework?.personas ?? []).map((p) => ({ value: p, label: p }))
  const activeFilterCount = [filterPersona, filterChannel, filterRegion].filter(Boolean).length

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

  // Move asset up/down within its stage group
  function moveAsset(assetId: string, direction: 'up' | 'down') {
    if (!campaign) return
    const allAssets = [...campaign.assets]
    const idx = allAssets.findIndex((a) => a.id === assetId)
    if (idx < 0) return
    const asset = allAssets[idx]
    const stageAssets = allAssets.filter((a) => a.stage === asset.stage)
    const stageIdx = stageAssets.findIndex((a) => a.id === assetId)
    const swapIdx = direction === 'up' ? stageIdx - 1 : stageIdx + 1
    if (swapIdx < 0 || swapIdx >= stageAssets.length) return
    const swapAsset = stageAssets[swapIdx]
    const globalSwapIdx = allAssets.findIndex((a) => a.id === swapAsset.id)
    // Swap in the full array
    allAssets[idx] = swapAsset
    allAssets[globalSwapIdx] = asset
    // Save the whole campaign with the reordered assets
    fetch(`/api/campaigns/${product}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...campaign, assets: allAssets }),
    }).then(() => queryClient.invalidateQueries({ queryKey: ['campaign', product] }))
  }

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
      awareness: [],
      familiarity: [],
      consideration: [],
      decision: [],
    }
    for (const a of filtered) {
      groups[a.stage]?.push(a)
    }
    return groups
  }, [filtered])

  if (!product) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No product selected"
        description="Select a product to view its campaign flow."
      />
    )
  }

  return (
    <>
    {/* Edit asset dialog */}
    {editAsset && (
      <AssetDialog
        open={!!editAsset}
        onClose={() => setEditAsset(null)}
        framework={framework}
        asset={editAsset}
        onSave={(updated) => {
          updateMutation.mutate(updated)
          setEditAsset(null)
        }}
        saving={updateMutation.isPending}
      />
    )}
    <div className="pb-8">
      <PageHeader
        title="Campaign Flow"
        description={`Buyer journey · ${framework?.name ?? product} · ${filtered.length} assets`}
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
              className="w-44"
            />
            <Select
              placeholder="All channels"
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              options={[{ value: '', label: 'All channels' }, ...ALL_CHANNELS]}
              className="w-44"
            />
            <Select
              placeholder="All regions"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              options={[{ value: '', label: 'All regions' }, ...ALL_REGIONS]}
              className="w-40"
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

      {/* Flow stages — horizontal on desktop, vertical on mobile */}
      <div className="px-4 md:px-6">
        {/* Desktop: horizontal flow */}
        <div className="hidden md:flex items-start gap-3">
          {ASSET_STAGES.map((stage, i) => (
            <div key={stage} className="flex items-start flex-1 min-w-0">
              <FlowColumn
                stage={stage}
                assets={byStage[stage]}
                stageConfig={framework?.flowStages?.[stage]}
                editMode={editMode}
                onEditAsset={setEditAsset}
                onMoveAsset={moveAsset}
              />
              {i < ASSET_STAGES.length - 1 && (
                <div className="flex items-center justify-center w-6 shrink-0 mt-10">
                  <ArrowRight size={16} className="text-zinc-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical flow */}
        <div className="md:hidden space-y-4">
          {ASSET_STAGES.map((stage, i) => (
            <div key={stage}>
              <FlowColumn
                stage={stage}
                assets={byStage[stage]}
                stageConfig={framework?.flowStages?.[stage]}
                mobile
                editMode={editMode}
                onEditAsset={setEditAsset}
                onMoveAsset={moveAsset}
              />
              {i < ASSET_STAGES.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="w-px h-6 bg-zinc-200" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

// ─── Flow Column ──────────────────────────────────────────────────────────────

function FlowColumn({
  stage,
  assets,
  stageConfig,
  mobile,
  editMode,
  onEditAsset,
  onMoveAsset,
}: {
  stage: AssetStage
  assets: Asset[]
  stageConfig?: { label: string; subtitle: string }
  mobile?: boolean
  editMode?: boolean
  onEditAsset?: (asset: Asset) => void
  onMoveAsset?: (assetId: string, direction: 'up' | 'down') => void
}) {
  const live = assets.filter((a) => a.status === 'live').length

  return (
    <div className={cn('flex flex-col gap-2', !mobile && 'flex-1 min-w-0')}>
      {/* Stage header */}
      <div
        className={cn(
          'rounded-xl border-t-4 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700',
          STAGE_ACCENT[stage]
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-md border', STAGE_COLORS[stage])}>
            {STAGE_LABELS[stage]}
          </span>
          <span className="text-[10px] text-zinc-400">
            {live}/{assets.length}
          </span>
        </div>
        {stageConfig?.subtitle && (
          <p className="text-xs text-zinc-500 mt-1 leading-snug">{stageConfig.subtitle}</p>
        )}
      </div>

      {/* Assets */}
      <div className={cn('space-y-2', mobile && 'grid grid-cols-2 gap-2 space-y-0')}>
        {assets.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl py-6 text-center">
            <p className="text-xs text-zinc-300 dark:text-zinc-600">No assets</p>
          </div>
        ) : (
          assets.map((asset, i) => (
            <Card key={asset.id} padding="none" className="overflow-hidden">
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm shrink-0">{TYPE_ICONS[asset.type]}</span>
                    <span className="text-[10px] text-zinc-500 font-medium truncate">
                      {TYPE_LABELS[asset.type]}
                    </span>
                  </div>
                  {editMode && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => onMoveAsset?.(asset.id, 'up')}
                        disabled={i === 0}
                        className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp size={11} />
                      </button>
                      <button
                        onClick={() => onMoveAsset?.(asset.id, 'down')}
                        disabled={i === assets.length - 1}
                        className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown size={11} />
                      </button>
                      <button
                        onClick={() => onEditAsset?.(asset)}
                        className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                      >
                        <Pencil size={10} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2">
                  {asset.name}
                </p>
                <div className="flex items-center gap-1 flex-wrap">
                  <span
                    className={cn(
                      'inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold border',
                      STATUS_COLORS[asset.status]
                    )}
                  >
                    {STATUS_LABELS[asset.status]}
                  </span>
                  {asset.channels.slice(0, 1).map((ch) => (
                    <Badge key={ch} className="text-[9px]">{ch}</Badge>
                  ))}
                </div>
              </div>

              {/* Next touchpoints */}
              {asset.next_touchpoints && asset.next_touchpoints.length > 0 && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 px-3 py-1.5">
                  <p className="text-[9px] text-zinc-400">
                    → {asset.next_touchpoints.length} next touchpoint{asset.next_touchpoints.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
