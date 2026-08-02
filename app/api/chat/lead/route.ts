import { NextResponse, type NextRequest } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { sendInquiryReceivedEmails, sendUnansweredQuestionAlert } from '@/lib/email'
import { checkSameOrigin, getClientIp, rateLimitDurable } from '@/lib/rateLimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function cleanField(value: unknown, maxLength: number): string {
  return String(value ?? '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export async function POST(req: NextRequest) {
  try {
    if (!checkSameOrigin(req)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ip = getClientIp(req)
    if (!(await rateLimitDurable('chat-lead', ip, 3, 60_000))) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const reason = body.reason === 'booking' || body.reason === 'unanswered' ? body.reason : null
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 64) : ''
    const name = cleanField(body.name, 120)
    const email = cleanField(body.email, 160)
    const question = cleanField(body.question, 500)
    const checkIn = cleanField(body.checkIn, 10)
    const checkOut = cleanField(body.checkOut, 10)

    if (!reason) return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })

    // Rate-limit per email as well to slow third-party spam via this domain.
    if (!(await rateLimitDurable('chat-lead-email', email.toLowerCase(), 5, 60 * 60_000))) {
      return NextResponse.json(
        { error: 'Too many requests for this email. Please try again later.' },
        { status: 429 }
      )
    }

    // Pull recent transcript for context (best-effort). Keep in owner email only.
    let transcript: Array<{ role: string; content: string }> = []
    if (sessionId && process.env.MONGODB_URI) {
      try {
        const db = await getDb()
        const doc = await db.collection('chat_conversations').findOne({ sessionId })
        transcript = (doc?.messages ?? []) as Array<{ role: string; content: string }>
      } catch { /* non-fatal */ }
    }

    let emailSent = true

    if (reason === 'booking') {
      if (process.env.MONGODB_URI) {
        try {
          const db = await getDb()
          await db.collection('inquiries').insertOne({
            name: name || 'Chat guest',
            email,
            phone: '',
            checkIn,
            checkOut,
            guests: '',
            message: `[via chat] Booking enquiry${question ? `: ${question}` : ''}`,
            receivedAt: new Date(),
            status: 'new',
            source: 'chat',
          })
        } catch { /* non-fatal */ }
      }
      try {
        // Owner-only — do not send guest confirmation from this unauthenticated path
        // (prevents third-party spam via our domain).
        await sendInquiryReceivedEmails(
          {
            name: name || 'Chat guest',
            email,
            phone: '',
            checkIn,
            checkOut,
            guests: '',
            message: `Booking enquiry submitted via the website chat assistant.${question ? `\nContext: ${question}` : ''}`,
          },
          { notifyGuest: false }
        )
      } catch (e) {
        emailSent = false
        console.error('[chat/lead] booking email failed:', e)
      }
    } else {
      try {
        await sendUnansweredQuestionAlert({
          guestName: name,
          guestEmail: email,
          question: question || '(question not captured)',
          transcript,
          sessionId,
        })
      } catch (e) {
        emailSent = false
        console.error('[chat/lead] unanswered email failed:', e)
      }
    }

    if (sessionId && process.env.MONGODB_URI) {
      try {
        const db = await getDb()
        await db.collection('chat_conversations').updateOne(
          { sessionId },
          {
            $set: {
              lead: { name: name || null, email, reason, checkIn: checkIn || null, checkOut: checkOut || null, capturedAt: new Date() },
              ...(reason === 'unanswered' ? { escalated: true } : {}),
            },
            $addToSet: { flags: reason === 'booking' ? 'lead_captured' : 'escalated' },
          }
        )
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ ok: true, emailSent })
  } catch {
    return NextResponse.json({ error: 'Could not submit. Please email us directly.' }, { status: 500 })
  }
}
