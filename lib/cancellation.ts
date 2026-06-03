import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { BookingRecord } from '@/types/booking'

export interface RefundPreview {
  refundAud: number
  refundPercent: number
  daysBeforeCheckIn: number
  policyApplied: string
}

export function computeRefund(booking: BookingRecord, now = new Date()): RefundPreview {
  const daysBeforeCheckIn = differenceInCalendarDays(parseISO(booking.checkIn), now)
  const totalAud = booking.pricing.totalAud

  if (daysBeforeCheckIn > 14) {
    return {
      refundAud: totalAud,
      refundPercent: 100,
      daysBeforeCheckIn,
      policyApplied: 'More than 14 days before check-in: full refund.',
    }
  }

  if (daysBeforeCheckIn >= 7) {
    return {
      refundAud: Math.round(totalAud * 0.5),
      refundPercent: 50,
      daysBeforeCheckIn,
      policyApplied: '7-14 days before check-in: 50% refund.',
    }
  }

  return {
    refundAud: 0,
    refundPercent: 0,
    daysBeforeCheckIn,
    policyApplied: 'Less than 7 days before check-in: no refund.',
  }
}
