import { NextResponse } from 'next/server'
import { getBookingById, toPublicBookingSummary } from '@/lib/bookings'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const booking = await getBookingById(params.id)

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json(toPublicBookingSummary(booking, booking.status === 'confirmed'))
}
