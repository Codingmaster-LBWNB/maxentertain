import { NextRequest, NextResponse } from 'next/server'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { getDb } from '@/lib/mongodb'
import type { BookingRecord } from '@/types/booking'
import { markCheckoutCompletedSent, markPreStaySent } from '@/lib/bookings'
import { sendCheckoutFollowupEmail, sendPreStayEmail } from '@/lib/email'

export const runtime = 'nodejs'

const PRE_STAY_DAYS = [14, 7, 3, 1]

function isAuthorised(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'

  const auth = req.headers.get('authorization')
  const querySecret = req.nextUrl.searchParams.get('secret')
  return auth === `Bearer ${secret}` || querySecret === secret
}

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const now = new Date()
  const bookings = await db
    .collection<BookingRecord>('bookings')
    .find({ status: 'confirmed' })
    .toArray()

  let preStayEvents = 0
  let checkoutEvents = 0
  let failedEvents = 0

  for (const booking of bookings) {
    try {
      const daysUntilCheckIn = differenceInCalendarDays(parseISO(booking.checkIn), now)
      const sentPreStay = booking.comms?.preStaySent ?? []

      if (PRE_STAY_DAYS.includes(daysUntilCheckIn) && !sentPreStay.includes(daysUntilCheckIn)) {
        await sendPreStayEmail(booking, daysUntilCheckIn)
        await markPreStaySent(booking._id, daysUntilCheckIn)
        preStayEvents += 1
      }

      const daysSinceCheckout = differenceInCalendarDays(now, parseISO(booking.checkOut))
      if (daysSinceCheckout >= 0 && !booking.comms?.checkoutCompletedSent) {
        await sendCheckoutFollowupEmail(booking)
        await markCheckoutCompletedSent(booking._id)
        checkoutEvents += 1
      }
    } catch (error) {
      failedEvents += 1
      console.error(`Failed booking comms for booking ${booking._id}:`, error)
    }
  }

  return NextResponse.json({ ok: true, preStayEvents, checkoutEvents, failedEvents })
}
