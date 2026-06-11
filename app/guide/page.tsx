import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import JsonLd from '@/components/JsonLd'
import { guides } from '@/lib/guides'
import { getSiteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Mornington Peninsula Travel Guides | MAX Entertain Beachside Retreat',
  description:
    'Local guides to the Mornington Peninsula from the hosts of MAX Entertain Beachside Retreat — family holidays, golf weekends, hot springs comparisons, and winter travel.',
  alternates: { canonical: '/guide' },
}

export default function GuideIndexPage() {
  const siteUrl = getSiteUrl()

  const listJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: guides.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${siteUrl}/guide/${g.slug}`,
      name: g.title,
    })),
  }

  return (
    <main className="min-h-screen bg-[#0f0f0d]">
      <JsonLd data={listJsonLd} />
      <Navigation />

      <div className="container-custom px-6 md:px-8 lg:px-16 pt-[calc(7rem+env(safe-area-inset-top))] pb-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-10 bg-luxury-gold" />
          <span className="text-luxury-gold text-sm font-sans font-semibold tracking-[0.22em] uppercase">
            Local Knowledge
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight mb-4 max-w-3xl">
          Mornington Peninsula Guides
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mb-12">
          Written by the family behind MAX Entertain Beachside Retreat in Tootgarook — real opinions
          from hosting 1000+ guests a year, not a tourism brochure.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {guides.map((g) => (
            <Link
              key={g.slug}
              href={`/guide/${g.slug}`}
              className="group rounded-2xl border border-white/10 overflow-hidden hover:border-luxury-gold/40 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={encodeURI(g.heroImage.src)}
                  alt={g.heroImage.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-serif font-bold text-white leading-snug mb-3 group-hover:text-luxury-gold transition-colors">
                  {g.title}
                </h2>
                <p className="text-white/65 text-sm leading-relaxed mb-4">{g.description}</p>
                <span className="text-luxury-gold text-sm font-sans font-semibold tracking-wider uppercase inline-flex items-center gap-1.5">
                  Read the guide
                  <span className="material-icons" style={{ fontSize: '14px' }}>arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
