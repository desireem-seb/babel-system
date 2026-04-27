'use client'

import { useState, useRef } from 'react'
import { useStore } from '@/hooks/useStore'
import { Framework, Asset, AssetStage, AssetType } from '@/types'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Maximize2,
  X,
  Upload,
  FileText,
  Plus,
} from 'lucide-react'
import {
  ASSET_STAGES,
  STAGE_LABELS,
  TYPE_LABELS,
  CONTENT_TYPES,
  STATUS_COLORS,
  generateId,
} from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Campaign } from '@/types'

const STAGE_OPTIONS = ASSET_STAGES.map((s) => ({ value: s, label: STAGE_LABELS[s] }))
const TYPE_OPTIONS = CONTENT_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))

interface GeneratorClientProps {
  frameworks: Framework[]
}

export function GeneratorClient({ frameworks }: GeneratorClientProps) {
  const { selectedProduct } = useStore()
  const product = selectedProduct ?? frameworks[0]?.id
  const framework = frameworks.find((f) => f.id === product)

  const [contentType, setContentType] = useState<string>('WHITEPAPER')
  const [stage, setStage] = useState<AssetStage>('awareness')
  const [audience, setAudience] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<Asset | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Upload-your-own state
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [uploadType, setUploadType] = useState<AssetType>('WHITEPAPER')
  const [uploadStage, setUploadStage] = useState<AssetStage>('awareness')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadUrl, setUploadUrl] = useState('')
  const [uploadFileName, setUploadFileName] = useState('')
  const [uploadContent, setUploadContent] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const queryClient = useQueryClient()

  // Load existing generated assets
  const { data: campaign, refetch } = useQuery({
    queryKey: ['campaign', product],
    queryFn: async () => {
      if (!product) return null
      const res = await fetch(`/api/campaigns/${product}`)
      if (!res.ok) return null
      return res.json() as Promise<Campaign>
    },
    enabled: !!product,
  })

  const uploadMutation = useMutation({
    mutationFn: async (asset: Asset) => {
      const res = await fetch(`/api/campaigns/${product}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      })
      if (!res.ok) throw new Error('Failed to save asset')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', product] })
      setUploadOpen(false)
      setUploadName('')
      setUploadDescription('')
      setUploadUrl('')
      setUploadFileName('')
      setUploadContent('')
      setUploadError(null)
    },
    onError: () => setUploadError('Failed to save asset. Please try again.'),
  })

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadFileName(file.name)
    if (!uploadName) setUploadName(file.name.replace(/\.[^/.]+$/, ''))
    const reader = new FileReader()
    reader.onload = (ev) => setUploadContent(ev.target?.result as string)
    reader.readAsText(file)
  }

  function saveUploadedAsset() {
    if (!uploadName.trim() || !product) return
    setUploadError(null)
    const asset: Asset = {
      id: generateId('asset'),
      type: uploadType,
      name: uploadName.trim(),
      stage: uploadStage,
      status: 'draft',
      pillar: null,
      channels: [],
      personas: [],
      regions: [],
      languages: [],
      description: uploadDescription || undefined,
      url: uploadUrl || undefined,
      content: uploadContent ? { title: uploadName.trim(), body: uploadContent } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    uploadMutation.mutate(asset)
  }

  const personaOptions = (framework?.personas ?? []).map((p) => ({
    value: p.toLowerCase().replace(/\s+/g, '-'),
    label: p,
  }))

  async function generate() {
    if (!product || !audience) return
    setGenerating(true)
    setError(null)
    setResult(null)

    try {
      const typeLabel = TYPE_LABELS[contentType as keyof typeof TYPE_LABELS] ?? contentType
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          contentType: typeLabel,
          stage,
          audience,
          customPrompt: customPrompt || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Generation failed. Please try again.')
      } else {
        setResult(data.asset)
        refetch()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const generatedAssets = (campaign?.assets ?? []).filter((a) => a.content)

  return (
    <div className="px-4 md:px-6 pb-8 space-y-6">
      <PageHeader
        title="Content Generator"
        description="Generate AI-powered campaign content or upload your own"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                  <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle>Generate Content</CardTitle>
              </div>
            </CardHeader>

            <div className="space-y-3 mt-1">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Content Type"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  options={TYPE_OPTIONS}
                />
                <Select
                  label="Funnel Stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value as AssetStage)}
                  options={STAGE_OPTIONS}
                />
              </div>

              <Select
                label="Target Audience *"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Select persona…"
                options={[
                  ...personaOptions,
                  { value: 'general', label: 'General Audience' },
                  { value: 'technical', label: 'Technical Audience' },
                  { value: 'executive', label: 'Executive / C-Suite' },
                ]}
              />

              <Textarea
                label="Additional guidance (optional)"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                placeholder="Specific angle, tone, or topic to focus on…"
              />

              {/* Framework context pill */}
              {framework && (
                <div className="flex items-start gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[9px] font-bold">
                      {framework.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{framework.name}</p>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                      {framework.tagline}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={generate}
                loading={generating}
                disabled={!audience}
                icon={<Sparkles size={15} />}
              >
                {generating ? 'Generating…' : 'Generate Content'}
              </Button>
            </div>
          </Card>

          {/* Result */}
          {result && (
            <GeneratedAssetCard asset={result} isNew />
          )}

          {/* Upload your own */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <button
              onClick={() => setUploadOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Upload size={14} className="text-zinc-500 dark:text-zinc-400" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Upload your own asset</span>
              </div>
              {uploadOpen ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
            </button>

            {uploadOpen && (
              <div className="p-4 space-y-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Upload an existing asset file or add a link and metadata to track it in your campaign.
                </p>

                {/* File picker */}
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".txt,.md,.csv,.html,.json,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-sm text-zinc-500 dark:text-zinc-400 w-full transition-colors"
                  >
                    <FileText size={14} />
                    {uploadFileName ? (
                      <span className="text-zinc-700 dark:text-zinc-200 font-medium truncate">{uploadFileName}</span>
                    ) : (
                      <span>Choose file (.txt, .md, .html, .json, .csv)</span>
                    )}
                  </button>
                </div>

                <Input
                  label="Asset Name *"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. Q2 Whitepaper — CDO Audience"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Type"
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as AssetType)}
                    options={TYPE_OPTIONS}
                  />
                  <Select
                    label="Stage"
                    value={uploadStage}
                    onChange={(e) => setUploadStage(e.target.value as AssetStage)}
                    options={STAGE_OPTIONS}
                  />
                </div>

                <Input
                  label="Asset URL (optional)"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  placeholder="https://"
                  type="url"
                />

                <Textarea
                  label="Description (optional)"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief description of this asset…"
                />

                {uploadError && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-400">{uploadError}</p>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-1">
                  <Button size="sm" variant="ghost" onClick={() => setUploadOpen(false)}>Cancel</Button>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<Plus size={13} />}
                    onClick={saveUploadedAsset}
                    loading={uploadMutation.isPending}
                    disabled={!uploadName.trim()}
                  >
                    Add to Assets
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: History */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 px-1">
            Generated Content
            {generatedAssets.length > 0 && (
              <span className="ml-1.5 text-zinc-400 font-normal">({generatedAssets.length})</span>
            )}
          </h2>

          {generatedAssets.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No generated content yet"
              description="Generate your first piece of content using the form."
            />
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {[...generatedAssets].reverse().map((asset) => (
                <GeneratedAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Generated Asset Card ─────────────────────────────────────────────────────

function GeneratedAssetCard({ asset, isNew }: { asset: Asset; isNew?: boolean }) {
  const [expanded, setExpanded] = useState(isNew ?? false)
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)

  function copyContent() {
    if (!asset.content) return
    const text = formatContentAsText(asset.content)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <Card className={cn('overflow-hidden', isNew && 'ring-2 ring-indigo-200 ring-offset-1')}>
        <div className="p-4 space-y-2.5">
          {isNew && (
            <Badge variant="info" className="text-[10px]">
              ✨ Just generated
            </Badge>
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                {asset.name}
              </p>
              {asset.description && (
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{asset.description}</p>
              )}
            </div>
            <div className={cn('shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border', STATUS_COLORS[asset.status])}>
              {asset.status}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge>{TYPE_LABELS[asset.type]}</Badge>
            <Badge variant="purple">{STAGE_LABELS[asset.stage]}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              icon={copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              onClick={copyContent}
              className="text-xs"
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              onClick={() => setExpanded((v) => !v)}
              className="text-xs"
            >
              {expanded ? 'Collapse' : 'Preview'}
            </Button>
            {asset.content && (
              <Button
                size="sm"
                variant="ghost"
                icon={<Maximize2 size={12} />}
                onClick={() => setFullscreen(true)}
                className="text-xs"
              >
                Full view
              </Button>
            )}
          </div>

          {expanded && asset.content && (
            <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 max-h-64 overflow-y-auto">
              <ContentPreview content={asset.content} />
            </div>
          )}
        </div>
      </Card>

      {/* Full-screen content modal */}
      {fullscreen && asset.content && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 md:p-10 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{asset.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge>{TYPE_LABELS[asset.type]}</Badge>
                  <Badge variant="purple">{STAGE_LABELS[asset.stage]}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  onClick={copyContent}
                >
                  {copied ? 'Copied' : 'Copy all'}
                </Button>
                <button
                  onClick={() => setFullscreen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="px-6 py-5">
              <ContentPreviewFull content={asset.content} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ContentPreview({ content }: { content: Record<string, unknown> }) {
  if (content.title) {
    return (
      <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{content.title as string}</p>
        {typeof content.subtitle === 'string' && <p className="text-zinc-500">{content.subtitle}</p>}
        {Array.isArray(content.sections) &&
          (content.sections as { heading: string; body: string }[]).slice(0, 3).map((s, i) => (
            <div key={i}>
              <p className="font-medium text-zinc-800 dark:text-zinc-200 mt-2">{s.heading}</p>
              <p className="text-zinc-500 line-clamp-3 leading-relaxed">{s.body}</p>
            </div>
          ))}
        {(content.sections as unknown[])?.length > 3 && (
          <p className="text-zinc-400 italic">
            + {(content.sections as unknown[]).length - 3} more sections
          </p>
        )}
      </div>
    )
  }
  return (
    <pre className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
      {JSON.stringify(content, null, 2)}
    </pre>
  )
}

function CtaBlock({ cta }: { cta: unknown }) {
  if (!cta || typeof cta !== 'object' || Array.isArray(cta)) return null
  const c = cta as Record<string, unknown>
  return (
    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-2">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Call to Action</p>
      {typeof c.primary === 'string' && (
        <p className="font-medium text-indigo-600 dark:text-indigo-400">→ {c.primary}</p>
      )}
      {typeof c.secondary === 'string' && (
        <p className="text-zinc-500">→ {c.secondary}</p>
      )}
    </div>
  )
}

function ContentPreviewFull({ content }: { content: Record<string, unknown> }) {
  if (content.title) {
    return (
      <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
            {content.title as string}
          </h1>
          {typeof content.subtitle === 'string' && (
            <p className="text-zinc-500 mt-2 text-base leading-relaxed">{content.subtitle}</p>
          )}
        </div>
        {Array.isArray(content.sections) &&
          (content.sections as { heading: string; body: string }[]).map((s, i) => (
            <div key={i} className="space-y-1.5">
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">{s.heading}</h2>
              <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">{s.body}</p>
            </div>
          ))}
        <CtaBlock cta={content.cta} />
      </div>
    )
  }
  return (
    <pre className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
      {JSON.stringify(content, null, 2)}
    </pre>
  )
}

function formatContentAsText(content: Record<string, unknown>): string {
  const parts: string[] = []
  if (content.title) parts.push(`# ${content.title}`)
  if (content.subtitle) parts.push(`\n${content.subtitle}`)
  if (Array.isArray(content.sections)) {
    for (const s of content.sections as { heading: string; body: string }[]) {
      parts.push(`\n## ${s.heading}\n${s.body}`)
    }
  }
  return parts.join('\n')
}
