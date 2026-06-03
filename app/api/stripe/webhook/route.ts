import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { confirmBookingPayment, expireBooking, markCommsEventIfFirst } from '@/lib/bookings'
import { getStripe, getStripeWebhookSecret } from '@/lib/stripe'
import { sendBookingConfirmedEmail, sendOwnerBookingAlert } from '@/lib/email'

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
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId
      if (!bookingId) throw new Error('Missing bookingId in Stripe metadata')

      const payment = await buildPaymentDetails(session)
      const booking = await confirmBookingPayment(bookingId, payment)

      const shouldSendConfirmationEmails = await markCommsEventIfFirst(booking._id, 'booking.confirmed.email')
      if (shouldSendConfirmationEmails) {
        await Promise.allSettled([
          sendBookingConfirmedEmail(booking),
          sendOwnerBookingAlert(booking),
        ])
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
