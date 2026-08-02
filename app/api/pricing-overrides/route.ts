import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { NIGHTLY_RATES, PricingTier } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

export async function GET() {
  // If MongoDB is not configured, return defaults so the calendar shows tier prices as normal
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ overrides: {}, tierPrices: NIGHTLY_RATES, minNightsMap: {} })
  }

  try {
    const db = await getDb()

    const [overrideDocs, tierDocs, minNightsDocs] = await Promise.all([
      db.collection('pricing_overrides').find({}, { projection: { _id: 0, date: 1, price: 1 } }).toArray(),
      db.collection('pricing_tiers').find({}, { projection: { _id: 0, tier: 1, price: 1 } }).toArray(),
      db.collection('min_nights_overrides').find({}, { projection: { _id: 0, date: 1, minNights: 1 } }).toArray(),
    ])

    const overrides: Record<string, number> = {}
    for (const doc of overrideDocs) {
      overrides[doc.date] = doc.price
    }

    const tierPrices: Record<PricingTier, number> = { ...NIGHTLY_RATES }
    for (const doc of tierDocs) {
      if (doc.tier in tierPrices) {
        tierPrices[doc.tier as PricingTier] = doc.price
      }
    }

    const minNightsMap: Record<string, number> = {}
    for (const doc of minNightsDocs) {
      minNightsMap[doc.date] = doc.minNights
    }

    return NextResponse.json({ overrides, tierPrices, minNightsMap })
  } catch {
    // DB is configured but unreachable — signal to frontend to show "-"
    return NextResponse.json({ error: 'Pricing data unavailable' }, { status: 503 })
  }
}
