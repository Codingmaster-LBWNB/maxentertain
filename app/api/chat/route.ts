import { NextResponse, type NextRequest } from 'next/server'
import { propertyConfig } from '@/config/property'
import { getDb } from '@/lib/mongodb'
import { chatToolDeclarations, executeChatTool, type ToolResult } from '@/lib/chatTools'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ClientMessage = { role: 'user' | 'assistant'; content: string }

const MAX_MESSAGES = 20
const MIN_CHARS_PER_MESSAGE = 2
const MAX_CHARS_PER_MESSAGE = 2000
const MAX_TOTAL_CHARS = 12000
const MAX_BODY_BYTES = 50_000
const GEMINI_TIMEOUT_MS = 12000
const MAX_TOOL_ITERATIONS = 3

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
  const today = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Melbourne',
  })
  const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Melbourne' })

  return [
    'You are MAX, the guest concierge for MAX Entertain Beachside Retreat.',
    `Today is ${today} (${todayIso}, Australia/Melbourne). Resolve all relative dates ("this weekend", "next month", "10–15 July") to absolute YYYY-MM-DD before calling tools.`,
    'Reply in the same language as the guest.',
    '',
    '## Your goal',
    'You actively help guests book direct. Be warm and helpful, but always move the conversation toward checking dates, quoting a price, and booking direct (which saves vs OTAs).',
    '',
    '## Tools — use them, never guess live data',
    '- When a guest mentions or implies dates, call check_availability.',
    '- When a guest asks about price/cost, or after confirming availability, call get_price_quote.',
    '- After a successful quote, tell them the total, highlight the direct-booking saving, and encourage booking. A "Book" button is shown automatically.',
    '- When the guest is ready to book or wants a human follow-up, call capture_booking_lead, then ask for their name and email.',
    '- If you CANNOT answer a property-specific question from the context below, call escalate_to_owner with their question. Do not guess. Then offer an email reply from the owner and ask for their email.',
    '',
    '## Formatting (always)',
    '- Use markdown: **bold** for key facts, bullet lists for 3+ items, numbered lists for steps, short bold headers for long answers.',
    '- One clear fact per bullet. Never a wall of prose when there are distinct facts.',
    '- Reply with conversational prose only. Never output JSON, code blocks, or function-call syntax in your message — use the provided tools to take actions instead.',
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

function geminiEndpoint(method: 'generateContent') {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw Object.assign(new Error('GEMINI_API_KEY not configured'), { status: 503 })
  const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}?key=${encodeURIComponent(apiKey)}`
}

async function callGemini(contents: any[]): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)
  try {
    const res = await fetch(geminiEndpoint('generateContent'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: buildSystemInstruction() }] },
        contents,
        tools: [{ functionDeclarations: chatToolDeclarations }],
        toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
        generationConfig: { temperature: 0.3, maxOutputTokens: 1200 },
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw Object.assign(
        new Error(`Gemini error ${res.status}: ${body.slice(0, 200)}`),
        { status: 503 }
      )
    }
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

type AgentOutcome = {
  text: string
  actions: any[]
  suggestions: string[]
  intents: string[]
  escalatedQuestions: string[]
}

function extractParts(resp: any): any[] {
  return resp?.candidates?.[0]?.content?.parts ?? []
}

/** Run the tool-resolution loop and return the final text plus collected side-data. */
async function runAgent(messages: ClientMessage[]): Promise<AgentOutcome> {
  const contents: any[] = toGeminiContents(messages)
  const actions: any[] = []
  const intents = new Set<string>()
  const escalatedQuestions: string[] = []
  const lastUserText = messages[messages.length - 1]?.content ?? ''

  for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
    const resp = await callGemini(contents)
    const parts = extractParts(resp)
    const functionCalls = parts.filter((p: any) => p.functionCall)

    if (functionCalls.length === 0) {
      const text = parts.map((p: any) => p.text ?? '').join('').trim()
      return finalize(text, actions, intents, escalatedQuestions, lastUserText)
    }

    // Echo the model's function-call turn back into the conversation.
    contents.push({ role: 'model', parts })

    // Execute each requested tool and append the responses.
    const responseParts: any[] = []
    for (const part of functionCalls) {
      const name = part.functionCall.name as string
      const args = part.functionCall.args ?? {}
      const result: ToolResult = await executeChatTool(name, args)
      if (result.intent) intents.add(result.intent)
      if (result.escalateQuestion) escalatedQuestions.push(result.escalateQuestion)
      if (result.bookCta) actions.push({ type: 'book_cta', ...result.bookCta })
      if (result.collectContact) actions.push({ type: 'collect_contact', ...result.collectContact })
      responseParts.push({ functionResponse: { name, response: result.response } })
    }
    contents.push({ role: 'user', parts: responseParts })
  }

  // Tool budget exhausted — ask once more for a plain text answer.
  const resp = await callGemini(contents)
  const text = extractParts(resp).map((p: any) => p.text ?? '').join('').trim()
  return finalize(text, actions, intents, escalatedQuestions, lastUserText)
}

const GENERAL_SUGGESTIONS = [
  'Is the pool heated?',
  'How far is the beach?',
  'Is it pet friendly?',
  'What time is check-in?',
  'What is there for kids?',
  'How many guests can stay?',
  'What is the cancellation policy?',
  'Is parking available?',
  'How much does it cost per night?',
  'What is nearby to do?',
  'Is there a home theatre?',
  'Do you allow events or parties?',
  'How do I book directly?',
  'Are linens and towels provided?',
]

/** 3 random follow-up suggestions, never echoing what the guest just asked. */
function buildSuggestions(_intents: Set<string>, lastUserText: string): string[] {
  const askedWords = new Set(
    lastUserText.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3)
  )
  const isTooSimilar = (s: string) => {
    const words = s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3)
    const overlap = words.filter((w) => askedWords.has(w)).length
    return overlap >= 2
  }
  // Shuffle a copy (Fisher–Yates) so suggestions vary every turn.
  const pool = [...GENERAL_SUGGESTIONS]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
  }
  return pool.filter((s) => !isTooSimilar(s)).slice(0, 3)
}

// Safety net: strip any machine artifacts the model might still emit.
function stripArtifacts(text: string): string {
  return text
    .replace(/<<META>>[\s\S]*?(<<END>>|$)/g, '')
    .replace(/```(?:json)?[\s\S]*?```/g, (block) => (/"suggestions"|functionCall|tool_code/.test(block) ? '' : block))
    .trim()
}

function finalize(
  rawText: string,
  actions: any[],
  intents: Set<string>,
  escalatedQuestions: string[],
  lastUserText: string
): AgentOutcome {
  let text = stripArtifacts(rawText)
  if (!text) text = "Sorry, I couldn't generate a response. Please try again or use the enquiry form."
  return {
    text,
    actions,
    suggestions: buildSuggestions(intents, lastUserText),
    intents: [...intents],
    escalatedQuestions,
  }
}

// ─────────────────────────── Persistence ───────────────────────────

let chatIndexesEnsured = false
async function ensureChatIndexes() {
  if (chatIndexesEnsured) return
  try {
    const db = await getDb()
    const col = db.collection('chat_conversations')
    await col.createIndex({ sessionId: 1 }, { unique: true, background: true })
    await col.createIndex({ lastMessageAt: -1 }, { background: true })
    chatIndexesEnsured = true
  } catch { /* non-fatal */ }
}

async function persistChatTurn(args: {
  sessionId: string
  ip: string
  userContent: string
  aiReply: string
  intents: string[]
  escalatedQuestions: string[]
}) {
  try {
    await ensureChatIndexes()
    const db = await getDb()
    const now = new Date()
    const addToSet: Record<string, unknown> = {}
    if (args.intents.length) addToSet.intents = { $each: args.intents }
    if (args.escalatedQuestions.length) addToSet.escalatedQuestions = { $each: args.escalatedQuestions }

    const update: any = {
      $setOnInsert: { sessionId: args.sessionId, propertyId: 'maxentertain', startedAt: now, ipAddress: args.ip },
      $set: { lastMessageAt: now },
      $push: {
        messages: {
          $each: [
            { role: 'user', content: args.userContent, timestamp: now },
            { role: 'assistant', content: args.aiReply, timestamp: now },
          ],
        },
      },
    }
    if (args.escalatedQuestions.length) update.$set.escalated = true
    if (Object.keys(addToSet).length) update.$addToSet = addToSet

    await db.collection('chat_conversations').updateOne({ sessionId: args.sessionId }, update, { upsert: true })
  } catch { /* persist failures must not break the chat */ }
}

// ─────────────────────────── SSE streaming ───────────────────────────

function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`
}

