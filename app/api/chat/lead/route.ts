import { NextResponse, type NextRequest } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { sendInquiryReceivedEmails, sendUnansweredQuestionAlert } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const reason = body.reason === 'booking' || body.reason === 'unanswered' ? body.reason : null
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.slice(0, 64) : ''
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 160) : ''
    const question = typeof body.question === 'string' ? body.question.trim().slice(0, 500) : ''
    const checkIn = typeof body.checkIn === 'string' ? body.checkIn.slice(0, 10) : ''
    const checkOut = typeof body.checkOut === 'string' ? body.checkOut.slice(0, 10) : ''

    if (!reason) return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })

    // Pull recent transcript for context (best-effort).
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
        await sendInquiryReceivedEmails({
          name: name || 'Chat guest',
          email,
          phone: '',
          checkIn,
          checkOut,
          guests: '',
          message: `Booking enquiry submitted via the website chat assistant.${question ? `\nContext: ${question}` : ''}`,
        })
      } catch (e) {
        emailSent = false
        console.error('[chat/lead] booking email failed:', e)
      }
    } else {
      // unanswered
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

    // Flag the conversation so the owner can spot it in the admin Chats page.
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
