import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { NIGHTLY_RATES, TIER_LABELS, PricingTier } from '@/lib/pricing'

const TIERS = Object.keys(NIGHTLY_RATES) as PricingTier[]

export async function GET() {
  const defaults = TIERS.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    price: NIGHTLY_RATES[tier],
    isCustom: false,
    default: NIGHTLY_RATES[tier],
  }))

  try {
    const db = await getDb()
    const docs = await db
      .collection('pricing_tiers')
      .find({}, { projection: { _id: 0, tier: 1, price: 1 } })
      .toArray()

    const dbPrices: Partial<Record<PricingTier, number>> = {}
    for (const d of docs) dbPrices[d.tier as PricingTier] = d.price

    return NextResponse.json(
      TIERS.map((tier) => ({
        tier,
        label: TIER_LABELS[tier],
        price: dbPrices[tier] ?? NIGHTLY_RATES[tier],
        isCustom: tier in dbPrices,
        default: NIGHTLY_RATES[tier],
      }))
    )
  } catch {
    // MongoDB unavailable — return hardcoded defaults so the UI still renders
    return NextResponse.json(defaults)
  }
}

export async function PUT(req: NextRequest) {
  const { tier, price } = await req.json()
  if (!tier || !TIERS.includes(tier) || typeof price !== 'number' || price < 0) {
    return NextResponse.json({ error: 'Valid tier and numeric price required' }, { status: 400 })
  }
  const db = await getDb()
  await db.collection('pricing_tiers').updateOne(
    { tier },
    { $set: { tier, price, updatedAt: new Date() } },
    { upsert: true }
  )
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { tier } = await req.json()
  if (!tier || !TIERS.includes(tier)) {
    return NextResponse.json({ error: 'Valid tier required' }, { status: 400 })
  }
  const db = await getDb()
  await db.collection('pricing_tiers').deleteOne({ tier })
  return NextResponse.json({ ok: true })
}
