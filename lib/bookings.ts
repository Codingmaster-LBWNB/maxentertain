import { randomUUID } from 'crypto'
import type { Db, MongoServerError } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { getPriceSummary, NIGHTLY_RATES, PET_FEE_AUD, PricingTier } from '@/lib/pricing'
import type {
  BookingGroupType,
  BookingGuest,
  BookingPayment,
  BookingPricing,
  BookingRecord,
  BookingStatus,
  GuestRecord,
  PublicBookingSummary,
} from '@/types/booking'
import { getSiteUrl } from '@/lib/site'
import { sendBookingRecoveryEmail } from '@/lib/email'
import { MIN_ADVANCE_DAYS, earliestCheckInStr } from '@/lib/booking-window'

export const PROPERTY_ID = 'maxentertain'
export const PENDING_HOLD_MINUTES = 30
export const SHORT_STAY_LEVY_RATE = 0.075

export class DatesUnavailableError extends Error {
  constructor(message = 'Selected dates are no longer available') {
    super(message)
    this.name = 'DatesUnavailableError'
  }
}

export class BookingValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BookingValidationError'
  }
}

interface PricingSettings {
  overrides: Record<string, number>
  tierPrices: Record<PricingTier, number>
  minNightsMap: Record<string, number>
}

export interface CreatePendingBookingInput {
  checkIn: string
  checkOut: string
  guest: BookingGuest
  rulesAccepted: boolean
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
let indexesEnsured = false

function toUtcDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function dateToStr(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function getNightDates(checkIn: string, checkOut: string) {
  if (!DATE_RE.test(checkIn) || !DATE_RE.test(checkOut)) {
    throw new BookingValidationError('Dates must use YYYY-MM-DD format')
  }

  const start = toUtcDate(checkIn)
  const endExclusive = toUtcDate(checkOut)
  if (start >= endExclusive) {
    throw new BookingValidationError('Check-out must be after check-in')
  }

  const dates: string[] = []
  for (const cur = new Date(start); cur < endExclusive; cur.setUTCDate(cur.getUTCDate() + 1)) {
    dates.push(dateToStr(cur))
  }
  return dates
}

function normaliseGroupType(value: string): BookingGroupType {
  const allowed: BookingGroupType[] = ['family', 'corporate', 'golf', 'milestone', 'other']
  return allowed.includes(value as BookingGroupType) ? (value as BookingGroupType) : 'other'
}

export function normaliseGuest(input: Record<string, unknown>): BookingGuest {
  const guests = Number(input.guests)
  if (!Number.isInteger(guests) || guests < 1 || guests > 30) {
    throw new BookingValidationError('Guest count must be between 1 and 30')
  }

  const guest: BookingGuest = {
    name: String(input.name ?? '').trim(),
    email: String(input.email ?? '').trim().toLowerCase(),
    phone: String(input.phone ?? '').trim(),
    guests,
    groupType: normaliseGroupType(String(input.groupType ?? 'other')),
    pets: String(input.pets ?? '').trim(),
    withPet: input.withPet === true,
    message: String(input.message ?? '').trim(),
  }

  if (!guest.name) throw new BookingValidationError('Name is required')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) {
    throw new BookingValidationError('A valid email is required')
  }
  if (!guest.phone) throw new BookingValidationError('Phone is required')
  if (!guest.message) throw new BookingValidationError('Message is required')

  return guest
}

async function ensureBookingIndexes(db: Db) {
  if (indexesEnsured) return

  await Promise.all([
    db.collection('booking_locks').createIndex({ propertyId: 1, date: 1 }, { unique: true }),
    db.collection('booking_locks').createIndex({ status: 1, expiresAt: 1 }),
    db.collection('bookings').createIndex({ stripeSessionId: 1 }, { sparse: true }),
    db.collection('bookings').createIndex({ 'payment.stripePaymentIntentId': 1 }, { sparse: true }),
    db.collection('bookings').createIndex({ cancellationToken: 1 }, { unique: true }),
    db.collection('bookings').createIndex({ status: 1, checkIn: 1, checkOut: 1 }),
    db.collection('booking_events').createIndex({ bookingId: 1, createdAt: 1 }),
    db.collection('stripe_events').createIndex({ eventId: 1 }, { unique: true }),
  ])

  indexesEnsured = true
}

async function getPricingSettings(db: Db): Promise<PricingSettings> {
  const [overrideDocs, tierDocs, minNightsDocs] = await Promise.all([
    db.collection('pricing_overrides').find({}, { projection: { _id: 0, date: 1, price: 1 } }).toArray(),
    db.collection('pricing_tiers').find({}, { projection: { _id: 0, tier: 1, price: 1 } }).toArray(),
    db.collection('min_nights_overrides').find({}, { projection: { _id: 0, date: 1, minNights: 1 } }).toArray(),
  ])

  const overrides: Record<string, number> = {}
  for (const doc of overrideDocs) overrides[String(doc.date)] = Number(doc.price)

  const tierPrices: Record<PricingTier, number> = { ...NIGHTLY_RATES }
  for (const doc of tierDocs) {
    if (String(doc.tier) in tierPrices) {
      tierPrices[String(doc.tier) as PricingTier] = Number(doc.price)
    }
  }

  const minNightsMap: Record<string, number> = {}
  for (const doc of minNightsDocs) minNightsMap[String(doc.date)] = Number(doc.minNights)

  return { overrides, tierPrices, minNightsMap }
}

export async function getBookingQuote(checkIn: string, checkOut: string): Promise<BookingPricing & { totalNights: number; minNights: number }> {
  const db = await getDb()
  const nights = getNightDates(checkIn, checkOut)
  const settings = await getPricingSettings(db)
  const minNights = nights.reduce((max, date) => Math.max(max, settings.minNightsMap[date] ?? 2), 2)

  if (nights.length < minNights) {
    throw new BookingValidationError(`Minimum stay for these dates is ${minNights} nights`)
  }

  const summary = getPriceSummary(checkIn, checkOut, settings.overrides, settings.tierPrices)
  const totalAud = summary.total
  const shortStayLevyAud = Math.round(totalAud * SHORT_STAY_LEVY_RATE)

  return {
    accommodationAud: totalAud,
    shortStayLevyRate: SHORT_STAY_LEVY_RATE,
    shortStayLevyAud,
    petFeeAud: 0,
    totalAud,
    totalCents: totalAud * 100,
    nights: summary.nights,
    totalNights: summary.totalNights,
    minNights,
  }
}

function isDuplicateKeyError(error: unknown): error is MongoServerError {
  return typeof error === 'object' && error !== null && 'code' in error && (error as MongoServerError).code === 11000
}

export async function recordBookingEvent(db: Db, bookingId: string, event: string, data: Record<string, unknown> = {}) {
  await db.collection('booking_events').insertOne({
    bookingId,
    event,
    data,
    createdAt: new Date(),
  })
}

export async function recordStripeEventIfNew(eventId: string, eventType: string) {
  const db = await getDb()
  await ensureBookingIndexes(db)

  try {
    await db.collection('stripe_events').insertOne({
      eventId,
      eventType,
      receivedAt: new Date(),
    })
    return true
  } catch (error) {
    if (isDuplicateKeyError(error)) return false
    throw error
  }
}

export async function cleanupExpiredPendingBookings() {
  const db = await getDb()
  await ensureBookingIndexes(db)

  const now = new Date()
  const expired = await db
    .collection<BookingRecord>('bookings')
    .find({ status: 'pending_payment', expiresAt: { $lte: now } })
    .toArray()

  for (const booking of expired) {
    await expireBooking(booking._id, 'checkout_expired')
  }

  return expired.length
}

export async function createPendingBooking(input: CreatePendingBookingInput) {
  const db = await getDb()
  await ensureBookingIndexes(db)
  await cleanupExpiredPendingBookings()

  const nightDates = getNightDates(input.checkIn, input.checkOut)

  // Enforce the advance-notice window (no same-day / last-minute bookings).
  const earliest = earliestCheckInStr()
  if (input.checkIn < earliest) {
    throw new BookingValidationError(
      `Bookings require at least ${MIN_ADVANCE_DAYS} days' notice. The earliest available check-in is ${earliest}.`
    )
  }

  const quote = await getBookingQuote(input.checkIn, input.checkOut)

  if (!input.rulesAccepted) {
    throw new BookingValidationError('House rules must be accepted before booking')
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + PENDING_HOLD_MINUTES * 60 * 1000)
  const bookingId = randomUUID()
  const cancellationToken = randomUUID()

  const manualBlock = await db.collection('manual_blocks').findOne({ date: { $in: nightDates } })
  if (manualBlock) {
    throw new DatesUnavailableError()
  }

  // Flat pet cleaning fee on top of the accommodation total when travelling with a pet.
  const petFeeAud = input.guest.withPet ? PET_FEE_AUD : 0
  const totalAud = quote.totalAud + petFeeAud

  const booking: BookingRecord = {
    _id: bookingId,
    propertyId: PROPERTY_ID,
    status: 'pending_payment',
    guest: input.guest,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights: nightDates.length,
    pricing: {
      accommodationAud: quote.accommodationAud,
      shortStayLevyRate: quote.shortStayLevyRate,
      shortStayLevyAud: quote.shortStayLevyAud,
      petFeeAud,
      totalAud,
      totalCents: totalAud * 100,
      nights: quote.nights,
    },
    payment: {},
    source: 'direct',
    rulesAccepted: input.rulesAccepted,
    cancellationToken,
    expiresAt,
    createdAt: now,
    updatedAt: now,
    comms: { commsEventsSent: [] },
  }

  const locks = nightDates.map((date) => ({
    propertyId: PROPERTY_ID,
    date,
    bookingId,
    status: 'pending_payment' as BookingStatus,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  }))

  try {
    await db.collection('booking_locks').insertMany(locks, { ordered: true })
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new DatesUnavailableError()
    }
    throw error
  }

