'use client'

import { useState } from 'react'
import { propertyConfig } from '@/config/property'

const faqs = [
  {
    q: 'What are the check-in and check-out times?',
    a: `Check-in is from ${propertyConfig.policies.checkIn} and check-out is by ${propertyConfig.policies.checkOut}. Early check-in or late check-out may be available on request — please contact us.`,
  },
  {
    q: 'How many guests can the property accommodate?',
    a: `The property sleeps up to ${propertyConfig.maxGuests} guests across ${propertyConfig.bedrooms} bedrooms. Sleeping arrangements include 4 king beds, 2 bunk beds, 2 single beds, 2 sofa beds, and 3 cots for infants.`,
  },
  {
    q: 'Is the pool heated year-round?',
    a: 'Yes — the swimming pool is solar-heated, so it is warm and usable throughout the year. The 6-person spa (jacuzzi) is also available year-round.',
  },
  {
    q: 'How far is the property from the beach?',
    a: 'The beach is just 10 metres across the road — a 30-second walk from the front door. Kayaks are provided for guests who want to get out on the water.',
  },
  {
    q: 'Are pets allowed?',
    a: `Yes, pets are welcome. Please disclose your pet at the time of booking and follow the house pet guidelines. ${propertyConfig.policies.houseRules.find(r => /pet/i.test(r)) ?? ''}`,
  },
  {
    q: 'What entertainment is available for kids?',
    a: 'The property has an extensive entertainment setup: a 120-inch home theatre, racing and shooting arcades, Nintendo Switch, karaoke with JBL sound system, mini golf, trampoline, table tennis, pool table, foosball, kayaks, and a large solar-heated swimming pool and spa.',
  },
  {
    q: 'What is the cancellation policy?',
    a: propertyConfig.policies.cancellation,
  },
  {
    q: 'How close are the Peninsula Hot Springs?',
    a: 'Peninsula Hot Springs is a 10-minute drive (7.1 km). Alba Thermal Springs & Spa is also nearby at 8 minutes (5.8 km).',
  },
  {
    q: 'How do I book and is there a discount for booking direct?',
    a: 'You can book directly through this website to avoid OTA service fees. We are also listed on Airbnb, Booking.com, and VRBO. Booking direct means you deal with the host directly, which is faster and more personal.',
  },
  {
    q: 'Are parties or events allowed?',
    a: 'No — the property strictly does not accept parties. Outdoor areas including the pool, spa, decking, and balconies must be quiet between 11 PM and 7 AM. Noise monitoring is active. Schoolies bookings are not accepted.',
  },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={`flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      style={{ color: '#D4AF37' }}
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="section-padding" aria-labelledby="faq-heading">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="block text-luxury-gold text-sm font-sans font-semibold tracking-[0.22em] uppercase mb-3">
            FAQ
          </span>
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-serif font-bold text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className="rounded-xl border border-white/10 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-white/90 font-sans font-semibold text-base leading-snug">
                    {faq.q}
                  </span>
                  <ChevronIcon open={isOpen} />
                </button>

                {isOpen && (
                  <div
                    className="px-5 pb-5 text-white/70 font-sans text-base leading-relaxed"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
