import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { expireBooking } from '@/lib/bookings'
import { captureBond, releaseBond } from '@/lib/bonds'
import { sendBookingConfirmedEmail, sendOwnerBookingAlert } from '@/lib/email'
import { requireOwner } from '@/lib/authServer'
import type { BookingRecord, BookingStatus } from '@/types/booking'

const VALID_STATUSES: BookingStatus[] = ['pending_payment', 'confirmed', 'expired', 'cancelled', 'refunded', 'completed']

function statusFilter(status: string | null) {
  if (!status || status === 'all') return {}
  if (!VALID_STATUSES.includes(status as BookingStatus)) return {}
  return { status: status as BookingStatus }
}

export async function GET(req: NextRequest) {
  const denied = await requireOwner(req)
  if (denied) return denied

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
  const denied = await requireOwner(req)
  if (denied) return denied

  const body = await req.json()
  const { bookingId, action } = body
  if (!bookingId || !action) {
    return NextResponse.json({ error: 'Valid bookingId and action required' }, { status: 400 })
  }

  const db = await getDb()
  const booking = await db.collection<BookingRecord>('bookings').findOne({ _id: bookingId })
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  if (action === 'resend_confirmation') {
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

  if (action === 'expire_hold') {
    if (booking.status !== 'pending_payment') {
      return NextResponse.json({ error: 'Only pending holds can be expired' }, { status: 400 })
    }
    await expireBooking(booking._id, 'owner_expired_hold')
    return NextResponse.json({ ok: true })
  }

  if (action === 'set_arrival') {
    const details = typeof body.details === 'string' ? body.details.slice(0, 4000) : ''
    const passcode = typeof body.passcode === 'string' ? body.passcode.slice(0, 100) : ''
    await db.collection('bookings').updateOne(
      { _id: bookingId },
      {
        $set: {
          'arrival.details': details,
          'arrival.passcode': passcode,
          'arrival.updatedAt': new Date(),
          updatedAt: new Date(),
        },
      }
    )
    await db.collection('booking_events').insertOne({
      bookingId: booking._id,
      event: 'booking.arrival_details_set',
      data: { hasDetails: Boolean(details), hasPasscode: Boolean(passcode) },
      createdAt: new Date(),
    })
    return NextResponse.json({ ok: true })
  }

  if (action === 'mark_manual_refund') {
    const { refundAmountAud = 0, reason = 'Owner marked manual refund' } = body
    if (!['confirmed', 'cancelled', 'refund_pending', 'cancelling', 'payment_orphaned'].includes(booking.status)) {
      return NextResponse.json({ error: 'This booking cannot be marked refunded' }, { status: 400 })
    }
    await db.collection('booking_locks').deleteMany({ bookingId: booking._id })
    await db.collection('bookings').updateOne(
      { _id: booking._id as any } as any,
      {
        $set: {
          status: 'refunded',
          cancelledAt: new Date(),
          cancelReason: String(reason),
          refundAmountAud: Number(refundAmountAud),
          refundStripeId: 'manual',
          updatedAt: new Date(),
        },
      }
    )
    await db.collection('booking_events').insertOne({
      bookingId: booking._id,
      event: 'booking.manual_refund_marked',
      data: { refundAmountAud: Number(refundAmountAud), reason: String(reason) },
      createdAt: new Date(),
    })
    return NextResponse.json({ ok: true })
  }

  if (action === 'release_bond') {
    if (booking.bond?.status !== 'authorized') {
      return NextResponse.json({ error: 'No active security hold to release' }, { status: 400 })
    }
    await releaseBond(booking)
    return NextResponse.json({ ok: true })
  }

  if (action === 'capture_bond') {
    if (booking.bond?.status !== 'authorized') {
      return NextResponse.json({ error: 'No active security hold to capture' }, { status: 400 })
    }
    const amountAud = typeof body.amountAud === 'number' ? body.amountAud : undefined
    try {
      await captureBond(booking, amountAud)
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Capture failed' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unsupported booking action' }, { status: 400 })
}
