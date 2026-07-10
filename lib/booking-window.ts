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

/** Earliest check-in date a guest may select or book, as YYYY-MM-DD (Melbourne). */
export function earliestCheckInStr(now: Date = new Date()): string {
  const todayStr = formatInTimeZone(now, TZ, 'yyyy-MM-dd')
  const [y, m, d] = todayStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d) + MIN_ADVANCE_DAYS * 86_400_000)
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`
}
