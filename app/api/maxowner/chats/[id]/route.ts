import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { requireOwner } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireOwner(req)
  if (denied) return denied

  let oid: ObjectId
  try {
    oid = new ObjectId(params.id)
  } catch {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const db = await getDb()
  const doc = await db.collection('chat_conversations').findOne({ _id: oid })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ conversation: doc })
}
