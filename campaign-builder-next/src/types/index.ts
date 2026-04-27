// ─── Campaign Framework ──────────────────────────────────────────────────────

export interface Pillar {
  id: string
  name: string
  description: string
  capabilities: string[]
}

export interface CampaignBrief {
  content: string
  quarterlyThemes?: Record<string, string>
}

export interface Framework {
  id: string
  name: string
  portfolio: string
  tagline: string
  pillars: Pillar[]
  personas: string[]
  channels?: string[]
  campaignBrief: CampaignBrief
  flowStages?: Record<string, FlowStage>
}

export interface FlowStage {
  label: string
  subtitle: string
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export type AssetType =
  | 'WHITEPAPER'
  | 'EMAIL'
  | 'BLOG_POST'
  | 'LANDING_PAGE'
  | 'SOLUTION_BRIEF'
  | 'CASE_STUDY'
  | 'WEBINAR'
  | 'SOCIAL_POST'
  | 'VIDEO_SCRIPT'
  | 'NEWSLETTER'
  | 'DATASHEET'

export type AssetStage = 'awareness' | 'familiarity' | 'consideration' | 'decision'
export type AssetStatus = 'live' | 'in_progress' | 'refreshing' | 'draft' | 'archived'

export interface AssetContent {
  title?: string
  subtitle?: string
  sections?: { heading: string; body: string }[]
  cta?: { primary?: string; secondary?: string; tertiary?: string }
  [key: string]: unknown
}

export interface Asset {
  id: string
  type: AssetType
  name: string
  stage: AssetStage
  status: AssetStatus
  pillar: string | null
  channels: string[]
  personas: string[]
  regions: string[]
  languages: string[]
  quarters?: string[]
  description?: string
  url?: string
  launchDate?: string
  content?: AssetContent
  flow_position?: string
  next_touchpoints?: string[]
  createdAt?: string
  updatedAt?: string
}

// ─── Campaign ─────────────────────────────────────────────────────────────────

export interface JourneyNode {
  id: string
  assetId: string
  x: number
  y: number
}

export interface JourneyConnection {
  from: string
  to: string
}

export interface Campaign {
  productId: string
  name: string
  lastUpdated: string
  assets: Asset[]
  journeys: JourneyNode[]
  connections?: JourneyConnection[]
  activeQuarters?: string[]
}

// ─── Content Generation ───────────────────────────────────────────────────────

export type ContentType =
  | 'Email'
  | 'Blog Post'
  | 'Whitepaper'
  | 'Landing Page'
  | 'Solution Brief'
  | 'Case Study'
  | 'Webinar'
  | 'Social Post'
  | 'Video Script'
  | 'Newsletter'
  | 'Datasheet'

export interface GenerateContentRequest {
  product: string
  contentType: ContentType
  stage: AssetStage
  audience: string
  customPrompt?: string
}

export interface GenerateContentResponse {
  success: boolean
  asset?: Asset
  error?: string
}

// ─── Agent Contracts (Phase 2) ────────────────────────────────────────────────

export interface SocialTrend {
  topic: string
  momentum: 'rising' | 'peak' | 'declining'
  relevanceScore: number
  sampleContent: string[]
}

export interface SocialInfluencer {
  handle: string
  platform: string
  narrativeAngle: string
  audienceAlignment: string[]
}

export interface SocialNarrative {
  theme: string
  sentiment: 'positive' | 'neutral' | 'negative'
  contentFormats: string[]
}

export interface SocialSignals {
  version: string
  fetchedAt: string
  trends: SocialTrend[]
  influencers: SocialInfluencer[]
  narratives: SocialNarrative[]
}

export interface PMMPersona {
  id: string
  name: string
  role: string
  painPoints: string[]
  motivations: string[]
  messagingGuidance: string
}

export interface PMMPillar {
  id: string
  name: string
  headline: string
  proof: string[]
  toneGuidance: string
}

export interface PMMStrategy {
  version: string
  updatedAt: string
  product: string
  positioning: {
    statement: string
    differentiation: string[]
    competitiveInsights: { competitor: string; gap: string }[]
  }
  personas: PMMPersona[]
  messagingPillars: PMMPillar[]
  valuePropositions: { audience: string; statement: string }[]
}

export interface CampaignContext {
  pmm?: PMMStrategy
  social?: SocialSignals
  fetchedAt: string
}

// ─── App Config ───────────────────────────────────────────────────────────────

export interface AppConfig {
  mode: 'internal' | 'public'
  brand: {
    name: string
    primaryColor: string
  }
  features: {
    pmmAgentEnabled: boolean
    socialAgentEnabled: boolean
    seoModuleEnabled: boolean
    feedbackEnabled: boolean
  }
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface FilterState {
  search: string
  stage: AssetStage | 'all'
  status: AssetStatus | 'all'
  type: AssetType | 'all'
  persona: string
  channel: string
}
