import { NextRequest, NextResponse } from 'next/server'
import { addAsset } from '@/lib/data'
import { Asset } from '@/types'
import { z } from 'zod'

const AssetSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string().min(1),
  stage: z.enum(['awareness', 'familiarity', 'consideration', 'decision']),
  status: z.enum(['live', 'in_progress', 'refreshing', 'draft', 'archived']).default('draft'),
  pillar: z.string().nullable().default(null),
  channels: z.array(z.string()).default([]),
  personas: z.array(z.string()).default([]),
  regions: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  quarters: z.array(z.string()).optional(),
  description: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  launchDate: z.string().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  try {
    const body = await req.json()
    const parsed = AssetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const campaign = await addAsset(productId, parsed.data as Asset)
    return NextResponse.json(campaign, { status: 201 })
  } catch (err) {
    console.error(`POST /api/campaigns/${productId}/assets error:`, err)
    return NextResponse.json({ error: 'Failed to add asset' }, { status: 500 })
  }
}
