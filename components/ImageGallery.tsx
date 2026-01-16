'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { propertyConfig } from '@/config/property'

export default function ImageGallery() {
  // Lightbox removed: keep gallery as a simple, non-clickable grid
  const [selectedImage] = useState<number | null>(null)
  // Use compressed images for gallery thumbnails (faster loading)
  const thumbnailImages = propertyConfig.imagesCompressed && propertyConfig.imagesCompressed.length > 0
    ? propertyConfig.imagesCompressed
    : propertyConfig.images
  // Use HD images for lightbox (full quality when viewing)
  const hdImages = propertyConfig.images.length > 0 
    ? propertyConfig.images 
    : ['/images/placeholder.jpg']
  const images = thumbnailImages.length > 0 ? thumbnailImages : hdImages
  
  // Get HD image for lightbox
  const getHdImage = (index: number) => {
    return hdImages[index] || images[index] || '/images/placeholder.jpg'
  }

  // (lightbox handlers removed)

  return (
    <>
      <section id="gallery" className="section-padding bg-white">
        <div className="container-custom">
          {/* Mobile: keep current animated heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:hidden"
          >
            <h2 className="heading-primary">Photo Gallery</h2>
            <p className="text-luxury text-gray-600">
              Take a closer look at our beautiful property
            </p>

            <div className="mt-6">
              <Link href="/photos" className="btn-secondary inline-flex">
                View all photos
              </Link>
            </div>
          </motion.div>

          {/* Desktop: remove “gradually appearing” animation */}
          <div className="hidden md:block text-center mb-12">
            <h2 className="heading-primary">Photo Gallery</h2>
            <p className="text-luxury text-gray-600">
              Take a closer look at our beautiful property
            </p>
          </div>

          {/* Mobile: horizontal swipe gallery (keeps page short) */}
          <div className="md:hidden -mx-4 px-4 overflow-x-auto flex gap-4 snap-x snap-mandatory pb-2">
            {images.map((image, index) => (
              <Link
                key={index}
                href="/photos"
                className="relative aspect-[4/3] w-[78vw] max-w-[420px] flex-shrink-0 rounded-xl overflow-hidden snap-start"
                aria-label={`Open all photos (photo ${index + 1})`}
              >
                <Image
                  src={image}
                  alt={`${propertyConfig.name} - Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="78vw"
                  loading="lazy"
                  quality={70}
                  unoptimized={false}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    const hdFallback = getHdImage(index)
                    target.src = hdFallback || '/images/placeholder.jpg'
                  }}
                />
              </Link>
            ))}
          </div>

          {/* Desktop: current grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-[4/3] rounded-xl overflow-hidden"
              >
                <Image
                  src={image}
                  alt={`${propertyConfig.name} - Gallery Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 50vw, 33vw"
                  loading="lazy"
                  quality={70}
                  unoptimized={false}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3C/svg%3E"
                  onError={(e) => {
                    // Fallback to HD version if compressed fails
                    const target = e.target as HTMLImageElement
                    const hdFallback = getHdImage(index)
                    if (hdFallback && hdFallback !== '/images/placeholder.jpg') {
                      target.src = hdFallback
                    } else {
                      target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23ddd" width="800" height="600"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EProperty Image%3C/text%3E%3C/svg%3E'
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}


