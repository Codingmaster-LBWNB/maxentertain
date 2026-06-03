import { NextResponse, type NextRequest } from 'next/server'
import { propertyConfig } from '@/config/property'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ClientMessage = { role: 'user' | 'assistant'; content: string }

const MAX_MESSAGES = 20
const MIN_CHARS_PER_MESSAGE = 2
const MAX_CHARS_PER_MESSAGE = 2000
const MAX_TOTAL_CHARS = 12000
const MAX_BODY_BYTES = 50_000
const GEMINI_TIMEOUT_MS = 9000

type Bucket = { count: number; resetAtMs: number }
const RL_WINDOW_MS = 60_000
const RL_MAX = 20

function getRateLimitStore(): Map<string, Bucket> {
  const g = globalThis as unknown as { __guestChatRL?: Map<string, Bucket> }
  if (!g.__guestChatRL) g.__guestChatRL = new Map()
  return g.__guestChatRL
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown'
  return req.headers.get('x-real-ip') || 'unknown'
}

function checkOrigin(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL
  if (!siteUrl) return true
  const origin = req.headers.get('origin') || req.headers.get('referer') || ''
  try {
    return new URL(origin).origin === new URL(siteUrl).origin
  } catch {
    return false
  }
}

function sanitizeText(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

function rateLimitOrThrow(key: string) {
  const now = Date.now()
  const store = getRateLimitStore()
  const hit = store.get(key)

  if (!hit || hit.resetAtMs <= now) {
    store.set(key, { count: 1, resetAtMs: now + RL_WINDOW_MS })
    return
  }

  hit.count += 1
  store.set(key, hit)

  if (hit.count > RL_MAX) {
    const retryAfterSec = Math.max(1, Math.ceil((hit.resetAtMs - now) / 1000))
    const err = new Error('rate_limited')
    ;(err as any).status = 429
    ;(err as any).retryAfterSec = retryAfterSec
    throw err
  }
}

function compactPropertyContext(): string {
  const cfg = propertyConfig
  const amenities = cfg.amenities?.slice(0, 80).join(', ')
  const houseRules = cfg.policies?.houseRules
    ?.slice(0, 40)
    .map((r) => `- ${r}`)
    .join('\n')
  const photoSections = (cfg.photoSections ?? []).map((s) => {
    const desc = s.description ? ` — ${s.description}` : ''
    return `- ${s.title}${desc}`
  })
  const nearby = cfg.localArea?.attractions?.slice(0, 30).map((a) => {
    const drive =
      a.drive?.durationMin != null && a.drive?.distanceKm != null
        ? `${a.drive.durationMin} min drive (${a.drive.distanceKm} km)`
        : a.distance ?? ''
    return `- ${a.name}${drive ? ` — ${drive}` : ''}`
  })

  return [
    `Property name: ${cfg.name}`,
    `Location: ${cfg.location}`,
    `Capacity: ${cfg.bedrooms} bedrooms, ${cfg.bathrooms} bathrooms, up to ${cfg.maxGuests} guests`,
    `Summary: ${cfg.description}`,
    '',
    `Check-in: ${cfg.policies.checkIn}`,
    `Check-out: ${cfg.policies.checkOut}`,
    `Cancellation: ${cfg.policies.cancellation}`,
    '',
    `House rules:\n${houseRules || '- (none provided)'}`,
    '',
    `Amenities: ${amenities || '(none provided)'}`,
    '',
    `Photo sections:\n${photoSections.length ? photoSections.join('\n') : '- (none)'}`,
    '',
    `Nearby:\n${nearby?.length ? nearby.join('\n') : '- (none)'}`,
    '',
    `Contact email: ${cfg.contact.email}`,
  ].join('\n')
}

function validateMessages(input: unknown): ClientMessage[] {
  if (!Array.isArray(input)) throw new Error('Invalid messages')
  const msgs = input
    .slice(-MAX_MESSAGES)
    .map((m: any) => ({
      role: m?.role,
      content: typeof m?.content === 'string' ? sanitizeText(m.content) : '',
    }))
    .filter(
      (m: any) =>
        (m.role === 'user' || m.role === 'assistant') &&
        m.content.trim().length >= MIN_CHARS_PER_MESSAGE
    )

  if (msgs.length > 0 && msgs[msgs.length - 1]!.role !== 'user') {
    throw Object.assign(new Error('Last message must be from user'), { status: 400 })
  }

  let total = 0
  for (const m of msgs) {
    if (m.content.length > MAX_CHARS_PER_MESSAGE) {
      m.content = m.content.slice(0, MAX_CHARS_PER_MESSAGE)
    }
    total += m.content.length
  }

  if (total > MAX_TOTAL_CHARS) {
    const trimmed: ClientMessage[] = []
    let running = 0
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i]!
      if (running + m.content.length > MAX_TOTAL_CHARS) continue
      trimmed.unshift(m)
      running += m.content.length
    }
    return trimmed
  }

  return msgs
}

function buildSystemInstruction() {
  return [
    'You are MAX, the guest concierge for MAX Entertain Beachside Retreat.',
    'Reply in the same language as the guest.',
    'Be concise, warm, and factual.',
    'Use only the provided property context. If uncertain, say so and direct guests to the enquiry form.',
    'Do not invent prices or availability.',
    'If guest asks about booking, mention booking direct at maxentertain.com.',
    '',
    'Property context:',
    compactPropertyContext(),
  ].join('\n')
}

function toGeminiContents(messages: ClientMessage[]) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
}

async function callGeminiDirect(messages: ClientMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw Object.assign(new Error('GEMINI_API_KEY not configured'), { status: 503 })
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite'
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemInstruction() }],
        },
        contents: toGeminiContents(messages),
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 700,
        },
      }),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`Gemini responded with ${res.status}`)

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> }
      }>
    }

    const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('\n').trim()
    if (reply) return reply
    throw new Error('No reply field in Gemini response')
  } finally {
    clearTimeout(timer)
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const contentLength = Number(req.headers.get('content-length') ?? 0)
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }

    const ip = getClientIp(req)
    rateLimitOrThrow(ip)

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const messages = validateMessages(body?.messages)
    if (messages.length === 0) {
      return NextResponse.json({ error: 'Message too short or empty' }, { status: 400 })
    }

    const reply = await callGeminiDirect(messages)
    return NextResponse.json({ reply })
  } catch (err: any) {
    const status = typeof err?.status === 'number' ? err.status : 500
    if (status === 429) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429, headers: { 'retry-after': String(err.retryAfterSec || 30) } }
      )
    }
    if (status === 400) {
      return NextResponse.json({ error: err.message || 'Bad request' }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'MAX is unavailable right now. Please try again later or use the enquiry form.' },
      { status: 503 }
    )
  }
}
