/**
 * Seed script — loads existing JSON data into PostgreSQL.
 * Run once after first migration:
 *   heroku run node db/seed.js --app campaign-builder-next
 *
 * Safe to re-run — uses INSERT ... ON CONFLICT DO NOTHING.
 */

import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Path to the bundled data directory
const DATA_DIR = path.join(__dirname, '..', 'data')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('amazonaws.com')
    ? { rejectUnauthorized: false }
    : false,
})

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // ── Frameworks ───────────────────────────────────────────────────────────
    const frameworksPath = path.join(DATA_DIR, 'campaign-frameworks.json')
    if (fs.existsSync(frameworksPath)) {
      const raw = JSON.parse(fs.readFileSync(frameworksPath, 'utf-8'))
      for (const [id, fw] of Object.entries(raw)) {
        await client.query(
          `INSERT INTO frameworks (id, name, portfolio, tagline, pillars, personas, channels, campaign_brief, flow_stages)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (id) DO NOTHING`,
          [
            id,
            fw.name ?? '',
            fw.portfolio ?? '',
            fw.tagline ?? '',
            JSON.stringify(fw.pillars ?? []),
            JSON.stringify(fw.personas ?? []),
            JSON.stringify(fw.channels ?? []),
            JSON.stringify(fw.campaignBrief ?? { content: '' }),
            JSON.stringify(fw.flowStages ?? {}),
          ]
        )
      }
      console.log(`Seeded ${Object.keys(raw).length} frameworks`)
    }

    // ── Campaigns + Assets ───────────────────────────────────────────────────
    const campaignsDir = path.join(DATA_DIR, 'campaigns')
    if (fs.existsSync(campaignsDir)) {
      const files = fs.readdirSync(campaignsDir).filter((f) => f.endsWith('.json'))
      for (const file of files) {
        const campaign = JSON.parse(fs.readFileSync(path.join(campaignsDir, file), 'utf-8'))
        const productId = campaign.productId

        // Ensure framework row exists (some products may only have campaign data)
        await client.query(
          `INSERT INTO campaigns (product_id, name, last_updated, active_quarters)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (product_id) DO NOTHING`,
          [
            productId,
            campaign.name ?? productId,
            campaign.lastUpdated ?? new Date().toISOString().slice(0, 10),
            JSON.stringify(campaign.activeQuarters ?? []),
          ]
        )

        for (const asset of campaign.assets ?? []) {
          await client.query(
            `INSERT INTO assets (
               id, product_id, type, name, stage, status, pillar,
               channels, personas, regions, languages, quarters,
               description, url, launch_date, content, flow_position, next_touchpoints,
               created_at, updated_at
             ) VALUES (
               $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
             ) ON CONFLICT (id) DO NOTHING`,
            [
              asset.id,
              productId,
              asset.type ?? 'WHITEPAPER',
              asset.name ?? '',
              asset.stage ?? 'awareness',
              asset.status ?? 'draft',
              asset.pillar ?? null,
              JSON.stringify(asset.channels ?? asset.channel ?? []),
              JSON.stringify(asset.personas ?? asset.persona ?? []),
              JSON.stringify(asset.regions ?? asset.region ?? []),
              JSON.stringify(asset.languages ?? asset.language ?? []),
              JSON.stringify(asset.quarters ?? []),
              asset.description ?? null,
              asset.url ?? null,
              asset.launchDate ?? null,
              asset.content ? JSON.stringify(asset.content) : null,
              asset.flow_position ?? null,
              JSON.stringify(asset.next_touchpoints ?? []),
              asset.createdAt ?? new Date().toISOString(),
              asset.updatedAt ?? new Date().toISOString(),
            ]
          )
        }
        console.log(`Seeded campaign ${productId} (${(campaign.assets ?? []).length} assets)`)
      }
    }

    await client.query('COMMIT')
    console.log('Seed complete.')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Seed failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
