import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { requireOwner } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const denied = await requireOwner(req)
  if (denied) return denied

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const filter = searchParams.get('filter') ?? 'all'
  const limit = 30

  const db = await getDb()
  const col = db.collection('chat_conversations')

  const query: Record<string, unknown> =
    filter === 'booking'
      ? { intents: 'booking_intent' }
      : filter === 'escalated'
      ? { escalated: true }
      : filter === 'leads'
      ? { lead: { $exists: true } }
      : {}

  const [docs, total] = await Promise.all([
    col
      .find(query)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    col.countDocuments(query),
  ])

  const conversations = docs.map((doc) => {
    const msgs = (doc.messages ?? []) as Array<{ role: string; content: string }>
    const firstUserMsg = msgs.find((m) => m.role === 'user')?.content ?? ''
    return {
      _id: doc._id,
      sessionId: doc.sessionId,
      startedAt: doc.startedAt,
      lastMessageAt: doc.lastMessageAt,
      ipAddress: doc.ipAddress,
      messageCount: msgs.length,
      firstUserMessage: firstUserMsg.slice(0, 120),
      intents: doc.intents ?? [],
      escalated: !!doc.escalated,
      lead: doc.lead ?? null,
    }
  })

  return NextResponse.json({ conversations, total, page, pages: Math.ceil(total / limit) })
}
