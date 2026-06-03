import { NextRequest, NextResponse } from 'next/server'
import { cancelBooking, getBookingByCancellationToken, markCommsEventIfFirst } from '@/lib/bookings'
import { computeRefund } from '@/lib/cancellation'
import { getStripe } from '@/lib/stripe'
import { sendBookingCancelledEmail, sendOwnerCancellationAlert } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { cancellationToken, reason } = await req.json()
    if (!cancellationToken) {
      return NextResponse.json({ error: 'Cancellation token is required' }, { status: 400 })
    }

    const booking = await getBookingByCancellationToken(String(cancellationToken))
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'Only confirmed bookings can be cancelled online' }, { status: 400 })
    }

    const refund = computeRefund(booking)
    let refundStripeId: string | undefined

    if (refund.refundAud > 0) {
      if (!booking.payment.stripePaymentIntentId) {
        return NextResponse.json({ error: 'Payment intent missing; manual refund required' }, { status: 409 })
      }

      const stripeRefund = await getStripe().refunds.create({
        payment_intent: booking.payment.stripePaymentIntentId,
        amount: refund.refundAud * 100,
        metadata: {
          bookingId: booking._id,
          policyApplied: refund.policyApplied,
        },
      })
      refundStripeId = stripeRefund.id
    }

    const cancelled = await cancelBooking(booking._id, {
      refundAmountAud: refund.refundAud,
      refundStripeId,
      reason: String(reason ?? 'Guest requested cancellation'),
    })

    if (cancelled) {
      const shouldSendCancellationEmails = await markCommsEventIfFirst(cancelled._id, 'booking.cancelled.email')
      if (shouldSendCancellationEmails) {
        await Promise.allSettled([
          sendBookingCancelledEmail(cancelled, refund),
          sendOwnerCancellationAlert(cancelled, refund),
        ])
      }
    }

    return NextResponse.json({
      ok: true,
      refundAud: refund.refundAud,
      refundPercent: refund.refundPercent,
      policyApplied: refund.policyApplied,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cancellation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
