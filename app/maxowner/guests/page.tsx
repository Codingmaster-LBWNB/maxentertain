'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BookingGroupType, GuestRecord } from '@/types/booking'

const TAGS: Array<{ id: 'all' | BookingGroupType; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'family', label: 'Family' },
  { id: 'golf', label: 'Golf' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'milestone', label: 'Milestone' },
  { id: 'other', label: 'Other' },
]

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestRecord[]>([])
  const [tag, setTag] = useState<'all' | BookingGroupType>('all')
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/maxowner/guests?tag=${tag}`)
    const data = await res.json()
    setGuests(data.guests ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [tag])

  useEffect(() => { load() }, [load])

  const toggleTag = async (guest: GuestRecord, nextTag: BookingGroupType) => {
    const current = new Set(guest.tags ?? [])
    if (current.has(nextTag)) current.delete(nextTag)
    else current.add(nextTag)
    if (current.size === 0) current.add('other')

    const nextTags = Array.from(current)
    await fetch('/api/maxowner/guests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: guest.email, tags: nextTags, marketingOptOut: guest.marketingOptOut }),
    })
    setGuests((prev) => prev.map((item) => item.email === guest.email ? { ...item, tags: nextTags } : item))
  }

  const toggleMarketingOptOut = async (guest: GuestRecord) => {
    const next = !guest.marketingOptOut
    await fetch('/api/maxowner/guests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: guest.email, tags: guest.tags?.length ? guest.tags : ['other'], marketingOptOut: next }),
    })
    setGuests((prev) => prev.map((item) => item.email === guest.email ? { ...item, marketingOptOut: next } : item))
  }

  const sendOffer = async (guest: GuestRecord) => {
    setMessage('')
    const res = await fetch('/api/maxowner/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: guest.email, action: 'send_returning_offer' }),
    })
    const data = await res.json().catch(() => ({}))
    setMessage(res.ok ? `Returning guest offer sent to ${guest.name}.` : data.error ?? 'Could not send offer.')
  }

  const backfillGuests = async () => {
    setMessage('')
    const res = await fetch('/api/maxowner/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'backfill_from_bookings' }),
    })
    const data = await res.json().catch(() => ({}))
    setMessage(res.ok ? `Backfilled ${data.guests ?? 0} guests from ${data.bookings ?? 0} confirmed bookings.` : data.error ?? 'Backfill failed.')
    if (res.ok) load()
  }

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-28 text-white">
      <div className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-serif text-luxury-gold">Guests</h1>
            <p className="text-sm text-gray-400">{total} past guests in this view</p>
          </div>
          <button
            onClick={backfillGuests}
            className="rounded-lg border border-luxury-gold/40 px-3 py-2 text-xs font-semibold text-luxury-gold hover:bg-luxury-gold/10"
          >
            Backfill from bookings
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TAGS.map((option) => (
          <button
            key={option.id}
            onClick={() => setTag(option.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tag === option.id
                ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                : 'border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {message ? <p className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">{message}</p> : null}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : guests.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#1a1a18] p-12 text-center">
          <p className="text-gray-500">No guests found yet.</p>
          <p className="mt-1 text-sm text-gray-600">Guests are added automatically after confirmed direct bookings.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {guests.map((guest) => (
            <div key={guest.email} className="rounded-xl border border-white/10 bg-[#1a1a18] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-white">{guest.name}</span>
                    <span className="text-sm text-gray-500">{guest.totalBookings} booking{guest.totalBookings === 1 ? '' : 's'}</span>
                    <span className="text-sm text-gray-500">${guest.totalSpendAud.toLocaleString()} direct spend</span>
                  </div>
                  <div className="grid gap-1 text-sm text-gray-400 md:grid-cols-2">
                    <a href={`mailto:${guest.email}`} className="text-luxury-gold hover:underline">{guest.email}</a>
                    <p>{guest.phone || 'No phone'}</p>
                    <p>Last stay: {guest.lastCheckIn} to {guest.lastCheckOut}</p>
                    <p>Last booking: {guest.lastBookingId}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {TAGS.filter((item) => item.id !== 'all').map((item) => {
                      const active = guest.tags?.includes(item.id as BookingGroupType)
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleTag(guest, item.id as BookingGroupType)}
                          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                            active
                              ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                              : 'border-white/10 text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <button
                  onClick={() => sendOffer(guest)}
                  disabled={guest.marketingOptOut}
                  className="rounded-lg border border-luxury-gold/40 px-3 py-2 text-xs font-semibold text-luxury-gold hover:bg-luxury-gold/10"
                >
                  Send returning offer
                </button>
                <button
                  onClick={() => toggleMarketingOptOut(guest)}
                  className="mt-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:border-white/30 hover:text-gray-200"
                >
                  {guest.marketingOptOut ? 'Allow offers' : 'Opt out offers'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
