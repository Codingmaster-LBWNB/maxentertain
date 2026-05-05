import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ ok: true }) // silently skip if not configured
  }

  try {
    const body = await req.json()
    const { name, email, phone, checkIn, checkOut, guests, message } = body

    if (!name || !email || !checkIn || !checkOut) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = await getDb()
    await db.collection('inquiries').insertOne({
      name,
      email,
      phone: phone ?? '',
      checkIn,
      checkOut,
      guests: guests ?? '',
      message: message ?? '',
      receivedAt: new Date(),
      status: 'new',
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Don't fail the user's form submission if DB is down
    return NextResponse.json({ ok: true })
  }
}
