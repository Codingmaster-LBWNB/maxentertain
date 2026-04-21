import { NextResponse, type NextRequest } from 'next/server'
import { propertyConfig } from '@/config/property'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ClientMessage = { role: 'user' | 'assistant'; content: string }

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'
const MAX_MESSAGES = 20
const MIN_CHARS_PER_MESSAGE = 2
const MAX_CHARS_PER_MESSAGE = 2000
const MAX_TOTAL_CHARS = 12000
const MAX_BODY_BYTES = 50_000      // reject bodies larger than 50 KB before JSON parse
const N8N_TIMEOUT_MS = 9000

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
  // In production, only allow requests originating from the same site
  if (process.env.NODE_ENV !== 'production') return true
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL
  if (!siteUrl) return true // no site URL configured — allow
  const origin = req.headers.get('origin') || req.headers.get('referer') || ''
  try {
    return new URL(origin).origin === new URL(siteUrl).origin
  } catch {
    return false
  }
}

// Strip null bytes and non-printable control characters (keep tab/newline/CR)
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

function systemPrompt(): string {
  return [
    'You are the guest FAQ assistant for a vacation rental property website.',
    'You MUST answer using ONLY the information provided in the CONTEXT.',
    'If the question is not answered by the context, say you do not have that information and suggest contacting the host via /inquiry.',
    'Do not invent policies, prices, availability, discounts, or addresses beyond what is provided.',
    'Keep answers concise, friendly, and practical. Use bullet points when helpful.',
    'If the user asks for something unrelated to the property, politely refuse and redirect back to property questions.',
    '',
    'CONTEXT:',
    compactPropertyContext(),
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

  // Last message must be from the user (Anthropic API requirement)
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

// --- N8N integration ---
// Tries the N8N_WEBHOOK_URL if configured. N8N workflow should accept:
//   { message, sessionId, history, context }
// and return one of:
//   { reply } | { output } | { text } | { message } | [{ reply }] (array wrapping)
async function tryN8n(
  messages: ClientMessage[],
  sessionId: string
): Promise<string | null> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) return null

  const lastMessage = messages[messages.length - 1]
  if (!lastMessage) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), N8N_TIMEOUT_MS)

  try {
    const n8nHeaders: Record<string, string> = { 'content-type': 'application/json' }
    const n8nSecret = process.env.N8N_WEBHOOK_SECRET
    if (n8nSecret) n8nHeaders['x-webhook-secret'] = n8nSecret

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: n8nHeaders,
      body: JSON.stringify({
        message: lastMessage.content,
        sessionId,
        history: messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
        context: compactPropertyContext(),
      }),
      signal: controller.signal,
    })

    if (!res.ok) return null

    const raw: unknown = await res.json()

    // Handle array wrapper N8N sometimes adds
    const data: unknown = Array.isArray(raw) ? raw[0] : raw
    if (!data || typeof data !== 'object') return null

    const d = data as Record<string, unknown>
    const reply =
      d.reply ?? d.output ?? d.text ?? d.message ?? d.answer ?? d.response ?? null

    if (typeof reply === 'string' && reply.trim()) {
      return reply.trim()
    }
    return null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// --- Claude fallback ---
async function callClaude(messages: ClientMessage[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw Object.assign(new Error('Server not configured (missing ANTHROPIC_API_KEY)'), { status: 500 })

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 700,
      temperature: 0.2,
      system: systemPrompt(),
      messages: messages.map((m) => ({
        role: m.role,
        content: [{ type: 'text', text: m.content }],
      })),
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw Object.assign(new Error('Anthropic request failed'), {
      status: 502,
      detail: text.slice(0, 500),
    })
  }

  const data: any = await res.json()
  const parts: string[] = Array.isArray(data?.content)
    ? data.content
        .filter((c: any) => c?.type === 'text' && typeof c?.text === 'string')
        .map((c: any) => c.text)
    : []

  return parts.join('').trim()
}

export async function POST(req: NextRequest) {
  try {
    // Origin check — block cross-site requests in production
    if (!checkOrigin(req)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Body size limit — reject before JSON parse to prevent memory abuse
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

    // Try N8N first, fall back to Claude
    let reply = await tryN8n(messages, ip)

    if (!reply) {
      reply = await callClaude(messages)
    }

    return NextResponse.json({ reply: reply || "Sorry, I couldn't generate a response." })
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
    if (status === 500 && err.message?.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Chat failed' }, { status })
  }
}
