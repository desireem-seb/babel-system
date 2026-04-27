import { NextRequest, NextResponse } from 'next/server'
import { getFeedback, addFeedback } from '@/lib/data'
import { z } from 'zod'

const FeedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  email: z.string().email().optional().or(z.literal('')),
})

export async function GET() {
  try {
    const feedback = await getFeedback()
    return NextResponse.json(feedback)
  } catch (err) {
    console.error('GET /api/feedback error:', err)
    return NextResponse.json({ error: 'Failed to load feedback' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = FeedbackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const entry = await addFeedback(parsed.data)
    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    console.error('POST /api/feedback error:', err)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
