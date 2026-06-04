import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 30

  const db = await getDb()
  const col = db.collection('chat_conversations')

  const [docs, total] = await Promise.all([
    col
      .find({})
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    col.countDocuments(),
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
    }
  })

  return NextResponse.json({ conversations, total, page, pages: Math.ceil(total / limit) })
}
