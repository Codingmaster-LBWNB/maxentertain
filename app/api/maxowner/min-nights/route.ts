import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { requireOwner } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const denied = await requireOwner(req)
  if (denied) return denied

  try {
    const db = await getDb()
    const docs = await db
      .collection('min_nights_overrides')
      .find({}, { projection: { _id: 0, date: 1, minNights: 1 } })
      .sort({ date: 1 })
      .toArray()
    return NextResponse.json(docs)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireOwner(req)
  if (denied) return denied

  const { date, minNights } = await req.json()
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Valid YYYY-MM-DD date required' }, { status: 400 })
  }
  const mn = Number(minNights)
  if (!Number.isInteger(mn) || mn < 1 || mn > 30) {
    return NextResponse.json({ error: 'minNights must be an integer between 1 and 30' }, { status: 400 })
  }
  const db = await getDb()
  await db.collection('min_nights_overrides').updateOne(
    { date },
    { $set: { date, minNights: mn, createdAt: new Date() } },
    { upsert: true }
  )
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const denied = await requireOwner(req)
  if (denied) return denied

  const { date } = await req.json()
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })
  const db = await getDb()
  await db.collection('min_nights_overrides').deleteOne({ date })
  return NextResponse.json({ ok: true })
}