  try {
    await db.collection<BookingRecord>('bookings').insertOne(booking)
    await recordBookingEvent(db, bookingId, 'booking.pending_created')
  } catch (error) {
    await db.collection('booking_locks').deleteMany({ bookingId })
    throw error
  }

  return booking
}

export async function attachStripeSession(bookingId: string, stripeSessionId: string) {
  const db = await getDb()
  await db.collection('bookings').updateOne(
    { _id: bookingId as any, status: 'pending_payment' } as any,
    {
      $set: {
        'payment.stripeSessionId': stripeSessionId,
        stripeSessionId,
        updatedAt: new Date(),
      },
    }
  )
  const booking = await getBookingById(bookingId)
  if (!booking) throw new Error('Booking not found after Stripe session update')
  return booking
}

export async function confirmBookingPayment(bookingId: string, payment: BookingPayment) {
  const db = await getDb()
  await ensureBookingIndexes(db)
  const now = new Date()
  const existing = await getBookingById(bookingId)

  await db.collection<BookingRecord>('bookings').updateOne(
    { _id: bookingId, status: { $in: ['pending_payment', 'confirmed'] } },
    {
      $set: {
        status: 'confirmed',
        payment,
        confirmedAt: now,
        updatedAt: now,
      },
      $unset: { expiresAt: '' },
    }
  )

  await db.collection('booking_locks').updateMany(
    { bookingId },
    {
      $set: { status: 'confirmed', updatedAt: now },
      $unset: { expiresAt: '' },
    }
  )
  await recordBookingEvent(db, bookingId, 'booking.confirmed', { payment })

  const booking = await getBookingById(bookingId)
  if (!booking) throw new Error('Booking not found after confirmation')
  if (existing?.status !== 'confirmed') {
    await upsertGuestFromBooking(booking)
  }
  return booking
}

