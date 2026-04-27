import { NextResponse } from 'next/server'
import { getCampaigns } from '@/lib/data'

export async function GET() {
  try {
    const campaigns = await getCampaigns()
    return NextResponse.json(campaigns)
  } catch (err) {
    console.error('GET /api/campaigns error:', err)
    return NextResponse.json({ error: 'Failed to load campaigns' }, { status: 500 })
  }
}
