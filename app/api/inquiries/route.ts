import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { sendInquiryReceivedEmails } from '@/lib/email'

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

    await sendInquiryReceivedEmails({
      name: String(name),
      email: String(email),
      phone: String(phone ?? ''),
      checkIn: String(checkIn),
      checkOut: String(checkOut),
      guests: String(guests ?? ''),
      message: String(message ?? ''),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process inquiry' },
      { status: 500 }
    )
  }
}
