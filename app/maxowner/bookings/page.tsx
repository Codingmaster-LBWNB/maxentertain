'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BookingRecord, BookingStatus } from '@/types/booking'

const STATUS_OPTIONS: Array<{ id: 'all' | BookingStatus; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending_payment', label: 'Pending holds' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'refunded', label: 'Refunded' },
  { id: 'expired', label: 'Expired' },
  { id: 'completed', label: 'Completed' },
]

const STATUS_STYLE: Record<BookingStatus, string> = {
  pending_payment: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  confirmed: 'bg-green-500/15 text-green-300 border-green-500/30',
  expired: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
  refunded: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  completed: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
}

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [status, setStatus] = useState<'all' | BookingStatus>('all')
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/maxowner/bookings?status=${status}`)
    const data = await res.json()
    setBookings(data.bookings ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [status])

  useEffect(() => { load() }, [load])

  const resendConfirmation = async (bookingId: string) => {
    setMessage('')
    const res = await fetch('/api/maxowner/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, action: 'resend_confirmation' }),
    })
    const data = await res.json().catch(() => ({}))
    setMessage(res.ok ? 'Confirmation email resent.' : data.error ?? 'Could not resend confirmation.')
  }

  return (
    <div className="p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-serif text-luxury-gold">Bookings</h1>
          <p className="text-sm text-gray-400">{total} bookings in this view</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setStatus(option.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              status === option.id
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
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#1a1a18] p-12 text-center">
          <p className="text-gray-500">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking._id} className="rounded-xl border border-white/10 bg-[#1a1a18] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-white">{booking.guest.name}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLE[booking.status]}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                    <span className="rounded-full border border-luxury-gold/30 bg-luxury-gold/10 px-2 py-0.5 text-xs text-luxury-gold">
                      {booking.guest.groupType}
                    </span>
                  </div>
                  <div className="grid gap-1 text-sm text-gray-400 md:grid-cols-2">
                    <p>{booking.guest.email}</p>
                    <p>{booking.guest.phone}</p>
                    <p>{booking.checkIn} to {booking.checkOut} ({booking.nights} nights)</p>
                    <p>${booking.pricing.totalAud.toLocaleString()} total</p>
                  </div>
                  {booking.refundAmountAud ? (
                    <p className="mt-2 text-sm text-purple-300">Refunded: ${booking.refundAmountAud.toLocaleString()}</p>
                  ) : null}
                  {booking.guest.message ? (
                    <p className="mt-3 rounded-lg bg-black/20 px-4 py-3 text-sm leading-relaxed text-gray-300">{booking.guest.message}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {booking.payment.stripeInvoiceUrl ? (
                    <a href={booking.payment.stripeInvoiceUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:border-luxury-gold hover:text-luxury-gold">
                      Invoice
                    </a>
                  ) : null}
                  {booking.status === 'confirmed' ? (
                    <button
                      onClick={() => resendConfirmation(booking._id)}
                      className="rounded-lg border border-luxury-gold/40 px-3 py-2 text-xs font-semibold text-luxury-gold hover:bg-luxury-gold/10"
                    >
                      Resend confirmation
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
