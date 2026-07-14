import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { propertyConfig } from '@/config/property'

export const metadata: Metadata = {
  title: 'Booking Terms | MAX Entertain Beachside Retreat',
  description:
    'Booking terms and conditions for stays at MAX Entertain Beachside Retreat — check-in, cancellation, house rules, payments, and guest responsibilities.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '10 July 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-4">{title}</h2>
      <div className="space-y-3 text-white/75 leading-relaxed">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  const { policies } = propertyConfig

  return (
    <main id="main-content" className="min-h-screen bg-[#0f0f0d]">
      <Navigation />
      <div className="container-custom px-6 md:px-8 lg:px-16 pt-[calc(7rem+env(safe-area-inset-top))] pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-luxury-gold" />
            <span className="text-luxury-gold text-sm font-sans font-semibold tracking-[0.22em] uppercase">
              Terms
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
            Booking Terms &amp; Conditions
          </h1>
          <p className="text-white/50 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

          <Section title="The booking">
            <p>
              These terms apply to direct bookings made through this website for stays at MAX
              Entertain Beachside Retreat, 1975 Point Nepean Road, Tootgarook VIC 3941. Bookings
              made through Airbnb, Booking.com, or VRBO are governed by those platforms&apos;
              terms in addition to the house rules below.
            </p>
            <p>
              A booking is confirmed when payment is completed. The guest who makes the booking
              must be at least 18 years of age, must be staying at the property, and is
              responsible for the conduct of all guests in their group.
            </p>
          </Section>

          <Section title="Check-in and check-out">
            <p>
              Check-in is from {policies.checkIn} and check-out is by {policies.checkOut}. Early
              check-in or late check-out may be available on request but is not guaranteed.
            </p>
          </Section>

          <Section title="Cancellations and refunds">
            <p>{policies.cancellation}</p>
            <p>
              Refunds are returned to the original payment method. We recommend travel insurance
              for circumstances outside the cancellation policy.
            </p>
          </Section>

          <Section title="House rules">
            <ul className="list-disc pl-6 space-y-2">
              {policies.houseRules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
            <p>
              A maximum of <strong>25 people</strong> (adults and children combined) may be on the
              property at any time. The property strictly does not accept parties, events with
              non-registered guests, or schoolies/under-18 group bookings. Noise monitoring devices
              (which do not record audio) are active at the property, consistent with the Mornington
              Peninsula Shire Short Stay Accommodation Code of Conduct.
            </p>
          </Section>

          <Section title="Payments and pricing">
            <p>
              Direct booking payments are processed securely by Stripe. Quoted prices are in
              Australian dollars and include applicable charges and levies (including the
              Victorian Short Stay Levy where it applies) unless otherwise stated at checkout.
            </p>
          </Section>

          <Section title="Damage and guest responsibility">
            <p>
              Guests agree to leave the property in the condition it was found, fair wear and tear
              excepted. Damage beyond fair wear and tear, excessive cleaning, missing items, or
              costs arising from breach of house rules (including noise or party-related fines and
              call-out fees) may be charged to the booking guest.
            </p>
          </Section>

          <Section title="Liability">
            <p>
              Guests use the property and its facilities — including the pool, spa, trampoline,
              kayaks, and beach access — at their own risk. Children must be supervised by an
              adult at all times, particularly around water. Nothing in these terms excludes
              rights that cannot be excluded under the Australian Consumer Law.
            </p>
          </Section>

          <Section title="Governing law">
            <p>
              These terms are governed by the laws of Victoria, Australia. Questions about these
              terms can be sent to{' '}
              <a
                href={`mailto:${propertyConfig.contact.email}`}
                className="text-luxury-gold underline underline-offset-4 hover:text-white transition-colors"
              >
                {propertyConfig.contact.email}
              </a>
              .
            </p>
          </Section>

          <div className="mt-12 pt-8 border-t border-white/10 text-sm text-white/50">
            See also our{' '}
            <Link href="/privacy-policy" className="text-luxury-gold underline underline-offset-4 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
