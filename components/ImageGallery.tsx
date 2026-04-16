'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { propertyConfig } from '@/config/property'
import DomeGallery from './DomeGallery'

export default function ImageGallery() {
  const gallerySource = propertyConfig.imagesCompressed && propertyConfig.imagesCompressed.length > 0
    ? propertyConfig.imagesCompressed
    : propertyConfig.images
  const domeImages = useMemo(
    () => gallerySource.map((src, index) => ({ src: encodeURI(src), alt: `${propertyConfig.name} - Photo ${index + 1}` })),
    [gallerySource]
  )

  return (
    <section id="gallery" className="section-padding bg-white star-section scroll-mt-24 md:scroll-mt-28">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-primary">Photo Gallery</h2>
          <p className="text-luxury text-gray-600">Take a closer look at our beautiful property</p>
        </div>

        <div className="w-full h-[70vh] min-h-[540px] max-h-[820px] rounded-2xl overflow-hidden bg-[#120F17]">
          <DomeGallery
            images={domeImages}
            grayscale={false}
            fit={0.48}
            minRadius={560}
            openedImageWidth="360px"
            openedImageHeight="420px"
            imageBorderRadius="18px"
            openedImageBorderRadius="22px"
          />
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/photos" className="btn-primary">
            View all photos
          </Link>
        </div>
      </div>
    </section>
  )
}