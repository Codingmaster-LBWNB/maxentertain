/**
 * Initial database migration — run once to seed pricing_tiers and create indexes.
 * Usage: node --env-file=.env.local scripts/migrate.mjs
 */

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not set. Run with: node --env-file=.env.local scripts/migrate.mjs')
  process.exit(1)
}

const NIGHTLY_RATES = {
  SUMMER_PEAK:    3200,
  PUBLIC_HOLIDAY: 2500,
  SCHOOL_HOLIDAY: 2500,
  WEEKEND:        2200,
  STANDARD:       1880,
}

const client = new MongoClient(MONGODB_URI)

try {
  await client.connect()
  const db = client.db('maxentertain')
  console.log('✓  Connected to MongoDB — database: maxentertain\n')

  // ── 1. Seed pricing_tiers ──────────────────────────────────────────────────
  console.log('── pricing_tiers ─────────────────────────────────────────────')
  const tiersCol = db.collection('pricing_tiers')
  for (const [tier, price] of Object.entries(NIGHTLY_RATES)) {
    const r = await tiersCol.updateOne(
      { tier },
      { $setOnInsert: { tier, price, updatedAt: new Date() } },
      { upsert: true }
    )
    const status = r.upsertedCount ? `inserted  $${price}/night` : `skipped   (already exists)`
    console.log(`  ${tier.padEnd(20)} ${status}`)
  }

  // ── 2. Create indexes ──────────────────────────────────────────────────────
  console.log('\n── indexes ───────────────────────────────────────────────────')

  await tiersCol.createIndex({ tier: 1 }, { unique: true, name: 'tier_unique' })
  console.log('  pricing_tiers.tier          unique ✓')

  const overridesCol = db.collection('pricing_overrides')
  await overridesCol.createIndex({ date: 1 }, { unique: true, name: 'date_unique' })
  console.log('  pricing_overrides.date      unique ✓')

  const blocksCol = db.collection('manual_blocks')
  await blocksCol.createIndex({ date: 1 }, { unique: true, name: 'date_unique' })
  console.log('  manual_blocks.date          unique ✓')

  const minNightsCol = db.collection('min_nights_overrides')
  await minNightsCol.createIndex({ date: 1 }, { unique: true, name: 'date_unique' })
  console.log('  min_nights_overrides.date   unique ✓')

  const inquiriesCol = db.collection('inquiries')
  await inquiriesCol.createIndex({ createdAt: -1 }, { name: 'createdAt_desc' })
  console.log('  inquiries.createdAt         desc ✓')

  console.log('\n✅  Migration complete.')
} catch (err) {
  console.error('\n❌  Migration failed:', err.message)
  process.exit(1)
} finally {
  await client.close()
}
