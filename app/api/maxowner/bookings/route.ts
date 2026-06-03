import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { sendBookingConfirmedEmail, sendOwnerBookingAlert } from '@/lib/email'
import type { BookingRecord, BookingStatus } from '@/types/booking'

const VALID_STATUSES: BookingStatus[] = ['pending_payment', 'confirmed', 'expired', 'cancelled', 'refunded', 'completed']

function statusFilter(status: string | null) {
  if (!status || status === 'all') return {}
  if (!VALID_STATUSES.includes(status as BookingStatus)) return {}
  return { status: status as BookingStatus }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const status = searchParams.get('status')
  const limit = 25
  const filter = statusFilter(status) as any

  const db = await getDb()
  const col = db.collection<BookingRecord>('bookings')

  const [bookings, total, statusCounts] = await Promise.all([
    col
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    col.countDocuments(filter),
    col.aggregate<{ _id: BookingStatus; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).toArray(),
  ])

  return NextResponse.json({
    bookings,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    statusCounts,
  })
}

export async function POST(req: NextRequest) {
  const { bookingId, action } = await req.json()
  if (!bookingId || action !== 'resend_confirmation') {
    return NextResponse.json({ error: 'Valid bookingId and action required' }, { status: 400 })
  }

  const db = await getDb()
  const booking = await db.collection<BookingRecord>('bookings').findOne({ _id: bookingId })
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.status !== 'confirmed') {
    return NextResponse.json({ error: 'Only confirmed bookings can receive confirmation emails' }, { status: 400 })
  }

  await Promise.all([
    sendBookingConfirmedEmail(booking),
    sendOwnerBookingAlert(booking),
  ])

  await db.collection('bookings').updateOne(
    { _id: bookingId },
    {
      $set: { updatedAt: new Date(), 'comms.lastConfirmationResentAt': new Date() },
      $addToSet: { 'comms.commsEventsSent': `booking.confirmed.resend.${new Date().toISOString()}` },
    }
  )

  return NextResponse.json({ ok: true })
}
