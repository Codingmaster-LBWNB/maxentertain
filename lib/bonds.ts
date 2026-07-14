import type { Db } from 'mongodb'
import { getStripe } from '@/lib/stripe'
import { getDb } from '@/lib/mongodb'
import { BOND_AMOUNT_AUD } from '@/lib/pricing'
import { sendBondHoldEmail, sendBondReleasedEmail, sendBondCapturedEmail, sendOwnerPaymentIssueAlert } from '@/lib/email'
import type { BookingRecord } from '@/types/booking'

/**
 * Refundable security-deposit ("bond") lifecycle via Stripe.
 *
 * A bond is a manual-capture PaymentIntent authorised against the card the guest
 * saved at checkout. Placing it only *reserves* funds — no money moves. It is
 * released (cancelled) after checkout, or captured if the owner claims damage.
 *
 * NOTE: a Stripe authorisation is valid ~7 days, so we place it ~1 day before
 * check-in and release ~1 day after checkout. For stays of ~6+ nights the auth
 * can expire before checkout (Stripe auto-voids it); a damage claim can still be
 * made by charging the saved card, which is why we keep the customer + payment
 * method on the booking.
 */

async function recordBondEvent(db: Db, bookingId: string, event: string, data: Record<string, unknown> = {}) {
  try {
    await db.collection('booking_events').insertOne({ bookingId, event, data, createdAt: new Date() })
  } catch { /* non-fatal */ }
}

/** Whether a bond can still be placed for this booking (has a saved card, none held yet). */
export function canPlaceBond(booking: BookingRecord): boolean {
  const status = booking.bond?.status
  return (
    Boolean(booking.payment.stripeCustomerId && booking.payment.stripePaymentMethodId) &&
    (!status || status === 'none')
  )
}

export async function placeBondHold(booking: BookingRecord) {
  const db = await getDb()
  const customer = booking.payment.stripeCustomerId
  const paymentMethod = booking.payment.stripePaymentMethodId
  if (!customer || !paymentMethod) return // no saved card — nothing to hold

  const stripe = getStripe()
  try {
    const pi = await stripe.paymentIntents.create(
      {
        amount: BOND_AMOUNT_AUD * 100,
        currency: 'aud',
        customer,
        payment_method: paymentMethod,
        capture_method: 'manual',
        confirm: true,
        off_session: true,
        description: `Security deposit hold — booking ${booking._id}`,
        metadata: { bookingId: booking._id, type: 'security_deposit' },
      },
      { idempotencyKey: `bond-auth-${booking._id}` }
    )

    const now = new Date()
    await db.collection('bookings').updateOne(
      { _id: booking._id as any } as any,
      {
        $set: {
          bond: { status: 'authorized', amountAud: BOND_AMOUNT_AUD, paymentIntentId: pi.id, authorizedAt: now },
          updatedAt: now,
        },
      }
    )
    await recordBondEvent(db, booking._id, 'bond.authorized', { amountAud: BOND_AMOUNT_AUD, paymentIntentId: pi.id })
    try { await sendBondHoldEmail(booking) } catch { /* email non-fatal */ }
  } catch (err: any) {
    const now = new Date()
    const message = String(err?.message ?? 'Bond authorization failed').slice(0, 300)
    await db.collection('bookings').updateOne(
      { _id: booking._id as any } as any,
      { $set: { bond: { status: 'failed', amountAud: BOND_AMOUNT_AUD, lastError: message }, updatedAt: now } }
    )
    await recordBondEvent(db, booking._id, 'bond.failed', { error: message })
    try { await sendOwnerPaymentIssueAlert(booking, `Security deposit hold failed: ${message}`) } catch { /* non-fatal */ }
  }
}

export async function releaseBond(booking: BookingRecord) {
  const db = await getDb()
  const bond = booking.bond
  if (!bond || bond.status !== 'authorized' || !bond.paymentIntentId) return

  const stripe = getStripe()
  const now = new Date()
  try {
    await stripe.paymentIntents.cancel(bond.paymentIntentId)
  } catch {
    // Already cancelled or expired (Stripe auto-voids after ~7 days) — treat as released.
  }
  await db.collection('bookings').updateOne(
    { _id: booking._id as any } as any,
    { $set: { 'bond.status': 'released', 'bond.releasedAt': now, updatedAt: now } }
  )
  await recordBondEvent(db, booking._id, 'bond.released', {})
  try { await sendBondReleasedEmail(booking) } catch { /* non-fatal */ }
}

/** Capture up to the authorised amount when the owner claims damage. */
export async function captureBond(booking: BookingRecord, amountAud?: number) {
  const db = await getDb()
  const bond = booking.bond
  if (!bond || bond.status !== 'authorized' || !bond.paymentIntentId) {
    throw new Error('No active security hold to capture for this booking.')
  }
  const requested = Math.round(amountAud ?? bond.amountAud)
  const cap = Math.min(Math.max(1, requested), bond.amountAud)

  const stripe = getStripe()
  const now = new Date()
  await stripe.paymentIntents.capture(bond.paymentIntentId, { amount_to_capture: cap * 100 })

  await db.collection('bookings').updateOne(
    { _id: booking._id as any } as any,
    { $set: { 'bond.status': 'captured', 'bond.capturedAt': now, 'bond.capturedAmountAud': cap, updatedAt: now } }
  )
  await recordBondEvent(db, booking._id, 'bond.captured', { amountAud: cap })
  try { await sendBondCapturedEmail(booking, cap) } catch { /* non-fatal */ }
}
