'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { propertyConfig } from '@/config/property'
import { useSectionTime } from '@/hooks/useSectionTime'

const attractionIcons: Record<string, string> = {
  restaurant: 'restaurant',
  attraction: 'camera_alt',
  activity: 'hiking',
  beach: 'beach_access',
  shopping: 'shopping_bag',
}

function formatKm(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  const rounded = Math.round(km * 10) / 10
  return `${rounded} km`
}

export default function LocalArea() {
  const sectionRef = useSectionTime('Local Area')
  const attractions = propertyConfig.localArea.attractions

  return (
    <section ref={sectionRef} id="local-area" className="section-padding bg-[#fafaf8] star-section-alt scroll-mt-24 md:scroll-mt-28 local-area-section">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label">Explore</span>
          <h2 className="heading-primary">{propertyConfig.localArea.title}</h2>
          <p className="text-luxury max-w-2xl mx-auto">
            {propertyConfig.localArea.description}
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-12 bg-luxury-gold/50" />
            <div className="w-1.5 h-1.5 bg-luxury-gold rotate-45" />
            <div className="h-px w-12 bg-luxury-gold/50" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attraction, index) => {
            const iconName = attractionIcons[attraction.type] || 'location_on'
            const driveMin = attraction.drive?.durationMin
            const driveKm = attraction.drive?.distanceKm
            const distanceLabel =
              typeof driveMin === 'number' && typeof driveKm === 'number'
                ? `${driveMin} min drive • ${formatKm(driveKm)}`
                : attraction.distance

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.07, 0.35) }}
                className="group overflow-hidden rounded-2xl bg-white dark:bg-[#1d1d1b] border border-gray-200/80 dark:border-white/10 hover:border-luxury-gold/50 dark:hover:border-luxury-gold/35 shadow-sm hover:shadow-[0_8px_32px_rgba(212,175,55,0.12)] dark:hover:shadow-[0_8px_32px_rgba(212,175,55,0.10)] transition-all duration-300 will-change-transform"
              >
                {attraction.image ? (
                  <div className="relative w-full aspect-[16/10] overflow-hidden">
                    <Image
                      src={attraction.image}
                      alt={attraction.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      priority={index < 3}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-sans font-semibold tracking-[0.12em] uppercase">
                        <span className="material-icons" style={{ fontSize: '13px' }}>{iconName}</span>
                        {attraction.type}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[16/10] bg-luxury-light rounded-t-2xl flex items-center justify-center">
                    <span className="material-icons text-luxury-gold/40" style={{ fontSize: '40px' }}>{iconName}</span>
                  </div>
                )}

                <div className="p-5">
                  {attraction.url ? (
                    <h3 className="font-serif font-semibold text-luxury-dark dark:text-white text-lg mb-2 group-hover:text-luxury-gold transition-colors duration-200">
                      <a href={attraction.url} target="_blank" rel="noopener noreferrer">
                        {attraction.name}
                      </a>
                    </h3>
                  ) : (
                    <h3 className="font-serif font-semibold text-luxury-dark dark:text-white text-lg mb-2">{attraction.name}</h3>
                  )}
                  {distanceLabel && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-luxury-gold/10 dark:bg-luxury-gold/15 border border-luxury-gold/25 dark:border-luxury-gold/20 text-xs font-sans font-semibold tracking-[0.08em] uppercase text-luxury-accent dark:text-luxury-gold/90">
                      <span className="material-icons text-luxury-gold" style={{ fontSize: '13px' }}>near_me</span>
                      {distanceLabel}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Interactive Google Maps */}
        <div className="mt-14">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-md ring-1 ring-luxury-gold/10 dark:ring-luxury-gold/8">
            {/* Gold accent top bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-luxury-gold/60 to-transparent z-10 pointer-events-none" />
            <div className="w-full h-96 relative">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(propertyConfig.location)}&output=embed&zoom=14`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Property Location Map"
              />
              {/* Link to open in Google Maps */}
              <div className="absolute bottom-4 right-4 z-10">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(propertyConfig.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white dark:bg-[#1d1d1b] px-4 py-2.5 rounded-xl shadow-lg border border-gray-200/80 dark:border-white/15 hover:border-luxury-gold/50 hover:shadow-[0_4px_20px_rgba(212,175,55,0.18)] transition-all duration-200 text-sm font-sans font-semibold text-luxury-dark dark:text-white hover:text-luxury-gold dark:hover:text-luxury-gold"
                >
                  <span className="material-icons text-luxury-gold" style={{ fontSize: '16px' }}>location_on</span>
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}





