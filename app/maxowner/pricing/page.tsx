'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, startOfMonth, endOfMonth, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { getTierForDate, TIER_LABELS, NIGHTLY_RATES, PricingTier } from '@/lib/pricing'

const TZ = 'Australia/Melbourne'

interface Override {
  date: string
  price: number
  note: string
}

interface TierRow {
  tier: PricingTier
  label: string
  price: number
  isCustom: boolean
  default: number
}

function auStr(date: Date) {
  return formatInTimeZone(date, TZ, 'yyyy-MM-dd')
}

export default function PricingPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [overrides, setOverrides] = useState<Override[]>([])
  const [tiers, setTiers] = useState<TierRow[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modal, setModal] = useState<{ date: string; price: string; note: string } | null>(null)
  const [tierModal, setTierModal] = useState<{ tier: PricingTier; price: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [ovRes, tierRes] = await Promise.all([
      fetch('/api/maxowner/pricing-overrides'),
      fetch('/api/maxowner/pricing-tiers'),
    ])
    setOverrides(await ovRes.json())
    setTiers(await tierRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const overrideMap = Object.fromEntries(overrides.map((o) => [o.date, o]))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const todayStr = formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd')

  const handleDayClick = (day: Date) => {
    const dateStr = auStr(day)
    const existing = overrideMap[dateStr]
    const tier = getTierForDate(dateStr)
    const tierRow = tiers.find((t) => t.tier === tier)
    const defaultPrice = tierRow?.price ?? NIGHTLY_RATES[tier]
    setModal({
      date: dateStr,
      price: existing ? String(existing.price) : String(defaultPrice),
      note: existing?.note ?? '',
    })
  }

  const saveOverride = async () => {
    if (!modal) return
    setSaving(true)
    await fetch('/api/maxowner/pricing-overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: modal.date, price: Number(modal.price), note: modal.note }),
    })
    setSaving(false)
    setModal(null)
    load()
  }

  const deleteOverride = async (date: string) => {
    await fetch('/api/maxowner/pricing-overrides', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    })
    setModal(null)
    load()
  }

  const saveTier = async () => {
    if (!tierModal) return
    setSaving(true)
    await fetch('/api/maxowner/pricing-tiers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: tierModal.tier, price: Number(tierModal.price) }),
    })
    setSaving(false)
    setTierModal(null)
    load()
  }

  const resetTier = async (tier: PricingTier) => {
    await fetch('/api/maxowner/pricing-tiers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    })
    load()
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-serif text-luxury-gold mb-1">Pricing</h1>
      <p className="text-gray-400 text-sm mb-8">Click any date to set a custom price. Edit base tier rates below.</p>

      {/* Calendar */}
      <div className="bg-[#1a1a18] rounded-xl border border-white/10 p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-gray-400 hover:text-white px-2">←</button>
          <span className="font-serif text-lg">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-gray-400 hover:text-white px-2">→</button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateStr = auStr(day)
            const inMonth = day >= monthStart && day <= monthEnd
            const isPast = dateStr < todayStr
            const override = overrideMap[dateStr]
            const tier = getTierForDate(dateStr)
            const tierRow = tiers.find((t) => t.tier === tier)
            const basePrice = tierRow?.price ?? NIGHTLY_RATES[tier]
            const displayPrice = override ? override.price : basePrice

            return (
              <button
                key={dateStr}
                onClick={() => !isPast && inMonth && handleDayClick(day)}
                disabled={isPast || !inMonth}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all
                  ${!inMonth ? 'opacity-15' : ''}
                  ${isPast ? 'opacity-30 cursor-default' : 'hover:bg-white/10 cursor-pointer'}
                  ${override ? 'bg-luxury-gold/15 border border-luxury-gold/40' : 'bg-white/5'}
                `}
              >
                <span className={`font-medium ${override ? 'text-luxury-gold' : 'text-gray-300'}`}>
                  {format(day, 'd')}
                </span>
                {inMonth && !isPast && (
                  <span className={`text-[10px] mt-0.5 ${override ? 'text-luxury-gold' : 'text-gray-500'}`}>
                    ${(displayPrice / 1000).toFixed(1)}k
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-luxury-gold/15 border border-luxury-gold/40 inline-block" />
            Custom price
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-white/5 inline-block" />
            Tier price
          </span>
        </div>
      </div>

      {/* Active overrides list */}
      {overrides.length > 0 && (
        <div className="bg-[#1a1a18] rounded-xl border border-white/10 p-6 mb-8">
          <h2 className="text-base font-semibold mb-4 text-gray-200">Active date overrides</h2>
          <div className="space-y-2">
            {overrides.map((o) => (
              <div key={o.date} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-luxury-gold font-medium">{o.date}</span>
                  <span className="text-gray-400 ml-3">${o.price.toLocaleString()}/night</span>
                  {o.note && <span className="text-gray-500 ml-2 text-xs">— {o.note}</span>}
                </div>
                <button
                  onClick={() => deleteOverride(o.date)}
                  className="text-gray-600 hover:text-red-400 text-xs px-2 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tier rates */}
      <div className="bg-[#1a1a18] rounded-xl border border-white/10 p-6">
        <h2 className="text-base font-semibold mb-4 text-gray-200">Base tier rates</h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : (
          <div className="space-y-3">
            {tiers.map((row) => (
              <div key={row.tier} className="flex items-center justify-between">
                <div>
                  <span className="text-gray-300 text-sm">{row.label}</span>
                  {row.isCustom && (
                    <span className="ml-2 text-xs text-luxury-gold bg-luxury-gold/10 px-1.5 py-0.5 rounded">custom</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-mono text-sm ${row.isCustom ? 'text-luxury-gold' : 'text-gray-400'}`}>
                    ${row.price.toLocaleString()}/night
                  </span>
                  <button
                    onClick={() => setTierModal({ tier: row.tier, price: String(row.price) })}
                    className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
                  >
                    Edit
                  </button>
                  {row.isCustom && (
                    <button
                      onClick={() => resetTier(row.tier)}
                      className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date override modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a18] border border-white/15 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-lg mb-1">{modal.date}</h3>
            <p className="text-gray-500 text-sm mb-5">{TIER_LABELS[getTierForDate(modal.date)]} tier</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Price per night (AUD)</label>
                <input
                  type="number"
                  value={modal.price}
                  onChange={(e) => setModal({ ...modal, price: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0f0f0d] border border-white/10 rounded-lg text-white focus:outline-none focus:border-luxury-gold transition-colors"
                  min="0"
                  step="50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Note (optional)</label>
                <input
                  type="text"
                  value={modal.note}
                  onChange={(e) => setModal({ ...modal, note: e.target.value })}
                  placeholder="e.g. Event weekend"
                  className="w-full px-3 py-2.5 bg-[#0f0f0d] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {overrideMap[modal.date] && (
                <button
                  onClick={() => deleteOverride(modal.date)}
                  className="px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg transition-colors"
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveOverride}
                disabled={saving || !modal.price}
                className="flex-1 px-4 py-2 text-sm bg-luxury-gold text-white rounded-lg disabled:opacity-40 hover:bg-luxury-gold/90 transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier edit modal */}
      {tierModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a18] border border-white/15 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-lg mb-4">{TIER_LABELS[tierModal.tier]}</h3>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Base price per night (AUD)</label>
              <input
                type="number"
                value={tierModal.price}
                onChange={(e) => setTierModal({ ...tierModal, price: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0f0f0d] border border-white/10 rounded-lg text-white focus:outline-none focus:border-luxury-gold transition-colors"
                min="0"
                step="50"
              />
              <p className="text-gray-500 text-xs mt-1">
                Default: ${NIGHTLY_RATES[tierModal.tier].toLocaleString()}. Applies to all dates in this tier unless overridden individually.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setTierModal(null)}
                className="flex-1 px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTier}
                disabled={saving || !tierModal.price}
                className="flex-1 px-4 py-2 text-sm bg-luxury-gold text-white rounded-lg disabled:opacity-40 hover:bg-luxury-gold/90 transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
