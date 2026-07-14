import { NextRequest, NextResponse } from 'next/server'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { getDb } from '@/lib/mongodb'
import type { BookingRecord, GuestRecord } from '@/types/booking'
import { markCheckoutCompletedSent, markPreStaySent } from '@/lib/bookings'
import { canPlaceBond, placeBondHold, releaseBond } from '@/lib/bonds'
import { sendCheckoutFollowupEmail, sendPreStayEmail, sendReturningGuestOfferEmail } from '@/lib/email'

export const runtime = 'nodejs'

const PRE_STAY_DAYS = [14, 7, 3, 1]
const TZ = 'Australia/Melbourne'

function getReturningGuestCampaign(now: Date) {
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()

  if (month === 3 && day <= 7) return { id: `${year}-easter-school-holidays`, label: 'Easter school holidays' }
  if (month === 6 && day <= 7) return { id: `${year}-winter-school-holidays`, label: 'Winter school holidays' }
  if (month === 8 && day >= 15 && day <= 21) return { id: `${year}-spring-school-holidays`, label: 'Spring school holidays' }
  if (month === 11 && day <= 7) return { id: `${year + 1}-summer-school-holidays`, label: 'Summer school holidays' }

  return null
}

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
  // Anchor all day-offset maths to the current calendar day in Melbourne, so
  // "N days before check-in" and "checkout day" follow Melbourne dates rather
  // than the server's UTC day.
  const today = parseISO(formatInTimeZone(now, TZ, 'yyyy-MM-dd'))
  // Include 'completed' so the security-deposit release can run after checkout
  // (the checkout follow-up flips a booking from confirmed → completed).
  const bookings = await db
    .collection<BookingRecord>('bookings')
    .find({ status: { $in: ['confirmed', 'completed'] } })
    .toArray()

  let preStayEvents = 0
  let checkoutEvents = 0
  let returningOfferEvents = 0
  let bondEvents = 0
  let failedEvents = 0

  for (const booking of bookings) {
    try {
      const daysUntilCheckIn = differenceInCalendarDays(parseISO(booking.checkIn), today)
      const sentPreStay = booking.comms?.preStaySent ?? []

      if (PRE_STAY_DAYS.includes(daysUntilCheckIn) && !sentPreStay.includes(daysUntilCheckIn)) {
        await sendPreStayEmail(booking, daysUntilCheckIn)
        await markPreStaySent(booking._id, daysUntilCheckIn)
        preStayEvents += 1
      }

      const daysSinceCheckout = differenceInCalendarDays(today, parseISO(booking.checkOut))
      if (daysSinceCheckout >= 0 && !booking.comms?.checkoutCompletedSent) {
        await sendCheckoutFollowupEmail(booking)
        await markCheckoutCompletedSent(booking._id)
        checkoutEvents += 1
      }

      // Security deposit: place the hold ~1 day before check-in, release ~1 day
      // after checkout. Placement only runs when a card was saved at checkout.
      if (daysUntilCheckIn <= 1 && daysUntilCheckIn >= 0 && canPlaceBond(booking)) {
        await placeBondHold(booking)
        bondEvents += 1
      } else if (daysSinceCheckout >= 1 && booking.bond?.status === 'authorized') {
        await releaseBond(booking)
        bondEvents += 1
      }
    } catch (error) {
      failedEvents += 1
      console.error(`Failed booking comms for booking ${booking._id}:`, error)
    }
  }

  const campaign = getReturningGuestCampaign(now)
  if (campaign) {
    const guests = await db
      .collection<GuestRecord>('guests')
      .find({ offerCampaignsSent: { $ne: campaign.id }, marketingOptOut: { $ne: true } })
      .limit(100)
      .toArray()

    for (const guest of guests) {
      try {
        await sendReturningGuestOfferEmail(guest, campaign)
        await db.collection('guests').updateOne(
          { _id: guest._id as any } as any,
          {
            $addToSet: { offerCampaignsSent: campaign.id },
            $set: { lastOfferSentAt: now, updatedAt: now },
          }
        )
        returningOfferEvents += 1
      } catch (error) {
        failedEvents += 1
        console.error(`Failed returning guest offer for ${guest.email}:`, error)
      }
    }
  }

  return NextResponse.json({ ok: true, preStayEvents, checkoutEvents, returningOfferEvents, bondEvents, failedEvents })
}
