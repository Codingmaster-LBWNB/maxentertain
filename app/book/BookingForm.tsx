'use client'

import { FormEvent, useState } from 'react'
import type { BookingGroupType, BookingPricing } from '@/types/booking'
import BookingSummary from '@/components/BookingSummary'
import CancellationPolicy from '@/components/CancellationPolicy'

const GROUP_OPTIONS: { value: BookingGroupType; label: string }[] = [
  { value: 'family', label: 'Multi-generational family stay' },
  { value: 'milestone', label: 'Milestone birthday / celebration' },
  { value: 'golf', label: 'Golf group' },
  { value: 'corporate', label: 'Corporate retreat' },
  { value: 'other', label: 'Other' },
]

export default function BookingForm({
  checkIn,
  checkOut,
  pricing,
}: {
  checkIn: string
  checkOut: string
  pricing: BookingPricing
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const form = new FormData(event.currentTarget)
    const payload = {
      checkIn,
      checkOut,
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      guests: Number(form.get('guests') ?? 0),
      groupType: String(form.get('groupType') ?? 'other'),
      pets: String(form.get('pets') ?? ''),
      message: String(form.get('message') ?? ''),
      rulesAccepted: form.get('rulesAccepted') === 'on',
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error === 'DATES_UNAVAILABLE'
          ? 'Those dates were just taken. Please choose another date range.'
          : data.error ?? 'Booking could not be started')
      }

      if (!data.checkoutUrl) throw new Error('Stripe checkout URL was not returned')
      window.location.href = data.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking could not be started')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <form onSubmit={submit} className="rounded-sm bg-white/95 p-6 shadow-2xl dark:bg-[#1f1f1c]/95 md:p-8">
          <h1 className="font-serif text-3xl font-bold text-luxury-dark dark:text-white md:text-4xl">
            Secure Your Direct Booking
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-700 dark:text-gray-300">
            Complete your details, confirm the house rules, then pay securely with Stripe. Your dates are held for 30 minutes while checkout is open.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Full name</span>
              <input name="name" required className="mt-2 w-full border border-gray-300 bg-white px-4 py-3 text-luxury-dark outline-none focus:border-luxury-gold dark:border-white/10 dark:bg-[#141411] dark:text-white" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Email</span>
              <input name="email" type="email" required className="mt-2 w-full border border-gray-300 bg-white px-4 py-3 text-luxury-dark outline-none focus:border-luxury-gold dark:border-white/10 dark:bg-[#141411] dark:text-white" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Phone</span>
              <input name="phone" required placeholder="+61 ..." className="mt-2 w-full border border-gray-300 bg-white px-4 py-3 text-luxury-dark outline-none focus:border-luxury-gold dark:border-white/10 dark:bg-[#141411] dark:text-white" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Guests</span>
              <input name="guests" type="number" min={1} max={30} required className="mt-2 w-full border border-gray-300 bg-white px-4 py-3 text-luxury-dark outline-none focus:border-luxury-gold dark:border-white/10 dark:bg-[#141411] dark:text-white" />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Group type</span>
              <select name="groupType" required className="mt-2 w-full border border-gray-300 bg-white px-4 py-3 text-luxury-dark outline-none focus:border-luxury-gold dark:border-white/10 dark:bg-[#141411] dark:text-white">
                {GROUP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Pets</span>
              <input name="pets" placeholder="No pets / one small dog / etc." className="mt-2 w-full border border-gray-300 bg-white px-4 py-3 text-luxury-dark outline-none focus:border-luxury-gold dark:border-white/10 dark:bg-[#141411] dark:text-white" />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Tell Jason about your stay</span>
              <textarea name="message" required rows={4} placeholder="Occasion, family mix, arrival plans, or anything we should know." className="mt-2 w-full border border-gray-300 bg-white px-4 py-3 text-luxury-dark outline-none focus:border-luxury-gold dark:border-white/10 dark:bg-[#141411] dark:text-white" />
            </label>
          </div>

          <label className="mt-6 flex items-start gap-3 text-base text-gray-700 dark:text-gray-300">
            <input name="rulesAccepted" type="checkbox" required className="mt-1 h-4 w-4 accent-luxury-gold" />
            <span>
              I confirm this is not a Schoolies booking, parties are not permitted, outdoor areas close between 11pm and 7am, and I accept the cancellation policy.
            </span>
          </label>

          {error ? <p className="mt-5 text-sm font-semibold text-red-600">{error}</p> : null}

          <button type="submit" disabled={isSubmitting} className="btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Opening Secure Checkout...' : `Pay $${pricing.totalAud.toLocaleString()} Securely`}
          </button>
        </form>
      </div>

      <aside className="space-y-5 lg:col-span-5">
        <BookingSummary pricing={pricing} checkIn={checkIn} checkOut={checkOut} showLevy />
        <CancellationPolicy />
      </aside>
    </div>
  )
}
