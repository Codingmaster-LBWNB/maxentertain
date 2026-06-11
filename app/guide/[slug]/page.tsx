import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import JsonLd from '@/components/JsonLd'
import { guides, getGuide } from '@/lib/guides'
import { propertyConfig } from '@/config/property'
import { getSiteUrl } from '@/lib/site'

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = getGuide(params.slug)
  if (!guide) return {}
  return {
    title: `${guide.title} | MAX Entertain`,
    description: guide.description,
    alternates: { canonical: `/guide/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      publishedTime: guide.datePublished,
    },
  }
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug)
  if (!guide) notFound()

  const siteUrl = getSiteUrl()

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.datePublished,
    image: `${siteUrl}${encodeURI(guide.heroImage.src)}`,
    author: {
      '@type': 'Organization',
      name: propertyConfig.name,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: propertyConfig.name,
      url: siteUrl,
    },
    mainEntityOfPage: `${siteUrl}/guide/${guide.slug}`,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${siteUrl}/guide` },
      { '@type': 'ListItem', position: 3, name: guide.title, item: `${siteUrl}/guide/${guide.slug}` },
    ],
  }

  return (
    <main id="main-content" className="min-h-screen bg-[#0f0f0d]">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <Navigation />

      {/* Hero */}
      <header className="relative h-[50vh] min-h-[380px] w-full overflow-hidden">
        <Image
          src={encodeURI(guide.heroImage.src)}
          alt={guide.heroImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0d] via-black/55 to-black/35" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-custom px-6 md:px-8 lg:px-16 pb-12">
            <Link
              href="/guide"
              className="inline-flex items-center gap-1.5 text-luxury-gold text-sm font-sans font-semibold tracking-[0.18em] uppercase mb-5 hover:text-white transition-colors"
            >
              <span className="material-icons" style={{ fontSize: '14px' }}>arrow_back</span>
              All Guides
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight max-w-3xl drop-shadow-xl">
              {guide.title}
            </h1>
          </div>
        </div>
      </header>

      <article className="container-custom px-6 md:px-8 lg:px-16 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-5 mb-12">
            {guide.intro.map((p, i) => (
              <p key={i} className="text-white/80 text-lg leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {guide.sections.map((section, i) => (
            <section key={i} className="mb-12">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-5">
                {section.heading}
              </h2>
              <div className="space-y-4">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-white/75 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-5 space-y-2.5">
                  {section.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-3 text-white/75">
                      <span
                        className="material-icons text-luxury-gold mt-0.5 flex-shrink-0"
                        style={{ fontSize: '16px' }}
                      >
                        check_circle
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* CTA */}
          <div
            className="rounded-2xl border border-luxury-gold/25 px-6 py-10 text-center"
            style={{ background: 'rgba(212,175,55,0.06)' }}
          >
            <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-3">
              Planning a Peninsula stay?
            </h2>
            <p className="text-white/70 mb-6">
              <Link href={guide.cta.href} className="text-luxury-gold underline underline-offset-4 hover:text-white transition-colors">
                {guide.cta.anchor}
              </Link>{' '}
              — {propertyConfig.bedrooms} bedrooms, sleeps {propertyConfig.maxGuests}+, 10 m from the
              beach in Tootgarook.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={guide.cta.href} className="btn-primary inline-flex items-center gap-2 justify-center">
                {guide.cta.text}
              </Link>
              <Link
                href="/#calendar"
                className="inline-flex items-center gap-2 justify-center px-6 py-3 border border-white/25 text-white font-sans font-semibold text-sm tracking-wider uppercase hover:bg-white/10 transition-all"
                style={{ borderRadius: '2px' }}
              >
                <span className="material-icons" style={{ fontSize: '14px' }}>event_available</span>
                Check Availability
              </Link>
            </div>
          </div>

          {/* Other guides */}
          <div className="mt-12">
            <h2 className="text-lg font-sans font-semibold tracking-[0.18em] uppercase text-luxury-gold mb-5">
              More Guides
            </h2>
            <ul className="space-y-3">
              {guides
                .filter((g) => g.slug !== guide.slug)
                .map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guide/${g.slug}`}
                      className="text-white/80 hover:text-luxury-gold transition-colors underline underline-offset-4"
                    >
                      {g.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  )
}
