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
    <main className="min-h-screen star-wrapper">
      <StarBackground density="light" />

      {/* Page header */}
      <div className="px-4 md:px-8 lg:px-16 pt-10 pb-8 border-b border-white/5">
        <div className="container-custom">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 font-sans text-sm font-semibold tracking-[0.16em] uppercase group"
          >
            <span className="h-px w-5 bg-white/40 group-hover:bg-white group-hover:w-8 transition-all duration-300" />
            Back to Property
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="block text-luxury-gold text-sm font-sans font-semibold tracking-[0.22em] uppercase mb-3">
                Photo Gallery
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight tracking-tight">
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
      <div className="px-4 md:px-8 lg:px-16 pb-20">
        <div className="container-custom">
          <PhotosGallery />
        </div>
      </div>
    </main>
  )
}
