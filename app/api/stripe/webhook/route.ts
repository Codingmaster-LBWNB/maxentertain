import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import {
  confirmBookingPayment,
  expireBooking,
  getBookingById,
  hasActiveLocksForBooking,
  hasCommsEvent,
  markCommsEventFailed,
  markCommsEventSent,
  markPaymentOrphaned,
  recordStripeEventIfNew,
} from '@/lib/bookings'
import { getStripe, getStripeWebhookSecret } from '@/lib/stripe'
import { sendBookingConfirmedEmail, sendOwnerBookingAlert, sendOwnerPaymentIssueAlert } from '@/lib/email'

export const runtime = 'nodejs'

async function buildPaymentDetails(session: Stripe.Checkout.Session) {
  const stripe = getStripe()
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id

  let chargeId: string | undefined
  let receiptUrl: string | undefined

  if (paymentIntentId) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    })
    const latestCharge = paymentIntent.latest_charge
    if (latestCharge && typeof latestCharge !== 'string') {
      chargeId = latestCharge.id
      receiptUrl = latestCharge.receipt_url ?? undefined
    }
  }

  const invoiceId = typeof session.invoice === 'string' ? session.invoice : session.invoice?.id
  let invoiceUrl: string | undefined
  if (invoiceId) {
    const invoice = await stripe.invoices.retrieve(invoiceId)
    invoiceUrl = invoice.hosted_invoice_url ?? undefined
  }

  return {
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    stripeChargeId: chargeId,
    stripeInvoiceId: invoiceId,
    stripeInvoiceUrl: invoiceUrl,
    stripeReceiptUrl: receiptUrl,
    paidAt: new Date(),
  }
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const rawBody = await req.text()
    event = stripe.webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid Stripe webhook'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    const isNewEvent = await recordStripeEventIfNew(event.id, event.type)
    if (!isNewEvent) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId
      if (!bookingId) throw new Error('Missing bookingId in Stripe metadata')

      const payment = await buildPaymentDetails(session)
      const existingBooking = await getBookingById(bookingId)
      if (!existingBooking) {
        throw new Error(`Booking ${bookingId} not found for completed checkout`)
      }

      const locksStillHeld = await hasActiveLocksForBooking(existingBooking)
      if (existingBooking.status !== 'pending_payment' || !locksStillHeld) {
        const reason = `Checkout completed after booking status became ${existingBooking.status} or locks were missing`
        const orphaned = await markPaymentOrphaned(bookingId, payment, reason)
        if (payment.stripePaymentIntentId) {
          await stripe.refunds.create(
            {
              payment_intent: payment.stripePaymentIntentId,
              metadata: { bookingId, reason: 'orphaned_direct_booking_payment' },
            },
            { idempotencyKey: `orphan-refund-${bookingId}` }
          )
        }
        if (orphaned) await sendOwnerPaymentIssueAlert(orphaned, reason)
        return NextResponse.json({ received: true, orphaned: true })
      }

      const booking = await confirmBookingPayment(bookingId, payment)

      const emailEvent = 'booking.confirmed.email'
      if (!(await hasCommsEvent(booking._id, emailEvent))) {
        try {
          await Promise.all([
            sendBookingConfirmedEmail(booking),
            sendOwnerBookingAlert(booking),
          ])
          await markCommsEventSent(booking._id, emailEvent)
        } catch (error) {
          await markCommsEventFailed(booking._id, emailEvent, error)
          throw error
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId
      if (bookingId) {
        await expireBooking(bookingId, 'stripe_checkout_expired')
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const bookingId = paymentIntent.metadata?.bookingId
      if (bookingId) await expireBooking(bookingId, 'payment_failed')
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe webhook handler failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
