import type { Metadata } from 'next'
import InquiryForm from '@/components/InquiryForm'
import Link from 'next/link'
import Image from 'next/image'
import { propertyConfig } from '@/config/property'

export const metadata: Metadata = {
  title: 'Book Direct & Save | MAX Entertain Beachside Retreat',
  description: 'Enquire and book direct for the best rate at our award-winning Mornington Peninsula beachfront retreat. 6 bedrooms, heated pool, home theatre — 10 m from the beach.',
  alternates: { canonical: '/inquiry' },
  openGraph: {
    title: 'Book Direct & Save | MAX Entertain Beachside Retreat',
    description: 'Skip the OTA fees — book directly with the host for the best rate on the Mornington Peninsula.',
    type: 'website',
    url: '/inquiry',
  },
}

const STATS = [
  { icon: 'king_bed', value: '6', label: 'Bedrooms' },
  { icon: 'group', value: '16', label: 'Guests max' },
  { icon: 'waves', value: '10 m', label: 'From beach' },
  { icon: 'star', value: '5.0', label: 'Guest rating' },
]

const FEATURES = [
  { icon: 'local_fire_department', label: 'Heated pool & spa', desc: 'Year-round outdoor luxury' },
  { icon: 'movie', label: 'Home theatre & arcade', desc: 'Entertainment for all ages' },
  { icon: 'savings', label: 'No platform fees', desc: 'Save up to 15% booking direct' },
  { icon: 'verified', label: 'Fast host response', desc: 'Jason replies within hours' },
]

export default function InquiryPage({
  searchParams,
}: {
  searchParams?: { checkIn?: string; checkOut?: string }
}) {
  const prefill = {
    checkIn: searchParams?.checkIn,
    checkOut: searchParams?.checkOut,
  }

  const quote = propertyConfig.testimonials[0]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background — fixed on desktop, absolute on mobile for iOS Safari compatibility */}
      <div className="absolute inset-0 md:fixed -z-10">
        <Image
          src={encodeURI('/Airbnb picture/1975 Point Nepean Road- HD/Living 1.jpg')}
          alt="MAX Entertain living room"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <main className="relative min-h-screen">
        <div className="section-padding">
          <div className="container-custom">
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white drop-shadow"
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back</span>
              <span>Back to Property</span>
            </Link>

            <div className="grid gap-10 lg:grid-cols-12 lg:items-start">

              {/* ── Left: value panel ── */}
              <div className="lg:col-span-5 space-y-7">

                {/* Award badge + headline */}
                <div>
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-luxury-gold/40 bg-luxury-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-luxury-gold">
                    <span className="material-icons text-[12px]">emoji_events</span>
                    Award-Winning Property 2024–2026
                  </div>
                  <h1 className="font-serif text-4xl font-bold leading-tight text-white drop-shadow-2xl md:text-5xl">
                    Your beachfront<br />escape awaits
                  </h1>
                  <p className="mt-4 text-base leading-relaxed text-white/80 drop-shadow md:text-lg">
                    Australia&apos;s top-rated luxury holiday retreat on the Mornington Peninsula — a short stroll from the sand.
                  </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {STATS.map(({ icon, value, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                    >
                      <span className="material-icons text-luxury-gold" style={{ fontSize: '22px' }}>{icon}</span>
                      <div>
                        <div className="text-lg font-bold leading-none text-white">{value}</div>
                        <div className="mt-0.5 text-xs text-white/65">{label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feature highlights */}
                <div className="space-y-3">
                  {FEATURES.map(({ icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-luxury-gold/30 bg-luxury-gold/20">
                        <span className="material-icons text-luxury-gold" style={{ fontSize: '18px' }}>{icon}</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{label}</div>
                        <div className="mt-0.5 text-xs text-white/60">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Testimonial */}
                {quote && (
                  <div className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                    <div className="mb-3 flex gap-0.5">
                      {Array.from({ length: quote.rating }).map((_, i) => (
                        <span key={i} className="material-icons text-luxury-gold" style={{ fontSize: '16px' }}>star</span>
                      ))}
                    </div>
                    <p className="text-sm italic leading-relaxed text-white/90">
                      &ldquo;{quote.comment}&rdquo;
                    </p>
                    <p className="mt-3 text-xs text-white/50">
                      — {quote.name}, verified {quote.source ?? 'guest'} · {quote.date}
                    </p>
                  </div>
                )}

                {/* Availability nudge */}
                <p className="text-sm text-white/65 drop-shadow">
                  Already have dates in mind?{' '}
                  <Link href="/#calendar" className="text-luxury-gold underline underline-offset-4 hover:text-luxury-gold/80 transition-colors">
                    Check the availability calendar →
                  </Link>
                </p>
              </div>

              {/* ── Right: enquiry form ── */}
              <div className="w-full lg:col-span-7 lg:justify-self-end">
                <InquiryForm
                  variant="glass"
                  containerClassName="w-full max-w-xl ml-auto"
                  prefill={prefill}
                />
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
