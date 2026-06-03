import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { sendReturningGuestOfferEmail } from '@/lib/email'
import { upsertGuestFromBooking } from '@/lib/bookings'
import type { BookingGroupType, BookingRecord, GuestRecord } from '@/types/booking'

const VALID_TAGS: BookingGroupType[] = ['family', 'corporate', 'golf', 'milestone', 'other']

function normaliseTags(tags: unknown): BookingGroupType[] {
  if (!Array.isArray(tags)) return []
  return tags.filter((tag): tag is BookingGroupType => VALID_TAGS.includes(tag))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tag = searchParams.get('tag')
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = 50
  const filter = (tag && tag !== 'all' ? { tags: tag as BookingGroupType } : {}) as any

  const db = await getDb()
  const col = db.collection<GuestRecord>('guests')
  const [guests, total] = await Promise.all([
    col.find(filter).sort({ lastStayedAt: -1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    col.countDocuments(filter),
  ])

  return NextResponse.json({ guests, total, page, pages: Math.max(1, Math.ceil(total / limit)) })
}

export async function PATCH(req: NextRequest) {
  const { email, tags, marketingOptOut } = await req.json()
  const nextTags = normaliseTags(tags)
  if (!email || nextTags.length === 0) {
    return NextResponse.json({ error: 'Valid email and at least one tag required' }, { status: 400 })
  }

  const db = await getDb()
  await db.collection('guests').updateOne(
    { _id: String(email).toLowerCase() as any } as any,
    { $set: { tags: nextTags, marketingOptOut: Boolean(marketingOptOut), updatedAt: new Date() } }
  )
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const { email, action } = await req.json()
  if (action === 'backfill_from_bookings') {
    const db = await getDb()
    const bookings = await db.collection<BookingRecord>('bookings').find({ status: { $in: ['confirmed', 'completed'] } }).toArray()
    for (const booking of bookings) {
      await upsertGuestFromBooking(booking)
    }
    return NextResponse.json({ ok: true, backfilled: bookings.length })
  }

  if (!email || action !== 'send_returning_offer') {
    return NextResponse.json({ error: 'Valid email and action required' }, { status: 400 })
  }

  const db = await getDb()
  const guest = await db.collection<GuestRecord>('guests').findOne({ _id: String(email).toLowerCase() } as any)
  if (!guest) return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  if (guest.marketingOptOut) {
    return NextResponse.json({ error: 'Guest has opted out of marketing offers' }, { status: 400 })
  }

  const campaign = {
    id: `manual-returning-offer-${new Date().toISOString().slice(0, 10)}`,
    label: 'Returning guest offer',
  }

  await sendReturningGuestOfferEmail(guest, campaign)
  await db.collection('guests').updateOne(
    { _id: guest._id as any } as any,
    {
      $addToSet: { offerCampaignsSent: campaign.id },
      $set: { updatedAt: new Date(), lastOfferSentAt: new Date() },
    }
  )

  return NextResponse.json({ ok: true })
}
