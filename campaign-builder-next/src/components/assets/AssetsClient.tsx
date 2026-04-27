'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/hooks/useStore'
import { Framework, Campaign, Asset, AssetStage, AssetStatus } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { AssetCard } from './AssetCard'
import { AssetDialog } from './AssetDialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Package,
  SlidersHorizontal,
  X,
  Download,
  Sparkles,
  CheckSquare,
} from 'lucide-react'

import {
  ASSET_STAGES,
  STAGE_LABELS,
  TYPE_LABELS,
  STATUS_LABELS,
  CONTENT_TYPES,
  generateId,
} from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AssetsClientProps {
  frameworks: Framework[]
  initialCampaign: Campaign | null
  initialProduct: string | null
}

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))
const TYPE_OPTIONS = CONTENT_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))

export function AssetsClient({ frameworks, initialCampaign, initialProduct }: AssetsClientProps) {
  const { selectedProduct, assetFilters, setAssetFilter, resetAssetFilters } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [editAsset, setEditAsset] = useState<Asset | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [suggestions, setSuggestions] = useState<Asset[] | null>(null)
  const [suggestError, setSuggestError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  const queryClient = useQueryClient()

  const product = selectedProduct ?? initialProduct

  const { data: campaign, isLoading } = useQuery({
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

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const addMutation = useMutation({
    mutationFn: async (asset: Asset) => {
      const res = await fetch(`/api/campaigns/${product}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      })
      if (!res.ok) throw new Error('Failed to add asset')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaign', product] }),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ assetId, updates }: { assetId: string; updates: Partial<Asset> }) => {
      const res = await fetch(`/api/campaigns/${product}/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update asset')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaign', product] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const res = await fetch(`/api/campaigns/${product}/assets/${assetId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete asset')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaign', product] }),
  })

  function duplicateAsset(asset: Asset) {
    const copy: Asset = {
      ...asset,
      id: generateId('asset'),
      name: `${asset.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addMutation.mutate(copy)
  }

  function exportCSV() {
    const assets = campaign?.assets ?? []
    const headers = [
      'ID', 'Name', 'Type', 'Stage', 'Status', 'Pillar',
      'Channels', 'Personas', 'Regions', 'Languages', 'Quarters',
      'Description', 'URL', 'Launch Date',
    ]
    const rows = assets.map((a) => [
      a.id,
      a.name,
      TYPE_LABELS[a.type] ?? a.type,
      a.stage,
      a.status,
      a.pillar ?? '',
      (a.channels ?? []).join('; '),
      (a.personas ?? []).join('; '),
      (a.regions ?? []).join('; '),
      (a.languages ?? []).join('; '),
      (a.quarters ?? []).join('; '),
      a.description ?? '',
      a.url ?? '',
      a.launchDate ?? '',
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${product}-assets.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function suggestAssets() {
    if (!product || !framework) return
    setSuggesting(true)
    setSuggestError(null)
    setSuggestions(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          contentType: 'Asset Suggestions',
          stage: 'awareness',
          audience: 'general',
          customPrompt: `Suggest 6 high-impact marketing assets for ${framework.name}. Return a JSON array of asset suggestions with fields: name, type (one of EMAIL/BLOG_POST/WHITEPAPER/LANDING_PAGE/SOLUTION_BRIEF/CASE_STUDY/WEBINAR/SOCIAL_POST/VIDEO_SCRIPT/NEWSLETTER/DATASHEET), stage (awareness/familiarity/consideration/decision), description.`,
          mode: 'suggestions',
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setSuggestError(data.error ?? 'Could not generate suggestions.')
      } else if (data.suggestions) {
        setSuggestions(data.suggestions)
      } else if (data.asset) {
        // Fallback: parse suggestions from content
        setSuggestions(null)
        setSuggestError('Received content instead of suggestions. Use the Generator tab for full content.')
      }
    } catch {
      setSuggestError('Network error. Please try again.')
    } finally {
      setSuggesting(false)
    }
  }

  async function bulkUpdateStatus(status: AssetStatus) {
    for (const id of Array.from(selectedIds)) {
      await updateMutation.mutateAsync({ assetId: id, updates: { status } })
    }
    setSelectedIds(new Set())
    setBulkMode(false)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelectedIds(new Set(filtered.map((a) => a.id)))
  }

  // ─── Filter logic ────────────────────────────────────────────────────────────

  const allAssets = campaign?.assets ?? []

  const filtered = useMemo(() => {
    return allAssets.filter((a) => {
      const q = assetFilters.search.toLowerCase()
      if (q && !a.name.toLowerCase().includes(q) && !a.description?.toLowerCase().includes(q))
        return false
      if (assetFilters.stage !== 'all' && a.stage !== assetFilters.stage) return false
      if (assetFilters.status !== 'all' && a.status !== assetFilters.status) return false
      if (assetFilters.type !== 'all' && a.type !== assetFilters.type) return false
      return true
    })
  }, [allAssets, assetFilters])

  const activeFilterCount = [
    assetFilters.stage !== 'all',
    assetFilters.status !== 'all',
    assetFilters.type !== 'all',
  ].filter(Boolean).length

  // Group by stage
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
        icon={Package}
        title="No product selected"
        description="Select a product from the dropdown above."
      />
    )
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Asset Repository"
        description={`${allAssets.length} assets across ${framework?.name ?? product}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<Sparkles size={14} />}
              onClick={suggestAssets}
              loading={suggesting}
            >
              <span className="hidden sm:inline">Suggest</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<Download size={14} />}
              onClick={exportCSV}
              disabled={allAssets.length === 0}
            >
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button
              size="sm"
              variant={bulkMode ? 'primary' : 'outline'}
              icon={<CheckSquare size={14} />}
              onClick={() => { setBulkMode((v) => !v); setSelectedIds(new Set()) }}
            >
              <span className="hidden sm:inline">{bulkMode ? 'Cancel' : 'Select'}</span>
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => setAddOpen(true)}
            >
              Add Asset
            </Button>
          </div>
        }
      />

      {/* Suggestions panel */}
      {(suggestions || suggestError) && (
        <div className="px-4 md:px-6 mb-4">
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-indigo-900 flex items-center gap-1.5">
                <Sparkles size={14} />
                Asset Suggestions
              </p>
              <button
                onClick={() => { setSuggestions(null); setSuggestError(null) }}
                className="text-indigo-400 hover:text-indigo-600 text-xs"
              >
                Dismiss
              </button>
            </div>
            {suggestError && (
              <p className="text-xs text-red-600">{suggestError}</p>
            )}
            {suggestions && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {suggestions.map((s, i) => (
                  <div key={i} className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-indigo-100 dark:border-indigo-900 space-y-1.5">
                    <p className="text-xs font-semibold text-zinc-800 line-clamp-2">{s.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded">{TYPE_LABELS[s.type] ?? s.type}</span>
                      <span className="text-[10px] text-zinc-500">{STAGE_LABELS[s.stage]}</span>
                    </div>
                    {s.description && (
                      <p className="text-[11px] text-zinc-500 line-clamp-2">{s.description}</p>
                    )}
                    <button
                      onClick={() => {
                        addMutation.mutate({ ...s, id: generateId('asset'), status: 'draft', channels: [], personas: [], regions: [], languages: [], quarters: [] })
                        setSuggestions((prev) => prev ? prev.filter((_, j) => j !== i) : null)
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      + Add to assets
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search + filter bar */}
      <div className="px-4 md:px-6 mb-4 space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search assets…"
              value={assetFilters.search}
              onChange={(e) => setAssetFilter('search', e.target.value)}
              icon={<Search size={14} />}
            />
          </div>
          <Button
            size="md"
            variant="outline"
            icon={<SlidersHorizontal size={14} />}
            onClick={() => setShowFilters((v) => !v)}
            className={cn(activeFilterCount > 0 && 'border-indigo-300 text-indigo-700')}
          >
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Select
              placeholder="All stages"
              value={assetFilters.stage}
              onChange={(e) => setAssetFilter('stage', e.target.value as AssetStage | 'all')}
              options={[
                { value: 'all', label: 'All stages' },
                ...ASSET_STAGES.map((s) => ({ value: s, label: STAGE_LABELS[s] })),
              ]}
              className="w-full sm:w-36"
            />
            <Select
              placeholder="All statuses"
              value={assetFilters.status}
              onChange={(e) => setAssetFilter('status', e.target.value as typeof assetFilters.status)}
              options={[{ value: 'all', label: 'All statuses' }, ...STATUS_OPTIONS]}
              className="w-full sm:w-36"
            />
            <Select
              placeholder="All types"
              value={assetFilters.type}
              onChange={(e) => setAssetFilter('type', e.target.value as typeof assetFilters.type)}
              options={[{ value: 'all', label: 'All types' }, ...TYPE_OPTIONS]}
              className="w-full sm:w-40"
            />
            {activeFilterCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                icon={<X size={12} />}
                onClick={resetAssetFilters}
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {bulkMode && (
        <div className="px-4 md:px-6 mb-3">
          <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <button onClick={selectAll} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Select all ({filtered.length})
            </button>
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-500">{selectedIds.size} selected</span>
            {selectedIds.size > 0 && (
              <>
                <span className="text-zinc-300 ml-1">·</span>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1">Set status:</span>
                {(['live', 'in_progress', 'draft', 'refreshing', 'archived'] as AssetStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => bulkUpdateStatus(s)}
                    className="text-xs px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Stage columns / sections */}
      {isLoading ? (
        <div className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {ASSET_STAGES.map((s) => (
            <div key={s} className="space-y-3">
              <div className="skeleton h-5 w-24" />
              <div className="skeleton h-32 w-full" />
              <div className="skeleton h-32 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {ASSET_STAGES.map((stage) => {
            const stageAssets = byStage[stage]
            return (
              <StageColumn
                key={stage}
                stage={stage}
                assets={stageAssets}
                onEdit={setEditAsset}
                onDelete={(id) => deleteMutation.mutate(id)}
                onDuplicate={duplicateAsset}
                onStatusChange={(id, status) =>
                  updateMutation.mutate({ assetId: id, updates: { status } })
                }
                bulkMode={bulkMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            )
          })}
        </div>
      )}

      {/* Add dialog */}
      <AssetDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        framework={framework}
        onSave={(asset) => { addMutation.mutate(asset); setAddOpen(false) }}
        saving={addMutation.isPending}
      />

      {/* Edit dialog */}
      {editAsset && (
        <AssetDialog
          open={!!editAsset}
          onClose={() => setEditAsset(null)}
          framework={framework}
          asset={editAsset}
          onSave={(updates) => {
            updateMutation.mutate({ assetId: editAsset.id, updates })
            setEditAsset(null)
          }}
          saving={updateMutation.isPending}
        />
      )}
    </div>
  )
}

// ─── Stage Column ─────────────────────────────────────────────────────────────

const STAGE_HEADER_COLORS: Record<AssetStage, string> = {
  awareness: 'text-violet-700 bg-violet-50 border-violet-200',
  familiarity: 'text-blue-700 bg-blue-50 border-blue-200',
  consideration: 'text-amber-700 bg-amber-50 border-amber-200',
  decision: 'text-emerald-700 bg-emerald-50 border-emerald-200',
}

function StageColumn({
  stage,
  assets,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  bulkMode,
  selectedIds,
  onToggleSelect,
}: {
  stage: AssetStage
  assets: Asset[]
  onEdit: (asset: Asset) => void
  onDelete: (id: string) => void
  onDuplicate: (asset: Asset) => void
  onStatusChange: (id: string, status: Asset['status']) => void
  bulkMode: boolean
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
}) {
  const live = assets.filter((a) => a.status === 'live').length

  return (
    <div className="space-y-2.5">
      {/* Stage header */}
      <div className={cn('flex items-center justify-between px-3 py-2 rounded-lg border', STAGE_HEADER_COLORS[stage])}>
        <span className="text-xs font-semibold">{STAGE_LABELS[stage]}</span>
        <span className="text-[10px] font-medium opacity-70">
          {live} live · {assets.length} total
        </span>
      </div>

      {/* Assets */}
      {assets.length === 0 ? (
        <div className="border-2 border-dashed border-zinc-200 rounded-xl py-8 text-center">
          <p className="text-xs text-zinc-400">No assets</p>
        </div>
      ) : (
        assets.map((asset) => (
          <div key={asset.id} className="relative">
            {bulkMode && (
              <button
                onClick={() => onToggleSelect(asset.id)}
                className={cn(
                  'absolute -left-1.5 -top-1.5 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  selectedIds.has(asset.id)
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 hover:border-indigo-400'
                )}
              >
                {selectedIds.has(asset.id) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            )}
            <AssetCard
              asset={asset}
              onEdit={() => onEdit(asset)}
              onDelete={() => onDelete(asset.id)}
              onDuplicate={() => onDuplicate(asset)}
              onStatusChange={(status) => onStatusChange(asset.id, status)}
            />
          </div>
        ))
      )}
    </div>
  )
}
