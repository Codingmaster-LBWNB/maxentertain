'use client'

import Image from 'next/image'
import { propertyConfig } from '@/config/property'

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
  const attractions = propertyConfig.localArea.attractions

  return (
    <section id="local-area" className="section-padding bg-white scroll-mt-24 md:scroll-mt-28">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="section-label">Explore</span>
          <h2 className="heading-primary">{propertyConfig.localArea.title}</h2>
          <p className="text-luxury max-w-2xl mx-auto">
            {propertyConfig.localArea.description}
          </p>
        </div>

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
              <div
                key={index}
                className="group overflow-hidden bg-white border border-gray-100 hover:border-luxury-gold/30 hover:shadow-lg transition-all will-change-transform"
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
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-sans font-semibold tracking-[0.15em] uppercase">
                        <span className="material-icons" style={{ fontSize: '11px' }}>{iconName}</span>
                        {attraction.type}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[16/10] bg-luxury-light flex items-center justify-center">
                    <span className="material-icons text-luxury-gold/40" style={{ fontSize: '40px' }}>{iconName}</span>
                  </div>
                )}

                <div className="p-5">
                  {attraction.url ? (
                    <h3 className="font-serif font-semibold text-luxury-dark text-lg mb-1 group-hover:text-luxury-gold transition-colors">
                      <a href={attraction.url} target="_blank" rel="noopener noreferrer">
                        {attraction.name}
                      </a>
                    </h3>
                  ) : (
                    <h3 className="font-serif font-semibold text-luxury-dark text-lg mb-1">{attraction.name}</h3>
                  )}
                  {distanceLabel && (
                    <p className="text-xs font-sans font-semibold tracking-[0.12em] uppercase text-gray-400 flex items-center gap-1">
                      <span className="material-icons" style={{ fontSize: '12px' }}>near_me</span>
                      {distanceLabel}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Interactive Google Maps */}
        <div className="mt-12 overflow-hidden shadow-sm border border-gray-100">
          <div className="w-full h-96 relative">
            {/* Google Maps Embed - Works without API key for basic embeds */}
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
                className="bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-sm font-semibold text-luxury-dark hover:text-luxury-gold flex items-center gap-2"
              >
                <span className="material-icons" style={{ fontSize: '16px' }}>location_on</span>
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}





