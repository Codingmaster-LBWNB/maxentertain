'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'
import { useAvailability } from '@/hooks/useAvailability'
import { blockedDates as defaultBlockedDates } from '@/config/property'
import { getPriceSummary, groupNightsByTier, TIER_LABELS, NIGHTLY_RATES } from '@/lib/pricing'

const TZ = 'Australia/Melbourne'

export default function Calendar({
  blockedDates: blockedDatesProp,
  isLoading: isLoadingProp,
  lastUpdated: lastUpdatedProp,
}: {
  blockedDates?: string[]
  isLoading?: boolean
  lastUpdated?: string | null
}) {
  const availability = useAvailability({ enabled: blockedDatesProp === undefined })

  const nowAU = toZonedTime(new Date(), TZ)
  const [currentMonth, setCurrentMonth] = useState(nowAU)
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)

  const blockedDates = blockedDatesProp ?? availability.blockedDates
  const isLoading = isLoadingProp ?? availability.isLoading
  const lastUpdated = lastUpdatedProp ?? availability.lastUpdated

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Date string helpers (all in AU timezone)
  const auStr = (date: Date) => formatInTimeZone(date, TZ, 'yyyy-MM-dd')
  const todayStr = () => formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd')

  const isBlocked = (date: Date) => blockedDates.includes(auStr(date))
  const isPast = (date: Date) => auStr(date) < todayStr()
  const isAvailable = (date: Date) => !isPast(date) && !isBlocked(date)
  const isToday = (date: Date) => auStr(date) === todayStr()
  const isCheckIn = (date: Date) => !!checkIn && auStr(date) === auStr(checkIn)
  const isCheckOut = (date: Date) => !!checkOut && auStr(date) === auStr(checkOut)
  const isInRange = (date: Date) => {
    if (!checkIn || !checkOut) return false
    const s = auStr(date)
    return s > auStr(checkIn) && s < auStr(checkOut)
  }

  // Check if a range from checkIn to candidate checkOut contains any blocked dates
  const rangeHasBlocked = (from: Date, to: Date): boolean => {
    const cur = new Date(from)
    cur.setDate(cur.getDate() + 1)
    while (auStr(cur) < auStr(to)) {
      if (isBlocked(cur)) return true
      cur.setDate(cur.getDate() + 1)
    }
    return false
  }

  const handleDayClick = (day: Date) => {
    if (!isAvailable(day)) return

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(day)
      setCheckOut(null)
      return
    }

    const dayS = auStr(day)
    const ciS = auStr(checkIn)

    if (dayS === ciS) return

    if (dayS < ciS) {
      // Clicked before existing check-in — start fresh
      setCheckIn(day)
      setCheckOut(null)
      return
    }

    // Clicked after check-in — set as check-out if range is clean
    if (rangeHasBlocked(checkIn, day)) {
      // Blocked dates in range — reset to new check-in
      setCheckIn(day)
      setCheckOut(null)
    } else {
      setCheckOut(day)
    }
  }

  const clearDates = () => {
    setCheckIn(null)
    setCheckOut(null)
  }

  // Pricing summary
  const summary = checkIn && checkOut ? getPriceSummary(auStr(checkIn), auStr(checkOut)) : null
  const grouped = summary ? groupNightsByTier(summary.nights) : []

  const selectionPrompt = !checkIn
    ? 'Select check-in date'
    : !checkOut
    ? 'Now select check-out date'
    : null

  return (
    <section id="calendar" className="section-padding bg-white scroll-mt-24 md:scroll-mt-28">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="heading-primary">Availability &amp; Pricing</h2>
          <p className="text-luxury text-gray-600">
            Select your dates to see pricing — all fees included, no surprises
          </p>
          {/* Direct booking savings badge */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-luxury-gold/10 border border-luxury-gold/30 rounded-sm">
            <span className="material-icons text-luxury-gold" style={{ fontSize: '16px' }}>savings</span>
            <span className="text-sm font-sans font-semibold text-luxury-dark tracking-wide">
              Book directly &amp; save 15%+ vs Airbnb / Booking.com
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">

            {/* Selection prompt */}
            <div className="flex items-center justify-between mb-6 min-h-[32px]">
              <div className="flex items-center gap-2">
                {selectionPrompt ? (
                  <>
                    <span className="material-icons text-luxury-gold" style={{ fontSize: '18px' }}>touch_app</span>
                    <span className="text-sm font-sans font-semibold text-luxury-dark tracking-wide">{selectionPrompt}</span>
                  </>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-gray-700 font-sans">
                    <span className="font-semibold text-luxury-dark">{checkIn && format(checkIn, 'd MMM yyyy')}</span>
                    <span className="text-luxury-gold">→</span>
                    <span className="font-semibold text-luxury-dark">{checkOut && format(checkOut, 'd MMM yyyy')}</span>
                    <span className="text-gray-500">({summary?.totalNights} nights)</span>
                  </div>
                )}
              </div>
              {(checkIn || checkOut) && (
                <button
                  onClick={clearDates}
                  className="text-xs font-sans font-semibold text-gray-500 hover:text-luxury-dark underline underline-offset-2 transition-colors"
                >
                  Clear dates
                </button>
              )}
            </div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-luxury-light rounded-lg transition-colors"
                aria-label="Previous month"
              >
                ←
              </button>
              <h3 className="text-2xl font-serif font-semibold text-luxury-dark">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-luxury-light rounded-lg transition-colors"
                aria-label="Next month"
              >
                →
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const blocked = isBlocked(day)
                const available = isAvailable(day)
                const past = isPast(day)
                const today = isToday(day)
                const ci = isCheckIn(day)
                const co = isCheckOut(day)
                const inRange = isInRange(day)
                const isCurrentMonth = day >= monthStart && day <= monthEnd

                let cellClass = 'aspect-square flex items-center justify-center text-sm font-medium transition-all select-none '

                if (!isCurrentMonth) cellClass += 'opacity-20 '

                if (ci || co) {
                  cellClass += 'bg-luxury-gold text-white rounded-lg cursor-pointer '
                } else if (inRange) {
                  cellClass += 'bg-luxury-gold/20 text-luxury-dark rounded-lg cursor-pointer '
                } else if (past) {
                  cellClass += 'bg-gray-100 text-gray-400 rounded-lg '
                } else if (blocked) {
                  cellClass += 'bg-red-50 text-red-400 rounded-lg line-through '
                } else if (available) {
                  cellClass += 'bg-green-50 text-green-800 rounded-lg cursor-pointer hover:bg-luxury-gold/30 hover:text-luxury-dark '
                } else {
                  cellClass += 'bg-gray-50 text-gray-400 rounded-lg '
                }

                if (today && !ci && !co) cellClass += 'ring-2 ring-luxury-gold '

                return (
                  <div
                    key={day.toString()}
                    className={cellClass}
                    onClick={() => handleDayClick(day)}
                    title={blocked ? 'Booked' : past ? 'Past' : available ? 'Available' : ''}
                  >
                    {format(day, 'd')}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-green-50 border border-green-300" />
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-luxury-gold" />
                <span className="text-gray-600">Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-luxury-gold/20 border border-luxury-gold/40" />
                <span className="text-gray-600">Your stay</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-red-50 border border-red-200" />
                <span className="text-gray-600">Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-gray-100" />
                <span className="text-gray-600">Past</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded ring-2 ring-luxury-gold bg-white" />
                <span className="text-gray-600">Today</span>
              </div>
            </div>

            {/* Pricing Panel — shown after both dates selected */}
            <AnimatePresence>
              {summary && (
                <motion.div
                  key="pricing-panel"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.35 }}
                  className="mt-6 border-t pt-6"
                >
                  <h4 className="font-serif text-xl font-semibold text-luxury-dark mb-4">
                    Price Breakdown
                  </h4>

                  {/* Per-tier rows */}
                  <div className="space-y-2 mb-4">
                    {grouped.map(({ tier, count, subtotal }) => (
                      <div key={tier} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">{count} × {TIER_LABELS[tier]}</span>
                          <span className="text-gray-400 text-xs">@ ${NIGHTLY_RATES[tier].toLocaleString()}/night</span>
                        </div>
                        <span className="font-semibold text-luxury-dark">${subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Divider + totals */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-semibold text-luxury-dark">
                        Total — direct booking
                      </span>
                      <span className="text-xl font-serif font-bold text-luxury-dark">
                        ${summary.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Platform estimate (Airbnb / Booking.com)</span>
                      <span className="line-through">${summary.platformEstimate.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold text-green-700">
                      <span>You save booking direct</span>
                      <span>≈ ${summary.savings.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      All fees included. Cleaning, linen &amp; taxes — no hidden charges.
                    </p>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Link
                      href={`/inquiry?checkIn=${checkIn ? auStr(checkIn) : ''}&checkOut=${checkOut ? auStr(checkOut) : ''}`}
                      className="btn-primary flex-1 inline-flex items-center gap-2 justify-center"
                    >
                      <span className="material-icons" style={{ fontSize: '14px' }}>calendar_today</span>
                      Book Directly &amp; Save
                    </Link>
                    <button
                      onClick={clearDates}
                      className="flex-1 inline-flex items-center gap-2 justify-center px-6 py-3.5 border border-gray-300 text-gray-600 text-xs font-sans font-semibold tracking-widest uppercase hover:border-gray-400 transition-colors"
                      style={{ borderRadius: '2px' }}
                    >
                      Clear &amp; Re-select
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom info note */}
            <div className="mt-6 p-4 bg-luxury-light rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span className="material-icons" style={{ fontSize: '16px' }}>calendar_today</span>
                <span>Calendar syncs with all booking platforms automatically.</span>
                {isLoading && (
                  <span className="material-icons animate-spin ml-1" style={{ fontSize: '14px' }}>autorenew</span>
                )}
              </div>
              {lastUpdated && !isLoading && (
                <p className="text-xs text-gray-500 text-center mt-1">
                  Last updated: {format(new Date(lastUpdated), 'MMM d, yyyy h:mm a')}
                </p>
              )}
              <p className="text-xs text-gray-600 text-center mt-3">
                Minimum stay starts at <span className="font-semibold">2 nights</span>. School &amp; public holidays typically require{' '}
                <span className="font-semibold">3–5 nights</span> minimum.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
