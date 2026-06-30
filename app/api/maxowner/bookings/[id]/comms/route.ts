import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { buildCommsTimeline } from '@/lib/bookingComms'
import type { BookingRecord } from '@/types/booking'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const db = await getDb()
  const booking = await db.collection<BookingRecord>('bookings').findOne({ _id: params.id })
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  return NextResponse.json({ timeline: buildCommsTimeline(booking) })
}
