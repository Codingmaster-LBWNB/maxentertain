'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { format, startOfMonth, endOfMonth, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { getTierForDate, TIER_LABELS, NIGHTLY_RATES, PricingTier } from '@/lib/pricing'
import { blockedDates as defaultBlockedDates } from '@/config/property'

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

interface ManualBlock {
  date: string
  reason: string
}

function auStr(date: Date) {
  return formatInTimeZone(date, TZ, 'yyyy-MM-dd')
}

function dateRangeInclusive(a: Date, b: Date): string[] {
  const start = a <= b ? a : b
  const end = a <= b ? b : a
  return eachDayOfInterval({ start, end }).map((d) => auStr(d))
}

function mergeUniqueSorted(dates: string[]): string[] {
  return [...new Set(dates)].sort()
}

export default function PricingPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [overrides, setOverrides] = useState<Override[]>([])
  const [tiers, setTiers] = useState<TierRow[]>([])
  const [manualBlocks, setManualBlocks] = useState<ManualBlock[]>([])
  const [otaBlocked, setOtaBlocked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [dragPreview, setDragPreview] = useState<string[] | null>(null)
  const dragRef = useRef<{ start: Date | null; startStr: string | null; last: Date | null; ptrId: number | null; crossedCell: boolean }>({
    start: null,
    startStr: null,
    last: null,
    ptrId: null,
    crossedCell: false,
  })

  // Modal state — applies to all dates in `modal.dates`
  const [modal, setModal] = useState<{
    dates: string[]
    price: string
    note: string
    blockDates: boolean
    blockReason: string
  } | null>(null)
  const [tierModal, setTierModal] = useState<{ tier: PricingTier; price: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [ovRes, tierRes, mbRes, calRes] = await Promise.all([
      fetch('/api/maxowner/pricing-overrides'),
      fetch('/api/maxowner/pricing-tiers'),
      fetch('/api/maxowner/manual-blocks'),
      fetch('/api/calendar').catch(() => null),
    ])
    setOverrides(await ovRes.json())
    setTiers(await tierRes.json())
    const mbJson: ManualBlock[] = await mbRes.json()
    setManualBlocks(mbJson)
    const manualSet = new Set(mbJson.map((b) => b.date))

    if (calRes?.ok) {
      const data = await calRes.json()
      const list = Array.isArray(data.blockedDates) ? data.blockedDates : []
      setOtaBlocked(new Set(list.filter((d: string) => !manualSet.has(d))))
    } else {
      // Mirror frontend behavior: if live calendar is unavailable, keep UI usable
      // with config fallback dates so owner and guest views stay aligned.
      setOtaBlocked(new Set(defaultBlockedDates.filter((d) => !manualSet.has(d))))
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const manualBlockMap = Object.fromEntries(manualBlocks.map((b) => [b.date, b.reason]))
  const overrideMap = Object.fromEntries(overrides.map((o) => [o.date, o]))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const todayStr = formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd')

  const selectedSet = new Set(selectedDates)
  const previewSet = dragPreview ? new Set(dragPreview) : null

  const openModalForDates = useCallback(
    (dates: string[]) => {
      const sorted = [...dates].sort()
      if (sorted.length === 0) return
      const first = sorted[0]!
      const tier = getTierForDate(first)
      const tierRow = tiers.find((t) => t.tier === tier)
      const defaultPrice = tierRow?.price ?? NIGHTLY_RATES[tier]
      let price = overrideMap[first]?.price ?? defaultPrice
      let note = overrideMap[first]?.note ?? ''
      const refOv = overrideMap[first]
      const uniformOverrides =
        refOv &&
        sorted.every((d) => {
          const o = overrideMap[d]
          return o && o.price === refOv.price && (o.note ?? '') === (refOv.note ?? '')
        })
      if (uniformOverrides && refOv) {
        price = refOv.price
        note = refOv.note ?? ''
      }
      const allManualBlocked = sorted.every((d) => manualBlockMap[d] !== undefined)
      setModal({
        dates: sorted,
        price: String(price),
        note,
        blockDates: allManualBlocked,
        blockReason: allManualBlocked ? (manualBlockMap[first] ?? '') : '',
      })
    },
    [tiers, overrideMap, manualBlockMap]
  )

  const endPointerDrag = useCallback(() => {
    const { start, last, crossedCell, startStr } = dragRef.current
    dragRef.current = { start: null, startStr: null, last: null, ptrId: null, crossedCell: false }
    setDragPreview(null)
    if (!start || !startStr || !last) return

    if (crossedCell) {
      const range = dateRangeInclusive(start, last).filter((d) => d >= todayStr)
      setSelectedDates((prev) => mergeUniqueSorted([...prev, ...range]))
    } else {
      setSelectedDates((prev) => {
        const next = new Set(prev)
        if (next.has(startStr)) next.delete(startStr)
        else next.add(startStr)
        return [...next].sort()
      })
    }
  }, [todayStr])

  useEffect(() => {
    const stop = () => {
      if (dragRef.current.start) endPointerDrag()
    }
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [endPointerDrag])

  const handleDayPointerDown = (day: Date, e: React.PointerEvent) => {
    const dateStr = auStr(day)
    const inMonth = day >= monthStart && day <= monthEnd
    const isPast = dateStr < todayStr
    const isOtaBooked = otaBlocked.has(dateStr)
    if (isPast || !inMonth || isOtaBooked) return
    e.preventDefault()
    dragRef.current = {
      start: day,
      startStr: dateStr,
      last: day,
      ptrId: e.pointerId,
      crossedCell: false,
    }
    try {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  const handleDayPointerEnter = (day: Date) => {
    const { start, last } = dragRef.current
    if (!start) return
    const dateStr = auStr(day)
    const inMonth = day >= monthStart && day <= monthEnd
    const isPast = dateStr < todayStr
    const isOtaBooked = otaBlocked.has(dateStr)
    if (isPast || !inMonth || isOtaBooked) return

    if (last && auStr(last) !== dateStr) dragRef.current.crossedCell = true
    dragRef.current.last = day

    const preview = dateRangeInclusive(start, day).filter((d) => d >= todayStr)
    setDragPreview(preview)
  }

  const handleDayPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current.ptrId !== e.pointerId) return
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    endPointerDrag()
  }

  const saveModal = async () => {
    if (!modal) return
    const dates = modal.dates
    const priceNum = Number(modal.price)
    if (!Number.isFinite(priceNum) || priceNum < 0) return

    setSaving(true)
    try {
      await Promise.all(
        dates.map((date) =>
          fetch('/api/maxowner/pricing-overrides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, price: priceNum, note: modal.note }),
          })
        )
      )

      if (modal.blockDates) {
        await Promise.all(
          dates.map((date) =>
            fetch('/api/maxowner/manual-blocks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date, reason: modal.blockReason }),
            })
          )
        )
      }

      setModal(null)
      setSelectedDates([])
      await load()
    } finally {
      setSaving(false)
    }
  }

  const removeOverridesForModalDates = async () => {
    if (!modal) return
    setSaving(true)
    try {
      await Promise.all(
        modal.dates.map((date) =>
          fetch('/api/maxowner/pricing-overrides', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date }),
          })
        )
      )
      await load()
      setModal(null)
      setSelectedDates([])
    } finally {
      setSaving(false)
    }
  }

  const removeManualBlocksForModalDates = async () => {
    if (!modal) return
    setSaving(true)
    try {
      await Promise.all(
        modal.dates.map((date) =>
          fetch('/api/maxowner/manual-blocks', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date }),
          })
        )
      )
      await load()
      const stillHasDates = modal.dates.length > 0
      if (stillHasDates) {
        setModal((m) =>
          m ? { ...m, blockDates: false, blockReason: '' } : null
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const deleteOverride = async (date: string) => {
    await fetch('/api/maxowner/pricing-overrides', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    })
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

  const anyModalOverrides = modal ? modal.dates.some((d) => overrideMap[d]) : false
  const anyModalManualBlocks = modal ? modal.dates.some((d) => manualBlockMap[d] !== undefined) : false

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-serif text-luxury-gold mb-1">Pricing</h1>
      <p className="text-gray-400 text-sm mb-8 max-w-xl">
        Drag across nights or click individual dates to build a selection (like Airbnb). Then use{' '}
        <span className="text-gray-300">Edit selected</span> to set price, notes, and manual calendar blocks in one place.
      </p>

      {/* Calendar */}
      <div className="bg-[#1a1a18] rounded-xl border border-white/10 p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="text-gray-400 hover:text-white px-2"
              aria-label="Previous month"
            >
              ←
            </button>
            <span className="font-serif text-lg">{format(currentMonth, 'MMMM yyyy')}</span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="text-gray-400 hover:text-white px-2"
              aria-label="Next month"
            >
              →
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={selectedDates.length === 0}
              onClick={() => openModalForDates(selectedDates)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-luxury-gold text-white disabled:opacity-35 disabled:cursor-not-allowed hover:bg-luxury-gold/90 transition-colors"
            >
              Edit {selectedDates.length || '…'} selected
            </button>
            <button
              type="button"
              disabled={selectedDates.length === 0}
              onClick={() => setSelectedDates([])}
              className="px-4 py-2 text-sm rounded-lg border border-white/15 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-35 transition-colors"
            >
              Clear selection
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1 select-none">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 touch-none select-none">
          {days.map((day) => {
            const dateStr = auStr(day)
            const inMonth = day >= monthStart && day <= monthEnd
            const isPast = dateStr < todayStr
            const override = overrideMap[dateStr]
            const tier = getTierForDate(dateStr)
            const tierRow = tiers.find((t) => t.tier === tier)
            const basePrice = tierRow?.price ?? NIGHTLY_RATES[tier]
            const displayPrice = override ? override.price : basePrice
            const manualHere = manualBlockMap[dateStr] !== undefined
            const otaHere = otaBlocked.has(dateStr) && !manualHere
            const isSelected = selectedSet.has(dateStr)
            const isPreview = previewSet?.has(dateStr) ?? false

            let cls =
              'aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-colors border '
            if (!inMonth) cls += 'opacity-[0.12] pointer-events-none border-transparent '
            else if (isPast) cls += 'opacity-30 cursor-not-allowed border-transparent bg-white/[0.02] '
            else if (otaHere) cls += 'bg-red-500/10 text-red-300 border-red-400/30 line-through cursor-not-allowed '
            else {
              cls += 'cursor-pointer hover:bg-white/10 '
              if (override) cls += 'bg-luxury-gold/15 border-luxury-gold/35 '
              else cls += 'bg-white/5 border-white/10 '
              if (manualHere) cls += 'shadow-[inset_0_0_0_2px_rgba(248,113,113,0.45)] '
              if (isPreview) cls += 'bg-sky-500/25 border-sky-400/70 ring-2 ring-sky-400/50 '
              else if (isSelected) cls += 'ring-2 ring-sky-400 border-sky-400/50 '
            }

            return (
              <button
                key={dateStr}
                type="button"
                disabled={isPast || !inMonth || otaHere}
                onPointerDown={(e) => handleDayPointerDown(day, e)}
                onPointerEnter={() => handleDayPointerEnter(day)}
                onPointerUp={handleDayPointerUp}
                className={cls}
                title={otaHere ? 'Booked via OTA calendar' : manualHere ? 'Manual block' : ''}
              >
                <span className={`font-medium ${override ? 'text-luxury-gold' : 'text-gray-300'}`}>
                  {format(day, 'd')}
                </span>
                {inMonth && !isPast && (
                  <span className={`text-[10px] mt-0.5 ${override ? 'text-luxury-gold' : 'text-gray-500'}`}>
                    ${(displayPrice / 1000).toFixed(1)}k
                  </span>
                )}
                {inMonth && manualHere && !isPast && (
                  <span className="text-[9px] text-red-400/90 mt-0.5 leading-none">blocked</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded ring-2 ring-sky-400 border border-sky-400/40 bg-white/5 inline-block" />
            Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-luxury-gold/15 border border-luxury-gold/40 inline-block" />
            Custom price
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white/5 border border-white/10 inline-block" />
            Tier price
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white/5 border border-red-400/50 shadow-[inset_0_0_0_2px_rgba(248,113,113,0.45)] inline-block" />
            Manual block
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500/10 border border-red-400/30 inline-block" />
            Booked (OTA)
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

      {/* Date override + manual block modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a18] border border-white/15 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-lg mb-1">
              {modal.dates.length === 1
                ? modal.dates[0]
                : `${modal.dates[0]} → ${modal.dates[modal.dates.length - 1]}`}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {modal.dates.length} night{modal.dates.length !== 1 ? 's' : ''} ·{' '}
              {[...new Set(modal.dates.map((d) => getTierForDate(d)))].length === 1
                ? TIER_LABELS[getTierForDate(modal.dates[0]!)]
                : 'Mixed pricing tiers'}
            </p>

            <p className="text-xs text-gray-600 mb-5 max-h-24 overflow-y-auto font-mono leading-relaxed">
              {modal.dates.join(', ')}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Price per night (AUD) — all selected</label>
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

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={modal.blockDates}
                  onChange={(e) => setModal({ ...modal, blockDates: e.target.checked })}
                  className="mt-1 rounded border-white/20 bg-[#0f0f0d] text-luxury-gold focus:ring-luxury-gold/40"
                />
                <span>
                  <span className="text-sm text-gray-200 group-hover:text-white transition-colors">
                    Block these dates on the guest calendar
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Adds manual blocks (on top of iCal). Guests see these nights as unavailable.
                  </span>
                </span>
              </label>

              {modal.blockDates && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Block reason (optional)</label>
                  <input
                    type="text"
                    value={modal.blockReason}
                    onChange={(e) => setModal({ ...modal, blockReason: e.target.value })}
                    placeholder="e.g. Owner stay, maintenance"
                    className="w-full px-3 py-2.5 bg-[#0f0f0d] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold transition-colors"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <div className="flex flex-wrap gap-2">
                {anyModalOverrides && (
                  <button
                    type="button"
                    onClick={() => removeOverridesForModalDates()}
                    disabled={saving}
                    className="px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg transition-colors disabled:opacity-40"
                  >
                    Remove price overrides
                  </button>
                )}
                {anyModalManualBlocks && (
                  <button
                    type="button"
                    onClick={() => removeManualBlocksForModalDates()}
                    disabled={saving}
                    className="px-4 py-2 text-sm text-amber-400/90 hover:text-amber-300 border border-amber-400/30 rounded-lg transition-colors disabled:opacity-40"
                  >
                    Clear manual blocks
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveModal()}
                  disabled={saving || !modal.price}
                  className="flex-1 px-4 py-2 text-sm bg-luxury-gold text-white rounded-lg disabled:opacity-40 hover:bg-luxury-gold/90 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
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
