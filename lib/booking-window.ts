import { formatInTimeZone } from 'date-fns-tz'

// Client-safe (no server deps) so both the booking pickers and the server
// booking logic share one source of truth for the advance-notice rule.

const TZ = 'Australia/Melbourne'

/**
 * Guests must book at least this many days before check-in — no same-day or
 * last-minute bookings. The earliest selectable check-in is today + this many
 * days (in Melbourne time).
 */
export const MIN_ADVANCE_DAYS = 3

/** Furthest check-in allowed from today (Melbourne), in calendar months. */
export const MAX_BOOKING_HORIZON_MONTHS = 24

/** Hard cap on total people staying (adults + children). */
export const MAX_OCCUPANCY = 25

function melbourneYmdParts(now: Date = new Date()) {
  const todayStr = formatInTimeZone(now, TZ, 'yyyy-MM-dd')
  const [y, m, d] = todayStr.split('-').map(Number)
  return { y, m, d, todayStr }
}

function padYmd(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Earliest check-in date a guest may select or book, as YYYY-MM-DD (Melbourne). */
export function earliestCheckInStr(now: Date = new Date()): string {
  const { y, m, d } = melbourneYmdParts(now)
  const dt = new Date(Date.UTC(y, m - 1, d) + MIN_ADVANCE_DAYS * 86_400_000)
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`
}

/**
 * Latest check-in date a guest may select or book, as YYYY-MM-DD (Melbourne).
 * Adds MAX_BOOKING_HORIZON_MONTHS calendar months to today, clamping the day
 * when the target month is shorter (e.g. Jan 31 → Mar 31).
 */
export function latestCheckInStr(now: Date = new Date()): string {
  const { y, m, d } = melbourneYmdParts(now)
  const totalMonths = y * 12 + (m - 1) + MAX_BOOKING_HORIZON_MONTHS
  const ty = Math.floor(totalMonths / 12)
  const tm = (totalMonths % 12) + 1
  const daysInMonth = new Date(Date.UTC(ty, tm, 0)).getUTCDate()
  const td = Math.min(d, daysInMonth)
  return padYmd(ty, tm, td)
}
