import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { propertyConfig } from '@/config/property'
import type { segmentPages } from '@/lib/segmentPages'

type SegmentData = (typeof segmentPages)[keyof typeof segmentPages]

export default function SegmentLandingPage({ data }: { data: SegmentData }) {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <main className="min-h-screen bg-[#0f0f0d] text-white">
      <JsonLd data={faqJsonLd} />
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <Link href="/" className="mb-10 inline-flex text-sm font-semibold uppercase tracking-widest text-luxury-gold hover:underline">
            Back to MAX Entertain
          </Link>
          <p className="section-label">{data.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl font-serif text-4xl font-bold leading-tight md:text-6xl">{data.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75">{data.description}</p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {data.bullets.map((bullet) => (
              <div key={bullet} className="rounded-xl border border-white/10 bg-white/[0.05] p-5 text-white/80">
                {bullet}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/#calendar" className="btn-primary">Check Dates</Link>
            <Link href={`/?guestType=${data.reviewFilter}#testimonials`} className="inline-flex items-center justify-center border border-luxury-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-luxury-gold hover:bg-luxury-gold hover:text-black">
              Read Matching Reviews
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding border-t border-white/10">
        <div className="container-custom max-w-4xl">
          <h2 className="font-serif text-3xl font-bold">Why this works for your group</h2>
          <p className="mt-5 text-lg leading-relaxed text-white/75">
            {propertyConfig.name} is a 6-bedroom beachside retreat in Tootgarook with a solar-heated pool, spa, home theatre, arcade games, karaoke, mini golf and beach access across the road. It is designed for large groups that need space, privacy and entertainment without depending on leaving the house.
          </p>
          <div className="mt-10 space-y-4">
            {data.faq.map((item) => (
              <div key={item.q} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="font-semibold text-luxury-gold">{item.q}</h3>
                <p className="mt-2 text-white/75">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
