import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { requireOwner } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireOwner(req)
  if (denied) return denied

  const db = await getDb()
  const events = await db
    .collection('booking_events')
    .find({ bookingId: params.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray()

  return NextResponse.json({ events })
}
