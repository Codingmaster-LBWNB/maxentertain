import Link from 'next/link'
import PhotosGallery from '@/components/PhotosGallery'
import StarBackground from '@/components/StarBackground'
import { propertyConfig } from '@/config/property'

export default function PhotosPage() {
  const totalPhotos = propertyConfig.images.length

  return (
    <main className="min-h-screen star-wrapper">
      <StarBackground />

      {/* Page header */}
      <div className="px-4 md:px-8 lg:px-16 pt-10 pb-8 border-b border-white/5">
        <div className="container-custom">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 font-sans text-xs font-semibold tracking-[0.2em] uppercase group"
          >
            <span className="h-px w-5 bg-white/40 group-hover:bg-white group-hover:w-8 transition-all duration-300" />
            Back to Property
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="block text-luxury-gold text-[10px] font-sans font-semibold tracking-[0.35em] uppercase mb-3">
                Photo Gallery
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight tracking-tight">
                {propertyConfig.name}
              </h1>
            </div>
            <div className="flex items-center gap-3 text-white/30 font-sans text-sm">
              <div className="h-px w-8 bg-white/15" />
              <span className="text-white/50 font-semibold tracking-widest text-xs uppercase">{totalPhotos} Photos</span>
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
