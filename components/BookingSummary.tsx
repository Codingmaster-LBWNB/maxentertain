import { groupNightsByTier, TIER_LABELS } from '@/lib/pricing'
import type { BookingPricing } from '@/types/booking'

export default function BookingSummary({
  pricing,
  checkIn,
  checkOut,
  showLevy = false,
}: {
  pricing: BookingPricing
  checkIn: string
  checkOut: string
  showLevy?: boolean
}) {
  const grouped = groupNightsByTier(pricing.nights)

  return (
    <div className="rounded-sm border border-luxury-gold/30 bg-white/95 dark:bg-[#1f1f1c]/95 p-6 shadow-xl">
      <h2 className="font-serif text-2xl font-bold text-luxury-dark dark:text-white">
        Booking Summary
      </h2>
      <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
        {checkIn} to {checkOut} · {pricing.nights.length} nights
      </p>

      <div className="mt-6 space-y-3">
        {grouped.map(({ tier, count, subtotal, hasOverride }) => (
          <div key={tier} className="flex items-start justify-between gap-4 text-base">
            <div>
              <p className="font-semibold text-luxury-dark dark:text-white">{TIER_LABELS[tier]}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {count} night{count === 1 ? '' : 's'}
                {hasOverride ? ' · custom rate' : ''}
              </p>
            </div>
            <span className="font-semibold text-luxury-dark dark:text-white">
              ${subtotal.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4 dark:border-white/10">
        <div className="flex items-center justify-between text-lg font-semibold text-luxury-dark dark:text-white">
          <span>Total paid direct</span>
          <span>${pricing.totalAud.toLocaleString()}</span>
        </div>
        {showLevy ? (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Includes tracked Victorian short-stay levy estimate: ${pricing.shortStayLevyAud.toLocaleString()}.
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            All fees included. No hidden platform service fee.
          </p>
        )}
      </div>
    </div>
  )
}
