import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { sendReturningGuestOfferEmail } from '@/lib/email'
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
    try {
      const db = await getDb()
      const bookings = await db
        .collection<BookingRecord>('bookings')
        .find({ status: { $in: ['confirmed', 'completed'] } })
        .toArray()

      // Aggregate per guest first so the backfill is idempotent: we $set the
      // totals from the full history rather than $inc per booking, so running
      // it more than once cannot double-count bookings or spend.
      type Agg = {
        propertyId: string
        name: string
        email: string
        phone: string
        totalBookings: number
        totalSpendAud: number
        tags: Set<BookingGroupType>
        lastBookingId: string
        lastCheckIn: string
        lastCheckOut: string
      }
      const byEmail = new Map<string, Agg>()
      for (const b of bookings) {
        const key = b.guest.email.toLowerCase()
        const cur = byEmail.get(key)
        if (!cur) {
          byEmail.set(key, {
            propertyId: b.propertyId,
            name: b.guest.name,
            email: key,
            phone: b.guest.phone,
            totalBookings: 1,
            totalSpendAud: b.pricing.totalAud,
            tags: new Set([b.guest.groupType]),
            lastBookingId: b._id,
            lastCheckIn: b.checkIn,
            lastCheckOut: b.checkOut,
          })
        } else {
          cur.totalBookings += 1
          cur.totalSpendAud += b.pricing.totalAud
          cur.tags.add(b.guest.groupType)
          // checkOut is an ISO date string, so lexical compare = chronological.
          if (b.checkOut >= cur.lastCheckOut) {
            cur.name = b.guest.name
            cur.phone = b.guest.phone
            cur.lastBookingId = b._id
            cur.lastCheckIn = b.checkIn
            cur.lastCheckOut = b.checkOut
          }
        }
      }

      const now = new Date()
      let guestsWritten = 0
      for (const g of byEmail.values()) {
        await db.collection('guests').updateOne(
          { _id: g.email as any } as any,
          {
            $set: {
              propertyId: g.propertyId,
              name: g.name,
              email: g.email,
              phone: g.phone,
              totalBookings: g.totalBookings,
              totalSpendAud: g.totalSpendAud,
              tags: Array.from(g.tags),
              lastBookingId: g.lastBookingId,
              lastCheckIn: g.lastCheckIn,
              lastCheckOut: g.lastCheckOut,
              lastStayedAt: new Date(`${g.lastCheckOut}T00:00:00.000Z`),
              updatedAt: now,
            },
            $setOnInsert: { offerCampaignsSent: [], createdAt: now },
          },
          { upsert: true }
        )
        guestsWritten += 1
      }

      return NextResponse.json({ ok: true, guests: guestsWritten, bookings: bookings.length })
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Backfill failed'
      return NextResponse.json({ error: messageText }, { status: 500 })
    }
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
