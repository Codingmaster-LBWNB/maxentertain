import type { BookingRecord } from '@/types/booking'

/**
 * Builds the guest-communication timeline for a booking: every email the guest
 * receives across the booking lifecycle, with the exact instant each was sent
 * (when known) or is scheduled to send.
 *
 * Scheduling model (must match app/api/cron/booking-comms + vercel.json):
 * - The comms cron runs daily at 22:00 UTC ("0 22 * * *"), which is the next
 *   morning in Melbourne (≈09:00 AEDT / 08:00 AEST).
 * - Day offsets are computed against the current Melbourne date, so a pre-stay
 *   reminder for offset N is delivered on the Melbourne morning of
 *   (checkIn - N days), and the post-stay follow-up on the Melbourne morning
 *   of the checkout day.
 * Vercel may execute a cron a little after the scheduled minute, so scheduled
 * times are the nominal trigger instant.
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
// The daily comms cron (vercel.json: "0 22 * * *").
const CRON_UTC_HOUR = 22

/**
 * The instant a message due on Melbourne date (dateStr - offsetDays) is sent.
 * The cron runs at CRON_UTC_HOUR:00 UTC the evening before, which lands in the
 * Melbourne morning of the due date — so the instant is CRON_UTC_HOUR:00 UTC on
 * (dueDate - 1 day).
 */
function cronInstantUtc(dateStr: string, offsetDays: number): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dueMidnightUtc = Date.UTC(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0)
  return new Date(dueMidnightUtc - offsetDays * DAY_MS - DAY_MS + CRON_UTC_HOUR * 3600_000)
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
