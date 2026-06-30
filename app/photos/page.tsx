import type { Metadata } from 'next'
import Link from 'next/link'
import PhotosGallery from '@/components/PhotosGallery'
import StarBackground from '@/components/StarBackground'
import { propertyConfig } from '@/config/property'

export const metadata: Metadata = {
  title: 'Photo Gallery | MAX Entertain Beachside Retreat',
  description: `Browse ${propertyConfig.images.length}+ photos of our Mornington Peninsula beachfront retreat — solar-heated pool, home theatre, bedrooms, and more.`,
  alternates: { canonical: '/photos' },
  openGraph: {
    title: 'Photo Gallery | MAX Entertain Beachside Retreat',
    description: 'See every room and outdoor space at our award-winning Mornington Peninsula beachfront retreat.',
    type: 'website',
    url: '/photos',
  },
}

export default function PhotosPage() {
  const totalPhotos = propertyConfig.images.length

  return (
    <main id="main-content" className="relative min-h-screen">
      {/* Star background in its own fixed, self-clipping layer so it never traps
          `position: sticky` (the shared .star-wrapper uses overflow:hidden). */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <StarBackground density="light" />
      </div>

      {/* Sticky compact header — always visible while scrolling */}
      <div
        className="sticky top-0 z-40 border-b border-white/8 backdrop-blur"
        style={{ backgroundColor: 'rgba(12,12,11,0.92)' }}
      >
        <div className="container-custom px-4 md:px-8 lg:px-16">
          <div className="flex h-14 items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-sans text-sm font-semibold tracking-[0.14em] uppercase"
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back</span>
              <span className="hidden sm:inline">Back to Property</span>
            </Link>
            <span className="md:hidden text-white/55 font-sans text-xs font-semibold tracking-[0.18em] uppercase">
              {totalPhotos} Photos
            </span>
            <span className="hidden md:block truncate text-white/45 font-sans text-xs font-semibold tracking-[0.2em] uppercase">
              {propertyConfig.name} · {totalPhotos} Photos
            </span>
            {/* Desktop CTA; mobile uses the global fixed bottom booking bar */}
            <Link
              href="/#calendar"
              className="btn-primary hidden md:inline-flex flex-shrink-0 items-center gap-1.5 py-2 px-4 text-sm"
            >
              <span className="material-icons" style={{ fontSize: '15px' }}>calendar_today</span>
              <span className="whitespace-nowrap">Check Availability</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Title block (scrolls away) */}
      <div className="px-4 md:px-8 lg:px-16 pt-8 pb-6">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="block text-luxury-gold text-sm font-sans font-semibold tracking-[0.22em] uppercase mb-3">
                Photo Gallery
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight tracking-tight">
                {propertyConfig.name}
              </h1>
            </div>
            <div className="flex items-center gap-3 text-white/60 font-sans text-sm">
              <div className="h-px w-8 bg-white/15" />
              <span className="text-white/75 font-semibold tracking-wider text-sm uppercase">{totalPhotos} Photos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="px-4 md:px-8 lg:px-16 pb-24">
        <div className="container-custom">
          <PhotosGallery />
        </div>
      </div>
    </main>
  )
}