function streamOutcome(outcome: AgentOutcome): ReadableStream {
  const encoder = new TextEncoder()
  // Chunk the buffered answer into small word groups for a live typing feel.
  const tokens = outcome.text.split(/(\s+)/).filter((t) => t.length > 0)
  return new ReadableStream({
    async start(controller) {
      let buf = ''
      for (let i = 0; i < tokens.length; i++) {
        buf += tokens[i]
        // Flush every ~3 tokens.
        if (i % 3 === 2 || i === tokens.length - 1) {
          controller.enqueue(encoder.encode(sse({ type: 'text', delta: buf })))
          buf = ''
          await new Promise((r) => setTimeout(r, 18))
        }
      }
      controller.enqueue(encoder.encode(sse({ type: 'meta', actions: outcome.actions, suggestions: outcome.suggestions })))
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
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

    const sessionId =
      typeof body?.sessionId === 'string' && body.sessionId.length > 0 && body.sessionId.length <= 64
        ? body.sessionId
        : null

    const outcome = await runAgent(messages)

    if (sessionId) {
      const lastUserContent = messages[messages.length - 1]?.content ?? ''
      void persistChatTurn({
        sessionId,
        ip,
        userContent: lastUserContent,
        aiReply: outcome.text,
        intents: outcome.intents,
        escalatedQuestions: outcome.escalatedQuestions,
      })
    }

    return new Response(streamOutcome(outcome), {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
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
