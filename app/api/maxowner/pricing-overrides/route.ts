import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const overrides = await db
      .collection('pricing_overrides')
      .find({}, { projection: { _id: 0, date: 1, price: 1, note: 1 } })
      .sort({ date: 1 })
      .toArray()
    return NextResponse.json(overrides)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const { date, price, note } = await req.json()
  if (!date || !price || typeof price !== 'number' || price < 0) {
    return NextResponse.json({ error: 'date and numeric price are required' }, { status: 400 })
  }
  const db = await getDb()
  await db.collection('pricing_overrides').updateOne(
    { date },
    { $set: { date, price, note: note ?? '', updatedAt: new Date() } },
    { upsert: true }
  )
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { date } = await req.json()
  if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 })
  const db = await getDb()
  await db.collection('pricing_overrides').deleteOne({ date })
  return NextResponse.json({ ok: true })
}
