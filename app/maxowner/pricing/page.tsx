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

interface MinNightsOverride {
  date: string
  minNights: number
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

const TIER_DOT_COLOR: Record<PricingTier, string> = {
  SUMMER_PEAK:    'bg-orange-400',
  PUBLIC_HOLIDAY: 'bg-purple-400',
  SCHOOL_HOLIDAY: 'bg-sky-400',
  WEEKEND:        'bg-amber-400',
  STANDARD:       'bg-gray-500',
}

export default function PricingPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [overrides, setOverrides] = useState<Override[]>([])
  const [tiers, setTiers] = useState<TierRow[]>([])
  const [manualBlocks, setManualBlocks] = useState<ManualBlock[]>([])
  const [minNightsOverrides, setMinNightsOverrides] = useState<MinNightsOverride[]>([])
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

  const [modal, setModal] = useState<{
    dates: string[]
    price: string
    note: string
    minNights: string
    blockDates: boolean
    blockReason: string
  } | null>(null)
  const [tierModal, setTierModal] = useState<{ tier: PricingTier; price: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const safeJson = async (res: Response) => {
        if (!res.ok) return null
        const ct = res.headers.get('content-type') ?? ''
        if (!ct.includes('json')) return null
        return res.json().catch(() => null)
      }

      const [ovRes, tierRes, mbRes, calRes, mnRes] = await Promise.all([
        fetch('/api/maxowner/pricing-overrides'),
        fetch('/api/maxowner/pricing-tiers'),
        fetch('/api/maxowner/manual-blocks'),
        fetch('/api/calendar').catch(() => null),
        fetch('/api/maxowner/min-nights'),
      ])

      const [ovJson, tierJson, mbJson, calJson, mnJson] = await Promise.all([
        safeJson(ovRes),
        safeJson(tierRes),
        safeJson(mbRes),
        calRes ? safeJson(calRes) : null,
        safeJson(mnRes),
      ])

      if (ovJson) setOverrides(ovJson)
      if (tierJson) setTiers(tierJson)
      const manualBlocksData: ManualBlock[] = mbJson ?? []
      setManualBlocks(manualBlocksData)
      if (mnJson) setMinNightsOverrides(mnJson)

      const manualSet = new Set(manualBlocksData.map((b) => b.date))
      const list: string[] = Array.isArray(calJson?.blockedDates) ? calJson.blockedDates : defaultBlockedDates
      setOtaBlocked(new Set(list.filter((d: string) => !manualSet.has(d))))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const manualBlockMap = Object.fromEntries(manualBlocks.map((b) => [b.date, b.reason]))
  const overrideMap = Object.fromEntries(overrides.map((o) => [o.date, o]))
  const minNightsMap = Object.fromEntries(minNightsOverrides.map((m) => [m.date, m.minNights]))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

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
      const firstMinNights = minNightsMap[first]
      const uniformMinNights = sorted.every((d) => minNightsMap[d] === firstMinNights)
      const allManualBlocked = sorted.every((d) => manualBlockMap[d] !== undefined)
      setModal({
        dates: sorted,
        price: String(price),
        note,
        minNights: uniformMinNights && firstMinNights ? String(firstMinNights) : '',
        blockDates: allManualBlocked,
        blockReason: allManualBlocked ? (manualBlockMap[first] ?? '') : '',
      })
    },
    [tiers, overrideMap, manualBlockMap, minNightsMap]
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

