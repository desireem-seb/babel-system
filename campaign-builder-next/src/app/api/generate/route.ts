import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getFramework } from '@/lib/data'
import { addAsset } from '@/lib/data'
import { Asset, AssetType, AssetStage } from '@/types'
import { z } from 'zod'

const GenerateSchema = z.object({
  product: z.string().min(1),
  contentType: z.string().min(1),
  stage: z.enum(['awareness', 'familiarity', 'consideration', 'decision']),
  audience: z.string().min(1),
  customPrompt: z.string().optional(),
  mode: z.enum(['content', 'suggestions']).optional(),
})

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const CONTENT_TYPE_TO_ASSET_TYPE: Record<string, AssetType> = {
  'Email': 'EMAIL',
  'Blog Post': 'BLOG_POST',
  'Whitepaper': 'WHITEPAPER',
  'Landing Page': 'LANDING_PAGE',
  'Solution Brief': 'SOLUTION_BRIEF',
  'Case Study': 'CASE_STUDY',
  'Webinar': 'WEBINAR',
  'Social Post': 'SOCIAL_POST',
  'Video Script': 'VIDEO_SCRIPT',
  'Newsletter': 'NEWSLETTER',
  'Datasheet': 'DATASHEET',
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const parsed = GenerateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { product, contentType, stage, audience, customPrompt, mode } = parsed.data
    const framework = await getFramework(product)

    if (!framework) {
      return NextResponse.json({ error: `Framework not found: ${product}` }, { status: 404 })
    }

    const pillarsText = framework.pillars
      .map((p) => `- ${p.name}: ${p.description}`)
      .join('\n')

    const personasText = framework.personas.length > 0
      ? `TARGET PERSONAS:\n${framework.personas.map((p) => `- ${p}`).join('\n')}`
      : ''

    const briefExcerpt = framework.campaignBrief?.content?.slice(0, 800) ?? ''

    // ── Suggestions mode ─────────────────────────────────────────────────────
    if (mode === 'suggestions') {
      const suggSystemPrompt = `You are a B2B marketing strategist. Return ONLY a JSON array of asset suggestions.`
      const suggUserPrompt = `Suggest 6 high-impact marketing assets for ${framework.name}.

PRODUCT: ${framework.name} — ${framework.tagline}
PILLARS: ${pillarsText}

Return a JSON array with exactly 6 objects. Each object must have:
- "name": compelling asset title (string)
- "type": one of EMAIL/BLOG_POST/WHITEPAPER/LANDING_PAGE/SOLUTION_BRIEF/CASE_STUDY/WEBINAR/SOCIAL_POST/VIDEO_SCRIPT/NEWSLETTER/DATASHEET
- "stage": one of awareness/familiarity/consideration/decision
- "description": 1-2 sentence description (string)

Return only the JSON array, no extra text.`

      const suggMessage = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: suggSystemPrompt,
        messages: [{ role: 'user', content: suggUserPrompt }],
      })
      const rawText = suggMessage.content[0].type === 'text' ? suggMessage.content[0].text : '[]'
      const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
      try {
        const suggestions = JSON.parse(jsonText)
        return NextResponse.json({ success: true, suggestions })
      } catch {
        return NextResponse.json({ error: 'Could not parse suggestions. Please try again.' }, { status: 502 })
      }
    }

    // ── Content generation mode (default) ───────────────────────────────────
    const systemPrompt = `You are an expert B2B marketing copywriter specializing in enterprise technology.
Your role is to create high-quality ${contentType} content for ${framework.name}.

PRODUCT CONTEXT:
Name: ${framework.name}
Portfolio Message: ${framework.portfolio}
Tagline: ${framework.tagline}

MESSAGING PILLARS:
${pillarsText}

${personasText}

${briefExcerpt ? `CAMPAIGN BRIEF:\n${briefExcerpt}` : ''}

REQUIREMENTS:
- Stage: ${stage} (buyer journey stage — tailor urgency and depth accordingly)
- Target Audience: ${audience}
- Tone: Professional, confident, specific to enterprise B2B
- Do NOT invent product features not mentioned in the context above
- Every claim must be grounded in the product context provided

OUTPUT: Return ONLY valid JSON with this exact shape:
{
  "title": "string",
  "subtitle": "string (optional)",
  "sections": [
    { "heading": "string", "body": "string (markdown supported)" }
  ],
  "cta": {
    "primary": "string",
    "secondary": "string (optional)"
  },
  "summary": "string (2-3 sentence summary of what this asset does)"
}`

    const userPrompt = `Create a ${contentType} for the ${stage} stage targeting: ${audience}.
${customPrompt ? `\nAdditional guidance: ${customPrompt}` : ''}

The content should be compelling, specific, and ready to use. Return only the JSON object.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    // Strip markdown code fences if present
    const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    let content: Record<string, unknown>
    try {
      content = JSON.parse(jsonText)
    } catch {
      return NextResponse.json(
        { error: 'Model returned invalid JSON. Please try again.' },
        { status: 502 }
      )
    }

    const assetType = CONTENT_TYPE_TO_ASSET_TYPE[contentType] ?? 'WHITEPAPER'
    const asset: Asset = {
      id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: assetType,
      name: (content.title as string) ?? `${contentType} — ${audience}`,
      stage: stage as AssetStage,
      status: 'draft',
      pillar: null,
      channels: [],
      personas: [audience.toLowerCase().replace(/\s+/g, '-')],
      regions: [],
      languages: ['english'],
      description: (content.summary as string) ?? '',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await addAsset(product, asset)

    return NextResponse.json({ success: true, asset })
  } catch (err) {
    console.error('POST /api/generate error:', err)
    return NextResponse.json({ error: 'Content generation failed' }, { status: 500 })
  }
}
