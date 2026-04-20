'use client'

import Link from 'next/link'
import MarqueeGallery from './MarqueeGallery'

export default function ImageGallery() {
  return (
    <section id="gallery" className="section-padding bg-white star-section scroll-mt-24 md:scroll-mt-28">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-primary">Photo Gallery</h2>
          <p className="text-luxury text-gray-600">Take a closer look at our beautiful property</p>
        </div>
      </div>

      <MarqueeGallery />

      <div className="container-custom">
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/photos" className="btn-primary">
            View all photos
          </Link>
        </div>
      </div>
    </section>
  )
}