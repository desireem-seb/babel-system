import { NextRequest, NextResponse } from 'next/server'
import { getFramework, updateFramework } from '@/lib/data'
import { z } from 'zod'

const PillarSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  capabilities: z.array(z.string()),
})

const UpdateFrameworkSchema = z.object({
  name: z.string().optional(),
  portfolio: z.string().optional(),
  tagline: z.string().optional(),
  pillars: z.array(PillarSchema).optional(),
  personas: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  campaignBrief: z
    .object({
      content: z.string(),
      quarterlyThemes: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  flowStages: z.record(z.string(), z.object({ label: z.string(), subtitle: z.string() })).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  try {
    const framework = await getFramework(productId)
    if (!framework) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(framework)
  } catch (err) {
    console.error(`GET /api/frameworks/${productId} error:`, err)
    return NextResponse.json({ error: 'Failed to load framework' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  try {
    const body = await req.json()
    const parsed = UpdateFrameworkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const updated = await updateFramework(productId, parsed.data)
    return NextResponse.json(updated)
  } catch (err) {
    console.error(`PUT /api/frameworks/${productId} error:`, err)
    return NextResponse.json({ error: 'Failed to update framework' }, { status: 500 })
  }
}