  const handleDayPointerDown = (day: Date, e: React.PointerEvent<Element>) => {
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

  const handleDayPointerUp = (e: React.PointerEvent<Element>) => {
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

      const mn = modal.minNights ? Number(modal.minNights) : null
      if (mn && mn >= 1) {
        await Promise.all(
          dates.map((date) =>
            fetch('/api/maxowner/min-nights', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date, minNights: mn }),
            })
          )
        )
      } else if (modal.minNights === '') {
        await Promise.all(
          dates.map((date) =>
            fetch('/api/maxowner/min-nights', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date }),
            })
          )
        )
      }

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

  // Render a single month calendar grid (used twice for two-month view)
  const renderCalendarGrid = (monthRef: Date) => {
    const mStart = startOfMonth(monthRef)
    const mEnd = endOfMonth(monthRef)
    const calStart = startOfWeek(mStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(mEnd, { weekStartsOn: 1 })
    const gridDays = eachDayOfInterval({ start: calStart, end: calEnd })

    return (
      <div className="border border-white/10 rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.03]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-xs font-semibold tracking-wide text-gray-500 py-3">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 touch-none select-none">
          {gridDays.map((day) => {
            const dateStr = auStr(day)
            const inMonth = day >= mStart && day <= mEnd
            const isPast = dateStr < todayStr
            const isToday = dateStr === todayStr
            const override = overrideMap[dateStr]
            const tier = getTierForDate(dateStr)
            const tierRow = tiers.find((t) => t.tier === tier)
            const basePrice = tierRow?.price ?? NIGHTLY_RATES[tier]
            const displayPrice = override ? override.price : basePrice
            const manualHere = manualBlockMap[dateStr] !== undefined
            const otaHere = otaBlocked.has(dateStr) && !manualHere
            const isSelected = selectedSet.has(dateStr)
            const isPreview = previewSet?.has(dateStr) ?? false
            const colIndex = (day.getDay() + 6) % 7

            // Cell wrapper background + selection state
            let wrapperCls = 'relative h-32 border-b border-r border-white/[0.07] transition-colors group '
            if (!inMonth) {
              wrapperCls += 'opacity-20 pointer-events-none bg-transparent '
            } else if (isPast) {
              wrapperCls += 'opacity-35 cursor-not-allowed bg-white/[0.015] '
            } else if (otaHere) {
              // Booked via OTA — solid red fill
              wrapperCls += 'bg-red-500/30 border-red-500/20 cursor-not-allowed '
            } else if (isPreview) {
              wrapperCls += 'bg-sky-500/25 ring-2 ring-inset ring-sky-400/70 cursor-pointer '
            } else if (isSelected) {
              wrapperCls += 'bg-sky-500/30 ring-2 ring-inset ring-sky-400 cursor-pointer '
            } else if (manualHere) {
              // Owner-blocked — amber/orange fill to distinguish from OTA red
              wrapperCls += 'bg-amber-500/20 border-amber-500/20 cursor-pointer hover:bg-amber-500/25 '
            } else {
              // Open / available — green fill
              wrapperCls += 'bg-emerald-500/15 hover:bg-emerald-500/22 cursor-pointer '
              if (override) wrapperCls += 'ring-1 ring-inset ring-luxury-gold/60 '
            }

            const tooltipX = colIndex >= 5 ? 'right-0' : colIndex <= 1 ? 'left-0' : 'left-1/2 -translate-x-1/2'

            return (
              <div
                key={dateStr}
                className={wrapperCls}
                onPointerDown={(e) => { if (!isPast && inMonth && !otaHere) handleDayPointerDown(day, e) }}
                onPointerEnter={() => handleDayPointerEnter(day)}
                onPointerUp={(e) => handleDayPointerUp(e)}
              >
                {/* Date number — top left */}
                <span className={`absolute top-2.5 left-3 text-sm font-semibold leading-none
                  ${isToday ? 'text-luxury-gold font-bold' : !inMonth || isPast ? 'text-gray-600' : 'text-gray-200'}`}>
                  {format(day, 'd')}
                  {isToday && <span className="ml-1 text-[10px] font-normal text-luxury-gold/70">Today</span>}
                </span>

                {/* Tier dot — top right */}
                {inMonth && !isPast && (
                  <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${TIER_DOT_COLOR[tier]}`} title={TIER_LABELS[tier]} />
                )}

                {/* Status pill — middle of cell */}
                {inMonth && !isPast && otaHere && (
                  <div className="absolute inset-x-2 top-9 bg-red-600/40 rounded-md px-2.5 py-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-300 flex-shrink-0" />
                    <span className="text-xs text-red-200 font-semibold truncate">Booked</span>
                  </div>
                )}
                {inMonth && !isPast && manualHere && (
                  <div className="absolute inset-x-2 top-9 bg-amber-600/30 border border-amber-400/30 rounded-md px-2.5 py-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 flex-shrink-0" />
                    <span className="text-xs text-amber-200 font-semibold truncate">
                      {manualBlockMap[dateStr] || 'Blocked'}
                    </span>
                  </div>
                )}
                {inMonth && !isPast && override && !otaHere && !manualHere && (
                  <div className="absolute inset-x-2 top-9 bg-luxury-gold/15 rounded-md px-2.5 py-1.5">
                    <span className="text-xs text-luxury-gold font-medium">Custom price</span>
                  </div>
                )}

                {/* Price — bottom right */}
                {inMonth && !isPast && (
                  <span className={`absolute bottom-2.5 right-3 text-sm font-semibold
                    ${override ? 'text-luxury-gold' : otaHere ? 'text-gray-500' : 'text-gray-300'}`}>
                    ${(displayPrice / 1000).toFixed(1)}k
                  </span>
                )}

                {/* Min nights — bottom left */}
                {inMonth && !isPast && minNightsMap[dateStr] && (
                  <span className="absolute bottom-2.5 left-3 text-[10px] text-sky-400/80 font-medium">
                    {minNightsMap[dateStr]}n min
                  </span>
                )}

                {/* Hover tooltip */}
                {inMonth && !isPast && (
                  <div className={`absolute bottom-full ${tooltipX} mb-2 z-50 w-52 bg-[#0f0f0d] border border-white/20 rounded-lg p-3 text-xs hidden group-hover:block shadow-xl pointer-events-none`}>
                    <div className="font-semibold text-gray-100 mb-1.5">{dateStr}</div>
                    <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${TIER_DOT_COLOR[tier]}`} />
                      {TIER_LABELS[tier]}
                    </div>
                    <div className="text-gray-400">Base: ${basePrice.toLocaleString()}/night</div>
                    {override && <div className="text-luxury-gold mt-0.5">Override: ${override.price.toLocaleString()}/night</div>}
                    {minNightsMap[dateStr] && <div className="text-sky-400 mt-0.5">Min stay: {minNightsMap[dateStr]} nights</div>}
                    {manualHere && <div className="text-orange-400 mt-0.5">Blocked: {manualBlockMap[dateStr] || 'Manual block'}</div>}
                    {otaHere && <div className="text-red-400 mt-0.5">Booked via OTA</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-serif text-luxury-gold mb-1">Pricing</h1>
      <p className="text-gray-400 text-sm mb-8 max-w-xl">
        Drag across nights or click individual dates to build a selection (like Airbnb). Then use{' '}
        <span className="text-gray-300">Edit selected</span> to set price, min nights, and calendar blocks.
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

        {renderCalendarGrid(currentMonth)}

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 border border-emerald-400/30 inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-red-500/40 border border-red-400/30 inline-block" />
            Booked (OTA)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500/30 border border-amber-400/30 inline-block" />
            Manual block
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-sky-500/35 ring-2 ring-inset ring-sky-400 inline-block" />
            Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 ring-1 ring-inset ring-luxury-gold/60 inline-block" />
            Custom price
          </span>
          <span className="text-gray-600">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
            Peak
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
            Public hol
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
            School hol
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Weekend
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" />
            Standard
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
                  {minNightsMap[o.date] && (
                    <span className="text-sky-400/80 ml-2 text-xs">{minNightsMap[o.date]}n min</span>
                  )}
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
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-sm ${TIER_DOT_COLOR[row.tier]}`} />
                  <span className="text-gray-300 text-sm">{row.label}</span>
                  {row.isCustom && (
                    <span className="text-xs text-luxury-gold bg-luxury-gold/10 px-1.5 py-0.5 rounded">custom</span>
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
                <label className="block text-xs text-gray-400 mb-1">Minimum nights (blank = no override)</label>
                <input
                  type="number"
                  value={modal.minNights}
                  onChange={(e) => setModal({ ...modal, minNights: e.target.value })}
                  placeholder="e.g. 3"
                  min="1"
                  max="30"
                  step="1"
                  className="w-full px-3 py-2.5 bg-[#0f0f0d] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold transition-colors"
                />
                <p className="text-gray-600 text-xs mt-1">Guests selecting fewer nights see these dates as unavailable.</p>
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
