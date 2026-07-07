// Pricing tiers for the property
export type PricingTier = 'SUMMER_PEAK' | 'PUBLIC_HOLIDAY' | 'SCHOOL_HOLIDAY' | 'WEEKEND' | 'STANDARD' | 'WINTER_MIDWEEK'

export const NIGHTLY_RATES: Record<PricingTier, number> = {
  SUMMER_PEAK:    3200,
  PUBLIC_HOLIDAY: 2500,
  SCHOOL_HOLIDAY: 2500,
  WEEKEND:        2200,
  STANDARD:       1880,
  WINTER_MIDWEEK: 1500,
}

export const TIER_LABELS: Record<PricingTier, string> = {
  SUMMER_PEAK:    'Christmas / Summer Peak',
  PUBLIC_HOLIDAY: 'Public Holiday',
  SCHOOL_HOLIDAY: 'School Holiday',
  WEEKEND:        'Weekend',
  STANDARD:       'Standard',
  WINTER_MIDWEEK: 'Winter Midweek',
}

// Winter off-peak months (Jun–Aug) — the soft season on the Mornington Peninsula.
const WINTER_MONTHS = new Set([6, 7, 8])

// Victorian public holidays 2026–2028
const PUBLIC_HOLIDAYS = new Set([
  // 2026
  '2026-01-01', '2026-01-26', '2026-03-09', '2026-04-03', '2026-04-05',
  '2026-04-06', '2026-04-25', '2026-06-08', '2026-09-25', '2026-11-03',
  '2026-12-25', '2026-12-26', '2026-12-31',
  // 2027
  '2027-01-01', '2027-01-26', '2027-03-08', '2027-03-26', '2027-03-28',
  '2027-03-29', '2027-04-25', '2027-06-14', '2027-09-24', '2027-11-02',
  '2027-12-25', '2027-12-26', '2027-12-31',
  // 2028
  '2028-01-01', '2028-01-26', '2028-03-13', '2028-04-14', '2028-04-16',
  '2028-04-17', '2028-04-25', '2028-06-12', '2028-09-29', '2028-11-07',
  '2028-12-25', '2028-12-26', '2028-12-31',
])

// Summer / Christmas peak periods (mid-Dec to late Jan) — highest tier
const SUMMER_PEAK_PERIODS = [
  { from: '2026-12-19', to: '2027-01-26' },
  { from: '2027-12-18', to: '2028-01-26' },
  { from: '2028-12-22', to: '2029-01-26' },
]

// Victorian school holiday periods (term breaks, excluding summer which is SUMMER_PEAK)
const SCHOOL_HOLIDAY_PERIODS = [
  // 2026
  { from: '2026-04-03', to: '2026-04-19' },
  { from: '2026-06-27', to: '2026-07-12' },
  { from: '2026-09-19', to: '2026-10-04' },
  // 2027
  { from: '2027-03-26', to: '2027-04-11' },
  { from: '2027-06-26', to: '2027-07-11' },
  { from: '2027-09-18', to: '2027-10-03' },
  // 2028
  { from: '2028-04-01', to: '2028-04-17' },
  { from: '2028-07-01', to: '2028-07-16' },
  { from: '2028-09-23', to: '2028-10-08' },
]

function isInPeriod(dateStr: string, periods: { from: string; to: string }[]): boolean {
  return periods.some(p => dateStr >= p.from && dateStr <= p.to)
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Priority: SUMMER_PEAK > PUBLIC_HOLIDAY > SCHOOL_HOLIDAY > WEEKEND > WINTER_MIDWEEK > STANDARD
export function getTierForDate(dateStr: string): PricingTier {
  if (isInPeriod(dateStr, SUMMER_PEAK_PERIODS)) return 'SUMMER_PEAK'
  if (PUBLIC_HOLIDAYS.has(dateStr)) return 'PUBLIC_HOLIDAY'
  if (isInPeriod(dateStr, SCHOOL_HOLIDAY_PERIODS)) return 'SCHOOL_HOLIDAY'

  const [year, month, day] = dateStr.split('-').map(Number)
  const dow = new Date(year, month - 1, day).getDay() // 0=Sun, 6=Sat
  if (dow === 5 || dow === 6) return 'WEEKEND' // Friday night + Saturday night (you wake up on weekend)

  // Off-peak winter midweek (Sun–Thu nights in Jun–Aug): a discounted rate to
  // attract golf / corporate / off-peak groups into the soft season.
  if (WINTER_MONTHS.has(month)) return 'WINTER_MIDWEEK'

  return 'STANDARD'
}

export interface NightBreakdown {
  dateStr: string
  tier: PricingTier
  price: number
  isOverride: boolean
}

export interface PriceSummary {
  nights: NightBreakdown[]
  totalNights: number
  total: number
  platformEstimate: number // ~10% more than direct
  savings: number
}

// checkInStr and checkOutStr are YYYY-MM-DD (Australian timezone already applied by caller)
// Pricing covers each night from checkIn up to (not including) checkOut.
// overrides: per-date price overrides (take priority over tier). tierPrices: custom base rates.
export function getPriceSummary(
  checkInStr: string,
  checkOutStr: string,
  overrides: Record<string, number> = {},
  tierPrices: Record<PricingTier, number> = NIGHTLY_RATES
): PriceSummary {
  const nights: NightBreakdown[] = []

  const [iy, im, id] = checkInStr.split('-').map(Number)
  const [oy, om, od] = checkOutStr.split('-').map(Number)
  const current = new Date(iy, im - 1, id)
  const checkOutDate = new Date(oy, om - 1, od)

  while (current < checkOutDate) {
    const dateStr = formatDateStr(current)
    const tier = getTierForDate(dateStr)
    const isOverride = dateStr in overrides
    const price = isOverride ? overrides[dateStr]! : (tierPrices[tier] ?? NIGHTLY_RATES[tier])
    nights.push({ dateStr, tier, price, isOverride })
    current.setDate(current.getDate() + 1)
  }

  const total = nights.reduce((sum, n) => sum + n.price, 0)
  const platformEstimate = Math.round(total * 1.1)
  const savings = platformEstimate - total

  return { nights, totalNights: nights.length, total, platformEstimate, savings }
}

// Group nights by tier for a compact display
export function groupNightsByTier(nights: NightBreakdown[]): { tier: PricingTier; count: number; subtotal: number; hasOverride: boolean }[] {
  const map = new Map<PricingTier, { count: number; subtotal: number; hasOverride: boolean }>()
  for (const n of nights) {
    const existing = map.get(n.tier)
    if (existing) {
      existing.count++
      existing.subtotal += n.price
      if (n.isOverride) existing.hasOverride = true
    } else {
      map.set(n.tier, { count: 1, subtotal: n.price, hasOverride: n.isOverride })
    }
  }
  // Return in priority order
  const order: PricingTier[] = ['SUMMER_PEAK', 'PUBLIC_HOLIDAY', 'SCHOOL_HOLIDAY', 'WEEKEND', 'WINTER_MIDWEEK', 'STANDARD']
  return order.filter(t => map.has(t)).map(t => ({ tier: t, ...map.get(t)! }))
}
