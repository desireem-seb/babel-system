import { NextRequest, NextResponse } from 'next/server'
import { getCampaign, saveCampaign } from '@/lib/data'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  try {
    const campaign = await getCampaign(productId)
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(campaign)
  } catch (err) {
    console.error(`GET /api/campaigns/${productId} error:`, err)
    return NextResponse.json({ error: 'Failed to load campaign' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  try {
    const body = await req.json()
    const saved = await saveCampaign({ ...body, productId })
    return NextResponse.json(saved)
  } catch (err) {
    console.error(`POST /api/campaigns/${productId} error:`, err)
    return NextResponse.json({ error: 'Failed to save campaign' }, { status: 500 })
  }
}
