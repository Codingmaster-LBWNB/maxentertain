import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const db = await getDb()
  const events = await db
    .collection('booking_events')
    .find({ bookingId: params.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray()

  return NextResponse.json({ events })
}
