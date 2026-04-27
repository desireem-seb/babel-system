import { NextResponse } from 'next/server'
import { getFrameworks } from '@/lib/data'

export async function GET() {
  try {
    const frameworks = await getFrameworks()
    return NextResponse.json(frameworks)
  } catch (err) {
    console.error('GET /api/frameworks error:', err)
    return NextResponse.json({ error: 'Failed to load frameworks' }, { status: 500 })
  }
}
