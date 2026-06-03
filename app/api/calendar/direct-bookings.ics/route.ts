import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { BookingRecord, BookingStatus } from '@/types/booking'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function escapeICal(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function formatICalDate(date: string) {
  return date.replace(/-/g, '')
}

function formatICalDateTime(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export async function GET(req: Request) {
  const secret = process.env.ICAL_EXPORT_SECRET
  const token = new URL(req.url).searchParams.get('token')
  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const nowDate = new Date()
  const bookings = await db
    .collection<BookingRecord>('bookings')
    .find(
      {
        $or: [
          { status: 'confirmed' },
          { status: 'pending_payment', expiresAt: { $gt: nowDate } },
        ],
      },
      { projection: { _id: 1, checkIn: 1, checkOut: 1, status: 1, updatedAt: 1, createdAt: 1 } }
    )
    .sort({ checkIn: 1 })
    .toArray()

  const now = formatICalDateTime()
  const events = bookings.flatMap((booking) => {
    const status = booking.status as BookingStatus
    const summary = status === 'pending_payment' ? 'Pending direct booking hold' : 'Direct booking blocked'
    return [
      'BEGIN:VEVENT',
      `UID:maxentertain-direct-${booking._id}@maxentertain.com`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${formatICalDate(booking.checkIn)}`,
      `DTEND;VALUE=DATE:${formatICalDate(booking.checkOut)}`,
      `SUMMARY:${escapeICal(summary)} - MAX Entertain`,
      `STATUS:${status === 'pending_payment' ? 'TENTATIVE' : 'CONFIRMED'}`,
      'TRANSP:OPAQUE',
      'DESCRIPTION:Direct booking blocked',
      `LAST-MODIFIED:${formatICalDateTime(booking.updatedAt ?? booking.createdAt ?? new Date())}`,
      'END:VEVENT',
    ]
  })

  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MAX Entertain//Direct Bookings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:MAX Entertain Direct Bookings',
    ...events,
    'END:VCALENDAR',
    '',
  ].join('\r\n')

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