export async function hasActiveLocksForBooking(booking: BookingRecord) {
  const db = await getDb()
  const nights = getNightDates(booking.checkIn, booking.checkOut)
  const count = await db.collection('booking_locks').countDocuments({
    bookingId: booking._id,
    date: { $in: nights },
    status: { $in: ['pending_payment', 'confirmed'] },
  })
  return count === nights.length
}

export async function upsertGuestFromBooking(booking: BookingRecord) {
  const db = await getDb()
  const now = new Date()
  const email = booking.guest.email.toLowerCase()

  await db.collection<GuestRecord>('guests').updateOne(
    { _id: email } as any,
    {
      $set: {
        propertyId: booking.propertyId,
        name: booking.guest.name,
        email,
        phone: booking.guest.phone,
        lastBookingId: booking._id,
        lastCheckIn: booking.checkIn,
        lastCheckOut: booking.checkOut,
        lastStayedAt: new Date(`${booking.checkOut}T00:00:00.000Z`),
        updatedAt: now,
      },
      // NOTE: totalBookings/totalSpendAud must NOT also appear here — MongoDB
      // rejects a field that is in both $setOnInsert and $inc ("would create a
      // conflict"). $inc initialises a missing field from 0 on insert, so the
      // counters are correct either way. _id comes from the query filter.
      $setOnInsert: {
        offerCampaignsSent: [],
        createdAt: now,
      },
      $inc: {
        totalBookings: 1,
        totalSpendAud: booking.pricing.totalAud,
      },
      $addToSet: {
        tags: booking.guest.groupType,
      },
    } as any,
    { upsert: true }
  )
}

