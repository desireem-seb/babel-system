'use client'

import { useMemo, useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { Framework, Campaign, Asset, AssetStage } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Download,
  Presentation,
  Copy,
} from 'lucide-react'
import {
  STAGE_COLORS,
  STAGE_LABELS,
  TYPE_ICONS,
  TYPE_LABELS,
  getWeeksForQuarter,
  getCurrentQuarter,
} from '@/lib/utils'
import { cn } from '@/lib/utils'

const FUNNEL_STAGES: AssetStage[] = ['awareness', 'familiarity', 'consideration', 'decision']
const STAGE_LABELS_SHORT: Record<AssetStage, string> = {
  awareness: 'Awareness',
  familiarity: 'Familiarity',
  consideration: 'Consider',
  decision: 'Decision',
}

interface CalendarClientProps {
  frameworks: Framework[]
  initialCampaign: Campaign | null
}

export function CalendarClient({ frameworks, initialCampaign }: CalendarClientProps) {
  const { selectedProduct, calendarQuarterOffset, setCalendarQuarterOffset } = useStore()
  const product = selectedProduct ?? frameworks[0]?.id
  const [copying, setCopying] = useState(false)
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

  const weeks = useMemo(
    () => getWeeksForQuarter(calendarQuarterOffset),
    [calendarQuarterOffset]
  )

  const quarterLabel = useMemo(() => {
    if (calendarQuarterOffset === 0) return getCurrentQuarter()
    const first = weeks[0]
    const q = Math.floor(first.getMonth() / 3) + 1
    return `Q${q}-${first.getFullYear()}`
  }, [calendarQuarterOffset, weeks])

  const framework = frameworks.find((f) => f.id === product)
  const assets = campaign?.assets ?? []

  // Map assets to weeks by launchDate or createdAt
  const assetsByWeek = useMemo(() => {
    const map: Record<number, Asset[]> = {}
    for (let i = 0; i < weeks.length; i++) {
      map[i] = []
    }
    for (const asset of assets) {
      const dateStr = asset.launchDate ?? asset.createdAt
      if (!dateStr) continue
      const d = new Date(dateStr)
      for (let i = 0; i < weeks.length - 1; i++) {
        if (d >= weeks[i] && d < weeks[i + 1]) {
          map[i] = [...(map[i] ?? []), asset]
          break
        }
      }
    }
    return map
  }, [assets, weeks])

  function exportCalendarCSV() {
    const headers = ['Week', 'Week Start', 'Stage', 'Type', 'Asset Name', 'Status', 'Channels', 'Launch Date']
    const rows: string[][] = []
    for (let wi = 0; wi < weeks.length - 1; wi++) {
      const weekAssets = assetsByWeek[wi] ?? []
      for (const a of weekAssets) {
        rows.push([
          `W${wi + 1}`,
          weeks[wi].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          a.stage,
          TYPE_LABELS[a.type] ?? a.type,
          a.name,
          a.status,
          (a.channels ?? []).join('; '),
          a.launchDate ?? '',
        ])
      }
    }
    if (rows.length === 0) {
      // Include all assets even if no launch date
      assets.forEach((a) => {
        rows.push(['—', '—', a.stage, TYPE_LABELS[a.type] ?? a.type, a.name, a.status, (a.channels ?? []).join('; '), a.launchDate ?? ''])
      })
    }
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${product}-calendar-${quarterLabel}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportHTMLSlides() {
    const fw = framework
    const stageColors: Record<string, string> = {
      awareness: '#7c3aed',
      familiarity: '#2563eb',
      consideration: '#d97706',
      decision: '#059669',
    }

    const weekSlides = weeks.slice(0, -1).map((week, wi) => {
      const weekAssets = (assetsByWeek[wi] ?? [])
      if (weekAssets.length === 0) return ''
      return `
        <section class="slide">
          <div class="slide-header">
            <span class="quarter-label">${quarterLabel}</span>
            <h2>Week ${wi + 1} — ${week.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h2>
          </div>
          <div class="asset-grid">
            ${weekAssets.map((a) => `
              <div class="asset-card" style="border-left: 4px solid ${stageColors[a.stage] ?? '#6366f1'}">
                <div class="asset-icon">${TYPE_ICONS[a.type] ?? ''}</div>
                <div class="asset-info">
                  <div class="asset-name">${a.name}</div>
                  <div class="asset-meta">${STAGE_LABELS[a.stage]} · ${TYPE_LABELS[a.type] ?? a.type} · <span class="status-${a.status}">${a.status}</span></div>
                  ${a.description ? `<div class="asset-desc">${a.description}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>`
    }).filter(Boolean).join('\n')

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fw?.name ?? product} — ${quarterLabel} Campaign Calendar</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f7; color: #18181b; }
  .title-slide { background: linear-gradient(135deg, #009EDB 0%, #0070D2 100%); color: white; padding: 80px 60px; min-height: 400px; display: flex; flex-direction: column; justify-content: center; margin-bottom: 24px; border-radius: 16px; }
  .title-slide h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 12px; }
  .title-slide p { font-size: 1.1rem; opacity: 0.85; }
  .slide { background: white; border-radius: 16px; padding: 40px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); page-break-after: always; }
  .slide-header { margin-bottom: 24px; }
  .quarter-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #6366f1; font-weight: 600; }
  .slide-header h2 { font-size: 1.4rem; font-weight: 700; margin-top: 4px; }
  .asset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
  .asset-card { display: flex; gap: 12px; padding: 14px; border-radius: 10px; background: #f8f8fa; border-left: 4px solid #6366f1; }
  .asset-icon { font-size: 1.5rem; }
  .asset-name { font-size: 0.9rem; font-weight: 600; margin-bottom: 4px; }
  .asset-meta { font-size: 0.75rem; color: #71717a; }
  .asset-desc { font-size: 0.75rem; color: #a1a1aa; margin-top: 4px; }
  .status-live { color: #059669; font-weight: 600; }
  .status-draft { color: #a1a1aa; }
  .status-in_progress { color: #2563eb; font-weight: 600; }
  .status-refreshing { color: #d97706; font-weight: 600; }
  .summary-slide { background: white; border-radius: 16px; padding: 40px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px; }
  .summary-card { text-align: center; padding: 20px; border-radius: 10px; }
  .summary-num { font-size: 2rem; font-weight: 700; }
  .summary-label { font-size: 0.75rem; color: #71717a; margin-top: 4px; }
  @media print { body { background: white; } .slide, .title-slide, .summary-slide { box-shadow: none; page-break-after: always; } }
</style>
</head>
<body>
<div class="title-slide">
  <h1>${fw?.name ?? product}</h1>
  <p>${quarterLabel} Campaign Calendar · ${assets.length} assets</p>
  ${fw?.tagline ? `<p style="margin-top:8px;font-style:italic;opacity:0.7">${fw.tagline}</p>` : ''}
</div>

<div class="summary-slide">
  <span class="quarter-label">Summary</span>
  <h2 style="font-size:1.4rem;font-weight:700;margin-top:4px">Campaign Overview · ${quarterLabel}</h2>
  <div class="summary-grid">
    <div class="summary-card" style="background:#f5f3ff">
      <div class="summary-num" style="color:#7c3aed">${assets.filter((a) => a.stage === 'awareness').length}</div>
      <div class="summary-label">Awareness</div>
    </div>
    <div class="summary-card" style="background:#eff6ff">
      <div class="summary-num" style="color:#2563eb">${assets.filter((a) => a.stage === 'familiarity').length}</div>
      <div class="summary-label">Familiarity</div>
    </div>
    <div class="summary-card" style="background:#fffbeb">
      <div class="summary-num" style="color:#d97706">${assets.filter((a) => a.stage === 'consideration').length}</div>
      <div class="summary-label">Consideration</div>
    </div>
    <div class="summary-card" style="background:#ecfdf5">
      <div class="summary-num" style="color:#059669">${assets.filter((a) => a.status === 'live').length}</div>
      <div class="summary-label">Live</div>
    </div>
  </div>
</div>

${weekSlides}
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${product}-${quarterLabel}-slides.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copyQuarterForward() {
    if (!product || assets.length === 0) return
    setCopying(true)
    try {
      // Duplicate all assets into the next quarter — update their quarters tag and reset status to draft
      const nextQuarterOffset = calendarQuarterOffset + 1
      const nextWeeks = getWeeksForQuarter(nextQuarterOffset)
      const nextQ = Math.floor(nextWeeks[0].getMonth() / 3) + 1
      const nextYear = nextWeeks[0].getFullYear()
      const nextQuarterLabel = `Q${nextQ}-${nextYear}`

      for (const asset of assets) {
        const copy = {
          ...asset,
          id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: `${asset.name} (${nextQuarterLabel})`,
          status: 'draft' as const,
          quarters: [...(asset.quarters ?? []), nextQuarterLabel],
          launchDate: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await fetch(`/api/campaigns/${product}/assets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(copy),
        })
      }
      queryClient.invalidateQueries({ queryKey: ['campaign', product] })
      setCalendarQuarterOffset(nextQuarterOffset)
    } finally {
      setCopying(false)
    }
  }

  if (!product) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No product selected"
        description="Select a product to view its campaign calendar."
      />
    )
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Campaign Calendar"
        description={`13-week planning view · ${quarterLabel}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={<Download size={14} />}
              onClick={exportCalendarCSV}
              disabled={assets.length === 0}
            >
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<Presentation size={14} />}
              onClick={exportHTMLSlides}
              disabled={assets.length === 0}
            >
              <span className="hidden sm:inline">Slides</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<Copy size={14} />}
              onClick={copyQuarterForward}
              loading={copying}
              disabled={assets.length === 0}
              title="Copy all assets to next quarter as drafts"
            >
              <span className="hidden sm:inline">Copy to next Q</span>
            </Button>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                icon={<ChevronLeft size={14} />}
                onClick={() => setCalendarQuarterOffset(calendarQuarterOffset - 1)}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCalendarQuarterOffset(0)}
                className="text-xs px-2"
              >
                Today
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<ChevronRight size={14} />}
                onClick={() => setCalendarQuarterOffset(calendarQuarterOffset + 1)}
              />
            </div>
          </div>
        }
      />

      {/* Desktop grid */}
      <div className="px-4 md:px-6 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Week headers */}
          <div className="grid gap-px mb-1" style={{ gridTemplateColumns: `100px repeat(13, 1fr)` }}>
            <div />
            {weeks.map((w, i) => (
              <div key={i} className="text-center py-1.5">
                <span className="text-[10px] font-medium text-zinc-400">
                  W{i + 1}
                </span>
                <div className="text-[9px] text-zinc-300 mt-0.5">
                  {w.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>

          {/* Stage rows */}
          {FUNNEL_STAGES.map((stage) => (
            <div
              key={stage}
              className="grid gap-px mb-2"
              style={{ gridTemplateColumns: `100px repeat(13, 1fr)` }}
            >
              {/* Stage label */}
              <div className="flex items-center pr-2">
                <span
                  className={cn(
                    'text-[11px] font-semibold px-2 py-1 rounded-lg border w-full text-center',
                    STAGE_COLORS[stage]
                  )}
                >
                  {STAGE_LABELS_SHORT[stage]}
                </span>
              </div>

              {/* Week cells */}
              {weeks.map((_, wi) => {
                const weekAssets = (assetsByWeek[wi] ?? []).filter(
                  (a) => a.stage === stage
                )
                return (
                  <div
                    key={wi}
                    className="min-h-[52px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg p-1 space-y-1"
                  >
                    {weekAssets.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-1 px-1.5 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 cursor-default group"
                        title={a.name}
                      >
                        <span className="text-[11px] shrink-0">{TYPE_ICONS[a.type]}</span>
                        <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300 truncate leading-tight">
                          {a.name.slice(0, 22)}{a.name.length > 22 ? '…' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: list view */}
      <div className="md:hidden px-4 mt-4 space-y-2">
        <p className="text-xs text-zinc-400 font-medium">
          Rotate to landscape or use desktop for the full grid view.
        </p>
        {assets.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No assets scheduled"
            description="Add launch dates to assets to see them on the calendar."
          />
        ) : (
          <div className="space-y-2">
            {[...assets]
              .filter((a) => a.launchDate ?? a.createdAt)
              .sort((a, b) =>
                new Date(a.launchDate ?? a.createdAt!).getTime() -
                new Date(b.launchDate ?? b.createdAt!).getTime()
              )
              .map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700"
                >
                  <span className="text-lg">{TYPE_ICONS[a.type]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{a.name}</p>
                    <p className="text-xs text-zinc-400">
                      {new Date(a.launchDate ?? a.createdAt!).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge className={cn('shrink-0', STAGE_COLORS[a.stage])}>
                    {STAGE_LABELS_SHORT[a.stage]}
                  </Badge>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
