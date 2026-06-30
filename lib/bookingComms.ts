import type { BookingRecord } from '@/types/booking'

/**
 * Builds the guest-communication timeline for a booking: every email the guest
 * receives across the booking lifecycle, with the exact instant each was sent
 * (when known) or is scheduled to send.
 *
 * Scheduling model (must match app/api/cron/booking-comms):
 * - The comms cron runs daily at 09:00 UTC ("0 9 * * *").
 * - A pre-stay reminder for offset N fires on the cron run N calendar days
 *   before check-in, i.e. (checkIn - N days) at 09:00:00 UTC.
 * - The post-stay follow-up fires on the first cron run on/after check-out,
 *   i.e. checkOut at 09:00:00 UTC.
 * Vercel may execute a cron a little after the scheduled minute, so scheduled
 * times are the nominal 09:00:00 UTC trigger.
 */

export type CommsStatus = 'sent' | 'scheduled' | 'missed' | 'skipped' | 'awaiting_payment'

export interface CommsTimelineItem {
  key: string
  label: string
  audience: 'guest'
  description: string
  status: CommsStatus
  /** ISO instant the message was actually sent (if known). */
  sentAt?: string
  /** ISO instant the message is/was scheduled to send. */
  scheduledAt?: string
  note?: string
}

const PRE_STAY: Array<{ days: number; label: string }> = [
  { days: 14, label: 'Pre-stay reminder · 2 weeks before' },
  { days: 7, label: 'Pre-stay reminder · 1 week before' },
  { days: 3, label: 'Pre-stay reminder · 3 days before' },
  { days: 1, label: 'Pre-stay reminder · 1 day before' },
]

const DAY_MS = 86_400_000

/** The nominal cron instant: 09:00:00 UTC on (dateStr - offsetDays). */
function cronInstantUtc(dateStr: string, offsetDays: number): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const base = Date.UTC(y, (m ?? 1) - 1, d ?? 1, 9, 0, 0, 0)
  return new Date(base - offsetDays * DAY_MS)
}

export function buildCommsTimeline(booking: BookingRecord, now: Date = new Date()): CommsTimelineItem[] {
  const items: CommsTimelineItem[] = []
  const comms = booking.comms ?? {}
  const confirmedAt = booking.confirmedAt ? new Date(booking.confirmedAt) : undefined

  // 1. Booking confirmation — sent immediately when payment succeeds.
  items.push({
    key: 'confirmation',
    label: 'Booking confirmation',
    audience: 'guest',
    description: 'Dates, total paid, check-in/out times, invoice & receipt, and the manage/cancel link.',
    status: confirmedAt ? 'sent' : 'awaiting_payment',
    sentAt: confirmedAt?.toISOString(),
    note: confirmedAt ? undefined : 'Sends the moment payment succeeds.',
  })

  // 2. Pre-stay reminders (14 / 7 / 3 / 1 days before check-in).
  const preStaySent: number[] = comms.preStaySent ?? []
  const preStaySentAt: Record<string, Date | string> = comms.preStaySentAt ?? {}
  for (const { days, label } of PRE_STAY) {
    const scheduledAt = cronInstantUtc(booking.checkIn, days)
    const sentRaw = preStaySentAt[String(days)]
    const sentTs = sentRaw ? new Date(sentRaw) : undefined
    const isSent = preStaySent.includes(days) || Boolean(sentTs)

    let status: CommsStatus
    let note: string | undefined
    if (isSent) {
      status = 'sent'
      if (!sentTs) note = 'Exact send time not recorded for this older booking; showing the scheduled time.'
    } else if (scheduledAt.getTime() > now.getTime()) {
      status = 'scheduled'
    } else if (!confirmedAt) {
      status = 'skipped'
      note = 'Only sent for confirmed bookings.'
    } else if (confirmedAt.getTime() > scheduledAt.getTime()) {
      status = 'skipped'
      note = 'Booked after this reminder window had already passed.'
    } else {
      status = 'missed'
      note = 'Scheduled time has passed but no send was recorded — check the comms cron and CRON_SECRET.'
    }

    items.push({
      key: `pre_stay_${days}`,
      label,
      audience: 'guest',
      description:
        days <= 3
          ? 'Check-in/out reminder including the door access code and arrival details.'
          : 'Check-in/out reminder.',
      status,
      sentAt: (sentTs ?? (isSent ? scheduledAt : undefined))?.toISOString(),
      scheduledAt: scheduledAt.toISOString(),
      note,
    })
  }

  // 3. Post-stay thank-you & review request — first cron on/after check-out.
  const checkoutScheduled = cronInstantUtc(booking.checkOut, 0)
  const checkoutSentAt = comms.checkoutCompletedSent
    ? booking.completedAt
      ? new Date(booking.completedAt)
      : checkoutScheduled
    : undefined
  let coStatus: CommsStatus
  let coNote: string | undefined
  if (checkoutSentAt) {
    coStatus = 'sent'
  } else if (checkoutScheduled.getTime() > now.getTime()) {
    coStatus = 'scheduled'
  } else if (!confirmedAt) {
    coStatus = 'skipped'
    coNote = 'Only sent for confirmed bookings.'
  } else {
    coStatus = 'missed'
    coNote = 'Scheduled time has passed but no send was recorded — check the comms cron and CRON_SECRET.'
  }
  items.push({
    key: 'checkout_followup',
    label: 'Post-stay thank-you & review request',
    audience: 'guest',
    description: 'Thanks for the stay, a review request, and an invite to book direct again.',
    status: coStatus,
    sentAt: checkoutSentAt?.toISOString(),
    scheduledAt: checkoutScheduled.toISOString(),
    note: coNote,
  })

  return items
}
