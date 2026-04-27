'use client'

import { useState, useEffect } from 'react'
import { Asset, Framework, AssetStage, AssetStatus, AssetType } from '@/types'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import {
  ASSET_STAGES,
  STAGE_LABELS,
  TYPE_LABELS,
  STATUS_LABELS,
  CONTENT_TYPES,
  ALL_CHANNELS,
  ALL_REGIONS,
  ALL_LANGUAGES,
  generateId,
} from '@/lib/utils'
import { cn } from '@/lib/utils'

const STAGE_OPTIONS = ASSET_STAGES.map((s) => ({ value: s, label: STAGE_LABELS[s] }))
const TYPE_OPTIONS = CONTENT_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))
const STATUS_OPTIONS = (['draft', 'in_progress', 'live', 'refreshing', 'archived'] as AssetStatus[]).map(
  (s) => ({ value: s, label: STATUS_LABELS[s] })
)

interface AssetDialogProps {
  open: boolean
  onClose: () => void
  framework?: Framework
  asset?: Asset
  onSave: (asset: Asset) => void
  saving: boolean
}

const DEFAULT: Partial<Asset> = {
  type: 'WHITEPAPER',
  stage: 'awareness',
  status: 'draft',
  channels: [],
  personas: [],
  regions: [],
  languages: ['english'],
  pillar: null,
}

export function AssetDialog({ open, onClose, framework, asset, onSave, saving }: AssetDialogProps) {
  const [form, setForm] = useState<Partial<Asset>>(asset ?? DEFAULT)

  useEffect(() => {
    setForm(asset ?? DEFAULT)
  }, [asset?.id, open]) // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof Asset>(key: K, value: Asset[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleArray(key: 'channels' | 'personas' | 'regions' | 'languages', value: string) {
    const arr = (form[key] as string[]) ?? []
    set(key, (arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]) as never)
  }

  function handleSave() {
    if (!form.name?.trim()) return
    const assetToSave: Asset = {
      id: asset?.id ?? generateId('asset'),
      type: (form.type ?? 'WHITEPAPER') as AssetType,
      name: form.name ?? '',
      stage: (form.stage ?? 'awareness') as AssetStage,
      status: (form.status ?? 'draft') as AssetStatus,
      pillar: form.pillar ?? null,
      channels: form.channels ?? [],
      personas: form.personas ?? [],
      regions: form.regions ?? [],
      languages: form.languages ?? [],
      description: form.description,
      url: form.url,
      content: form.content,
      createdAt: asset?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSave(assetToSave)
  }

  const personaOptions = framework?.personas ?? []

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={asset ? 'Edit Asset' : 'Add Asset'}
      size="lg"
    >
      <div className="space-y-4">
        {/* Name */}
        <Input
          label="Asset Name *"
          value={form.name ?? ''}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Data 360 Whitepaper — CDO"
        />

        {/* Type + Stage row */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            value={form.type ?? 'WHITEPAPER'}
            onChange={(e) => set('type', e.target.value as AssetType)}
            options={TYPE_OPTIONS}
          />
          <Select
            label="Stage"
            value={form.stage ?? 'awareness'}
            onChange={(e) => set('stage', e.target.value as AssetStage)}
            options={STAGE_OPTIONS}
          />
        </div>

        {/* Status + Pillar row */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status"
            value={form.status ?? 'draft'}
            onChange={(e) => set('status', e.target.value as AssetStatus)}
            options={STATUS_OPTIONS}
          />
          {framework?.pillars?.length ? (
            <Select
              label="Pillar"
              value={form.pillar ?? ''}
              onChange={(e) => set('pillar', e.target.value || null)}
              options={[
                { value: '', label: 'None' },
                ...framework.pillars.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          ) : (
            <Input
              label="Pillar"
              value={form.pillar ?? ''}
              onChange={(e) => set('pillar', e.target.value || null)}
              placeholder="Optional"
            />
          )}
        </div>

        {/* URL */}
        <Input
          label="Asset URL"
          value={form.url ?? ''}
          onChange={(e) => set('url', e.target.value)}
          placeholder="https://"
          type="url"
        />

        {/* Description */}
        <Textarea
          label="Description"
          value={form.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          placeholder="Brief description of this asset…"
        />

        {/* Channels */}
        <div>
          <p className="text-xs font-medium text-zinc-700 mb-2">Channels</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CHANNELS.map(({ value, label }) => (
              <CheckChip
                key={value}
                label={label}
                selected={(form.channels ?? []).includes(value)}
                onClick={() => toggleArray('channels', value)}
              />
            ))}
          </div>
        </div>

        {/* Personas */}
        {personaOptions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-zinc-700 mb-2">Target Personas</p>
            <div className="flex flex-wrap gap-1.5">
              {personaOptions.map((p) => (
                <CheckChip
                  key={p}
                  label={p}
                  selected={(form.personas ?? []).includes(p.toLowerCase().replace(/\s+/g, '-'))}
                  onClick={() => toggleArray('personas', p.toLowerCase().replace(/\s+/g, '-'))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regions */}
        <div>
          <p className="text-xs font-medium text-zinc-700 mb-2">Regions</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_REGIONS.map(({ value, label }) => (
              <CheckChip
                key={value}
                label={label}
                selected={(form.regions ?? []).includes(value)}
                onClick={() => toggleArray('regions', value)}
              />
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={!form.name?.trim()}
          >
            {asset ? 'Save Changes' : 'Add Asset'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

function CheckChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
        selected
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700'
      )}
    >
      {label}
    </button>
  )
}