export async function expireBooking(bookingId: string, reason = 'expired') {
  const db = await getDb()
  const now = new Date()
  const booking = await getBookingById(bookingId)
  if (!booking || booking.status !== 'pending_payment') return booking

  await db.collection('booking_locks').deleteMany({ bookingId })
  await db.collection<BookingRecord>('bookings').updateOne(
    { _id: bookingId, status: 'pending_payment' },
    {
      $set: { status: 'expired', updatedAt: now },
      $unset: { expiresAt: '' },
    }
  )
  await recordBookingEvent(db, bookingId, 'booking.pending_expired', { reason })

  // Abandoned-checkout recovery: the guest reached the booking form (so we have
  // their email) but never paid. Nudge them back with a prefilled resume link.
  // Only for genuine abandonment/failure — not when the owner manually expires a
  // hold — and only once per booking.
  const RECOVERY_REASONS = new Set(['checkout_expired', 'stripe_checkout_expired', 'payment_failed'])
  if (RECOVERY_REASONS.has(reason) && booking.guest?.email) {
    try {
      if (!(await hasCommsEvent(bookingId, 'booking.recovery.email'))) {
        await sendBookingRecoveryEmail(booking)
        await markCommsEventSent(bookingId, 'booking.recovery.email')
        await recordBookingEvent(db, bookingId, 'booking.recovery_email_sent', { reason })
      }
    } catch (err) {
      await markCommsEventFailed(bookingId, 'booking.recovery.email', err).catch(() => {})
    }
  }

  return getBookingById(bookingId)
}

export async function cancelBooking(bookingId: string, updates: { refundAmountAud: number; refundStripeId?: string; reason?: string }) {
  const db = await getDb()
  const now = new Date()
  const nextStatus: BookingStatus = updates.refundAmountAud > 0 ? 'refunded' : 'cancelled'

  await db.collection('booking_locks').deleteMany({ bookingId })
  await db.collection<BookingRecord>('bookings').updateOne(
    { _id: bookingId, status: { $in: ['cancelling', 'refund_pending'] } },
    {
      $set: {
        status: nextStatus,
        cancelledAt: now,
        cancelReason: updates.reason ?? 'Guest requested cancellation',
        refundAmountAud: updates.refundAmountAud,
        refundStripeId: updates.refundStripeId,
        updatedAt: now,
      },
    }
  )
  await recordBookingEvent(db, bookingId, 'booking.cancelled', updates)
  return getBookingById(bookingId)
}

