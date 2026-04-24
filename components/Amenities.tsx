'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { propertyConfig } from '@/config/property'
import { useSectionTime } from '@/hooks/useSectionTime'
const amenityIcons: Record<string, string> = {
  // Internet & Tech
  'Wi-Fi': 'wifi',
  'Smart Home Tech': 'home',
  'Security System': 'security',

  // Climate Control
  'Air Conditioning': 'ac_unit',
  'Heating': 'local_fire_department',
  'Undertile Heating': 'local_fire_department',

  // Kitchen & Dining
  'Kitchen': 'restaurant',
  'Fully Equipped Kitchen': 'kitchen',
  'Dishwasher': 'soap',
  'Coffee Maker': 'coffee',
  'BBQ Grill': 'fireplace',

  // Laundry
  'Washing Machine': 'local_laundry_service',
  'Dryer': 'local_laundry_service',

  // Entertainment
  'TV': 'tv',
  'Netflix': 'movie',
  'Private Theatre Room': 'movie',
  '120 inch Projector Screen': 'videocam',
  'In-Ceiling Speakers': 'speaker',
  'Karaoke System': 'mic',

  // Parking & Transportation
  'Parking': 'directions_car',
  'Parking (8 spaces)': 'local_parking',

  // Outdoor & Recreation
  'Swimming Pool': 'pool',
  'Swimming Pool (Solar Heated)': 'pool',
  'Hot Tub/Spa': 'hot_tub',
  'Hot Tub/Spa (6 person)': 'spa',
  'Garden': 'park',
  'Balcony': 'beach_access',

  // Games & Activities
  'Racing Arcade': 'sports_esports',
  'Shooting Arcade': 'sports_esports',
  'Table Tennis': 'sports_tennis',
  'Pool Table': 'table_restaurant',
  'Foosball Table': 'casino',
  'Mini Golf': 'flag',
  'Trampoline': 'child_care',

  // Home Features
  'Gas Log Fireplace': 'local_fire_department',
  'Sea View': 'beach_access',
  'Beach Access': 'beach_access',
}

const getIcon = (amenity: string): string => {
  if (amenityIcons[amenity]) {
    return amenityIcons[amenity]
  }

  const amenityLower = amenity.toLowerCase()
  for (const [key, icon] of Object.entries(amenityIcons)) {
    if (amenityLower.includes(key.toLowerCase()) || key.toLowerCase().includes(amenityLower)) {
      return icon
    }
  }

  return 'star'
}

export default function Amenities() {
  const sectionRef = useSectionTime('Amenities')
  const INITIAL_VISIBLE = 12
  const [showAll, setShowAll] = useState(false)

  const allAmenities = propertyConfig.amenities
  const visibleAmenities = useMemo(
    () => (showAll ? allAmenities : allAmenities.slice(0, INITIAL_VISIBLE)),
    [allAmenities, showAll]
  )

  return (
    <section ref={sectionRef} id="amenities" className="amenity-section section-padding scroll-mt-24 md:scroll-mt-28">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label">Included</span>
          <h2 className="heading-primary">Amenities &amp; Features</h2>
          <p className="max-w-2xl mx-auto text-gray-500 dark:text-white/40 font-sans font-light">
            Everything you need for a comfortable and memorable stay
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-12 bg-luxury-gold/50" />
            <div className="w-1.5 h-1.5 bg-luxury-gold rotate-45" />
            <div className="h-px w-12 bg-luxury-gold/50" />
          </div>
        </motion.div>

        <div id="amenities-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleAmenities.map((amenity, index) => {
            const iconName = getIcon(amenity)
            return (
              <motion.div
                key={amenity}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.035, 0.3) }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="amenity-card group relative overflow-hidden rounded-xl cursor-default"
                style={{ backdropFilter: 'blur(8px)' }}
              >
                {/* Gold hairline top — brightens on hover */}
                <div className="h-px w-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  style={{ background: 'linear-gradient(90deg, transparent, #D4AF37 40%, #D4AF37 60%, transparent)' }} />

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.25), 0 8px 32px rgba(212,175,55,0.08)' }} />

                <div className="p-5 flex items-center gap-4">
                  {/* Icon badge */}
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: 'rgba(212,175,55,0.1)',
                      border: '1px solid rgba(212,175,55,0.2)',
                    }}>
                    <span className="material-icons transition-colors duration-300 text-luxury-gold/60 group-hover:text-luxury-gold"
                      style={{ fontSize: '20px' }}>{iconName}</span>
                  </div>
                  <span className="text-gray-600 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-white/90 font-sans text-sm font-medium leading-tight transition-colors duration-200">
                    {amenity}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {allAmenities.length > INITIAL_VISIBLE && (
          <div className="mt-10 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="btn-secondary"
              aria-expanded={showAll}
              aria-controls="amenities-grid"
            >
              {showAll ? 'Show fewer amenities' : `Show all amenities (${allAmenities.length})`}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

