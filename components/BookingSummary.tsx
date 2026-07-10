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
    <div className="rounded-2xl border border-luxury-gold/30 bg-white/[0.97] p-6 shadow-xl backdrop-blur-sm dark:bg-[#1a1a1a]/[0.97]">
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

        {pricing.petFeeAud > 0 ? (
          <div className="flex items-start justify-between gap-4 text-base">
            <div>
              <p className="font-semibold text-luxury-dark dark:text-white">Pet cleaning fee</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Travelling with a pet</p>
            </div>
            <span className="font-semibold text-luxury-dark dark:text-white">
              ${pricing.petFeeAud.toLocaleString()}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4 dark:border-white/10">
        <div className="flex items-center justify-between text-lg font-bold text-luxury-dark dark:text-white">
          <span>Total paid direct</span>
          <span className="text-luxury-gold">${pricing.totalAud.toLocaleString()}</span>
        </div>
        {showLevy ? (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Victorian short-stay levy (7.5%)</span>
              <span>Included · ${pricing.shortStayLevyAud.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Payment processing</span>
              <span>Included</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
              No platform fees. All costs included in the price above.
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            All fees included. No hidden platform service fee.
          </p>
        )}
      </div>
    </div>
  )
}
