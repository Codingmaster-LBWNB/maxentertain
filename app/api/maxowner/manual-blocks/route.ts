import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const docs = await db
      .collection('manual_blocks')
      .find({}, { projection: { _id: 0, date: 1, reason: 1 } })
      .sort({ date: 1 })
      .toArray()
    return NextResponse.json(docs)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const { date, reason } = await req.json()
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Valid YYYY-MM-DD date required' }, { status: 400 })
  }
  const db = await getDb()
  await db.collection('manual_blocks').updateOne(
    { date },
    { $set: { date, reason: reason ?? '', createdAt: new Date() } },
    { upsert: true }
  )
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { date } = await req.json()
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })
  const db = await getDb()
  await db.collection('manual_blocks').deleteOne({ date })
  return NextResponse.json({ ok: true })
}