export async function beginCancellation(bookingId: string, refundAmountAud: number, reason = 'Guest requested cancellation') {
  const db = await getDb()
  const nextStatus: BookingStatus = refundAmountAud > 0 ? 'refund_pending' : 'cancelling'
  const result = await db.collection<BookingRecord>('bookings').findOneAndUpdate(
    { _id: bookingId as any, status: 'confirmed' } as any,
    {
      $set: {
        status: nextStatus,
        cancelReason: reason,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  )

  if (result) {
    await recordBookingEvent(db, bookingId, 'booking.cancellation_started', { refundAmountAud, reason })
  }
  return result
}

export async function failCancellation(bookingId: string, error: string) {
  const db = await getDb()
  await db.collection<BookingRecord>('bookings').updateOne(
    { _id: bookingId as any, status: { $in: ['cancelling', 'refund_pending'] } } as any,
    {
      $set: {
        status: 'confirmed',
        updatedAt: new Date(),
        'comms.lastEmailError': error,
      },
    }
  )
  await recordBookingEvent(db, bookingId, 'booking.cancellation_failed', { error })
  return getBookingById(bookingId)
}

export async function markPaymentOrphaned(bookingId: string, payment: BookingPayment, reason: string) {
  const db = await getDb()
  await db.collection<BookingRecord>('bookings').updateOne(
    { _id: bookingId as any } as any,
    {
      $set: {
        status: 'payment_orphaned',
        payment,
        updatedAt: new Date(),
        'comms.lastEmailError': reason,
      },
    }
  )
  await recordBookingEvent(db, bookingId, 'booking.payment_orphaned', { reason, payment })
  return getBookingById(bookingId)
}

export async function getBookingById(bookingId: string) {
  const db = await getDb()
  return db.collection<BookingRecord>('bookings').findOne({ _id: bookingId })
}

export async function getBookingByCancellationToken(token: string) {
  const db = await getDb()
  return db.collection<BookingRecord>('bookings').findOne({ cancellationToken: token })
}

export async function getBookingByStripeSession(stripeSessionId: string) {
  const db = await getDb()
  return db.collection<BookingRecord>('bookings').findOne({
    $or: [{ stripeSessionId }, { 'payment.stripeSessionId': stripeSessionId }],
  })
}

export async function getActiveBookingLockDates() {
  const db = await getDb()
  await ensureBookingIndexes(db)
  const now = new Date()
  const docs = await db
    .collection('booking_locks')
    .find(
      {
        propertyId: PROPERTY_ID,
        $or: [
          { status: 'confirmed' },
          { status: 'pending_payment', expiresAt: { $gt: now } },
        ],
      },
      { projection: { _id: 0, date: 1 } }
    )
    .toArray()

  return docs.map((doc) => String(doc.date))
}

export function toPublicBookingSummary(booking: BookingRecord, includeToken = false): PublicBookingSummary {
  const siteUrl = getSiteUrl()
  return {
    id: booking._id,
    status: booking.status,
    guestName: booking.guest.name,
    guestEmail: booking.guest.email,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    nights: booking.nights,
    guestCount: booking.guest.guests,
    groupType: booking.guest.groupType,
    pets: booking.guest.pets,
    pricing: booking.pricing,
    invoiceUrl: booking.payment.stripeInvoiceUrl,
    receiptUrl: booking.payment.stripeReceiptUrl,
    cancellationToken: includeToken ? booking.cancellationToken : undefined,
    cancellationUrl: includeToken ? `${siteUrl}/manage-booking/${booking.cancellationToken}` : undefined,
    confirmedAt: booking.confirmedAt?.toISOString(),
  }
}

export async function markCommsEventIfFirst(bookingId: string, event: string) {
  const db = await getDb()
  const result = await db.collection('bookings').updateOne(
    {
      _id: bookingId as any,
      'comms.commsEventsSent': { $ne: event },
    } as any,
    {
      $addToSet: { 'comms.commsEventsSent': event },
      $set: { updatedAt: new Date() },
    }
  )

  return result.modifiedCount > 0
}

export async function hasCommsEvent(bookingId: string, event: string) {
  const db = await getDb()
  const found = await db.collection('bookings').findOne(
    {
      _id: bookingId as any,
      'comms.commsEventsSent': event,
    } as any,
    { projection: { _id: 1 } }
  )
  return Boolean(found)
}

export async function markCommsEventSent(bookingId: string, event: string) {
  const db = await getDb()
  await db.collection('bookings').updateOne(
    { _id: bookingId as any } as any,
    {
      $addToSet: { 'comms.commsEventsSent': event },
      $unset: { 'comms.lastEmailError': '' },
      $set: { updatedAt: new Date() },
    }
  )
}

export async function markCommsEventFailed(bookingId: string, event: string, error: unknown) {
  const db = await getDb()
  const message = error instanceof Error ? error.message : String(error)
  await db.collection('bookings').updateOne(
    { _id: bookingId as any } as any,
    {
      $set: {
        updatedAt: new Date(),
        'comms.lastEmailError': `${event}: ${message}`,
      },
    }
  )
}

export async function markPreStaySent(bookingId: string, daysBeforeCheckIn: number) {
  const db = await getDb()
  const now = new Date()
  await db.collection('bookings').updateOne(
    { _id: bookingId as any } as any,
    {
      $addToSet: { 'comms.preStaySent': daysBeforeCheckIn },
      // Record the exact send instant so the admin comms timeline is precise.
      $set: { [`comms.preStaySentAt.${daysBeforeCheckIn}`]: now, updatedAt: now },
    }
  )
}

export async function markCheckoutCompletedSent(bookingId: string) {
  const db = await getDb()
  await db.collection('bookings').updateOne(
    { _id: bookingId as any } as any,
    {
      $set: {
        status: 'completed',
        completedAt: new Date(),
        'comms.checkoutCompletedSent': true,
        'comms.reviewRequestedAt': new Date(),
        'comms.reviewSource': 'direct',
        updatedAt: new Date(),
      },
    }
  )
}
