import { NextRequest, NextResponse } from 'next/server'
import { updateAsset, deleteAsset } from '@/lib/data'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string; assetId: string }> }
) {
  const { productId, assetId } = await params
  try {
    const updates = await req.json()
    const campaign = await updateAsset(productId, assetId, updates)
    return NextResponse.json(campaign)
  } catch (err) {
    console.error(`PUT /api/campaigns/${productId}/assets/${assetId} error:`, err)
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string; assetId: string }> }
) {
  const { productId, assetId } = await params
  try {
    const campaign = await deleteAsset(productId, assetId)
    return NextResponse.json(campaign)
  } catch (err) {
    console.error(`DELETE /api/campaigns/${productId}/assets/${assetId} error:`, err)
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}
