/**
 * Database migration — creates tables if they don't exist.
 * Run on release phase: `heroku run node db/migrate.js --app campaign-builder-next`
 * Also runs automatically via Procfile release phase.
 */

import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('amazonaws.com')
    ? { rejectUnauthorized: false }
    : false,
})

const migrations = [
  // Frameworks table — stores messaging pillars, personas, tagline, etc.
  `CREATE TABLE IF NOT EXISTS frameworks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    portfolio TEXT NOT NULL DEFAULT '',
    tagline TEXT NOT NULL DEFAULT '',
    pillars JSONB NOT NULL DEFAULT '[]',
    personas JSONB NOT NULL DEFAULT '[]',
    channels JSONB NOT NULL DEFAULT '[]',
    campaign_brief JSONB NOT NULL DEFAULT '{"content":""}',
    flow_stages JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  // Campaigns table — top-level campaign metadata per product
  `CREATE TABLE IF NOT EXISTS campaigns (
    product_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    last_updated DATE NOT NULL DEFAULT CURRENT_DATE,
    active_quarters JSONB NOT NULL DEFAULT '[]',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  // Assets table — individual campaign assets
  `CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES campaigns(product_id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('awareness','familiarity','consideration','decision')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('live','in_progress','refreshing','draft','archived')),
    pillar TEXT,
    channels JSONB NOT NULL DEFAULT '[]',
    personas JSONB NOT NULL DEFAULT '[]',
    regions JSONB NOT NULL DEFAULT '[]',
    languages JSONB NOT NULL DEFAULT '[]',
    quarters JSONB NOT NULL DEFAULT '[]',
    description TEXT,
    url TEXT,
    launch_date DATE,
    content JSONB,
    flow_position TEXT,
    next_touchpoints JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  // Feedback table
  `CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('bug','feature','improvement','other')),
    priority TEXT NOT NULL CHECK (priority IN ('low','medium','high','critical')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    email TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,

  // Indexes for common queries
  `CREATE INDEX IF NOT EXISTS assets_product_id_idx ON assets(product_id)`,
  `CREATE INDEX IF NOT EXISTS assets_stage_idx ON assets(stage)`,
  `CREATE INDEX IF NOT EXISTS assets_status_idx ON assets(status)`,
]

async function migrate() {
  console.log('Running database migrations…')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const sql of migrations) {
      await client.query(sql)
    }
    await client.query('COMMIT')
    console.log('Migrations complete.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
