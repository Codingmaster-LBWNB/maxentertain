import { NextRequest, NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site'
import { getStripe } from '@/lib/stripe'
import {
  attachStripeSession,
  BookingValidationError,
  createPendingBooking,
  DatesUnavailableError,
  getNightDates,
  normaliseGuest,
  PENDING_HOLD_MINUTES,
} from '@/lib/bookings'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Booking database is not configured' }, { status: 503 })
    }

    const stripe = getStripe()
    const body = await req.json()
    const checkIn = String(body.checkIn ?? '')
    const checkOut = String(body.checkOut ?? '')
    const guest = normaliseGuest(body)
    const rulesAccepted = body.rulesAccepted === true
    const requestedNights = getNightDates(checkIn, checkOut)

    const calendarResponse = await fetch(new URL('/api/calendar', req.nextUrl.origin), { cache: 'no-store' })
    if (!calendarResponse.ok) {
      return NextResponse.json(
        { error: 'Availability could not be verified. Please try again shortly.' },
        { status: 503 }
      )
    }

    const calendar = await calendarResponse.json()
    const blockedSet = new Set<string>(calendar.blockedDates ?? [])
    if (requestedNights.some((date) => blockedSet.has(date))) {
      throw new DatesUnavailableError()
    }

    const booking = await createPendingBooking({ checkIn, checkOut, guest, rulesAccepted })
    const siteUrl = getSiteUrl()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: booking.guest.email,
      expires_at: Math.floor(Date.now() / 1000) + PENDING_HOLD_MINUTES * 60,
      invoice_creation: { enabled: true },
      metadata: {
        bookingId: booking._id,
        propertyId: booking.propertyId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
      },
      payment_intent_data: {
        metadata: {
          bookingId: booking._id,
          propertyId: booking.propertyId,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'aud',
            unit_amount: booking.pricing.totalCents,
            product_data: {
              name: 'MAX Entertain direct booking',
              description: `${booking.checkIn} to ${booking.checkOut} (${booking.nights} nights)`,
            },
          },
        },
      ],
      success_url: `${siteUrl}/booking-confirmation?bookingId=${booking._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/booking-cancelled?bookingId=${booking._id}`,
      phone_number_collection: { enabled: true },
      billing_address_collection: 'auto',
    })

    const updatedBooking = await attachStripeSession(booking._id, session.id)

    return NextResponse.json({
      bookingId: updatedBooking._id,
      checkoutUrl: session.url,
      expiresAt: updatedBooking.expiresAt?.toISOString(),
      totalAud: updatedBooking.pricing.totalAud,
    })
  } catch (error) {
    if (error instanceof DatesUnavailableError) {
      return NextResponse.json({ error: 'DATES_UNAVAILABLE' }, { status: 409 })
    }

    if (error instanceof BookingValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : 'Booking could not be created'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
