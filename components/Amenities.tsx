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
    <section ref={sectionRef} id="amenities" className="section-padding bg-[#fafaf8] star-section-alt scroll-mt-24 md:scroll-mt-28">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="section-label">Included</span>
          <h2 className="heading-primary">Amenities &amp; Features</h2>
          <p className="text-luxury max-w-2xl mx-auto">
            Everything you need for a comfortable and memorable stay
          </p>
        </div>

        <div
          id="amenities-grid"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {visibleAmenities.map((amenity, index) => {
            const iconName = getIcon(amenity)
            return (
              <motion.div
                key={amenity}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: Math.min(index * 0.04, 0.35) }}
                className="bg-white dark:bg-[#1d1d1b] border border-gray-100 dark:border-white/7 p-5 hover:border-luxury-gold/40 dark:hover:border-luxury-gold/30 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover:text-luxury-gold transition-colors">
                    <span className="material-icons text-luxury-gold/60 group-hover:text-luxury-gold transition-colors" style={{ fontSize: '22px' }}>{iconName}</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-sans text-sm font-medium leading-tight">
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

