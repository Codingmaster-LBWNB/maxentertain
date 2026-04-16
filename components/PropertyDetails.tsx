'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { propertyConfig } from '@/config/property'

export default function PropertyDetails() {
  const details = [
    { icon: 'bed', label: 'Bedrooms', value: propertyConfig.bedrooms },
    { icon: 'bathtub', label: 'Bathrooms', value: propertyConfig.bathrooms },
    { icon: 'group', label: 'Max Guests', value: `${propertyConfig.maxGuests}+` },
  ]

  const [showAllAbout, setShowAllAbout] = useState(false)
  const ABOUT_MAX_LINES = 26

  const aboutLines = useMemo(() => propertyConfig.longDescription.split('\n'), [])
  const visibleAboutLines = useMemo(
    () => (showAllAbout ? aboutLines : aboutLines.slice(0, ABOUT_MAX_LINES)),
    [aboutLines, showAllAbout]
  )

  return (
    <section id="details" className="section-padding bg-white star-section scroll-mt-24 md:scroll-mt-28">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label">The Property</span>
          <h2 className="heading-primary">{propertyConfig.name}</h2>
          <div className="flex items-center justify-center gap-2 text-luxury-accent">
            <span className="material-icons" style={{ fontSize: '16px' }}>location_on</span>
            <p className="text-sm font-sans font-semibold tracking-[0.15em] uppercase text-gray-500 dark:text-gray-400">{propertyConfig.location}</p>
          </div>
        </motion.div>

        {/* Property Stats — editorial horizontal bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="border border-gray-100 dark:border-white/7 bg-white dark:bg-[#1d1d1b] shadow-sm">
            <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-white/7">
              {details.map((detail, index) => (
                <div key={index} className="text-center py-10 px-4 group hover:bg-luxury-gold/5 transition-colors">
                  <div className="inline-flex items-center justify-center w-10 h-10 mb-4">
                    <span className="material-icons text-luxury-gold/70" style={{ fontSize: '24px' }}>{detail.icon}</span>
                  </div>
                  <div className="text-4xl md:text-5xl font-serif font-bold text-luxury-dark dark:text-white mb-1">
                    {detail.value}
                  </div>
                  <div className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-gray-400 dark:text-gray-500">{detail.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-10 text-center">
            <span className="section-label">About</span>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-luxury-dark dark:text-white tracking-tight">
              About This Property
            </h3>
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="h-px w-12 bg-luxury-gold/60"></div>
              <div className="w-1.5 h-1.5 bg-luxury-gold rotate-45"></div>
              <div className="h-px w-12 bg-luxury-gold/60"></div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#1d1d1b] p-8 md:p-14 border border-gray-100 dark:border-white/7 shadow-sm">
            <div className="text-gray-700 dark:text-gray-300">
              <div className="text-base md:text-lg lg:text-xl font-sans font-light tracking-wide">
                {visibleAboutLines.map((line, index) => {
                  const trimmedLine = line.trim()
                  
                  // Style headings (lines ending with ? or :, or short uppercase lines)
                  if (trimmedLine.endsWith('?') || 
                      (trimmedLine.endsWith(':') && !trimmedLine.startsWith('-')) ||
                      (trimmedLine.length > 0 && 
                       trimmedLine.length < 50 && 
                       !trimmedLine.startsWith('-') &&
                       trimmedLine === trimmedLine.toUpperCase() &&
                       trimmedLine.split(' ').length <= 5)) {
                    return (
                      <h4 key={index} className="text-2xl md:text-3xl font-serif font-semibold text-luxury-dark dark:text-white mt-8 mb-4 first:mt-0">
                        {trimmedLine}
                      </h4>
                    )
                  }
                  // Style bullet points
                  if (trimmedLine.startsWith('-')) {
                    return (
                      <div key={index} className="flex items-start gap-3 pl-2 mb-2">
                        <span className="text-luxury-gold text-xl mt-1 font-bold flex-shrink-0">•</span>
                        <span className="flex-1 leading-relaxed">{trimmedLine.substring(1).trim()}</span>
                      </div>
                    )
                  }
                  // Regular paragraphs
                  if (trimmedLine.length > 0) {
                    return (
                      <p key={index} className="mb-6 leading-relaxed last:mb-0">
                        {trimmedLine}
                      </p>
                    )
                  }
                  // Empty lines for spacing
                  return <div key={index} className="h-4" />
                })}
              </div>
            </div>

            {aboutLines.length > ABOUT_MAX_LINES && (
              <div className="mt-8 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllAbout((v) => !v)}
                  className="btn-secondary"
                  aria-expanded={showAllAbout}
                >
                  {showAllAbout ? 'Show less' : 'Show more'}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Policies */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-4xl mx-auto mt-16 grid md:grid-cols-2 gap-8"
        >
          <div className="bg-white dark:bg-[#1d1d1b] border border-gray-100 dark:border-white/7 p-8">
            <h4 className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-luxury-gold mb-5">
              Check-in & Check-out
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-semibold">Check-in:</span> {propertyConfig.policies.checkIn}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Check-out:</span> {propertyConfig.policies.checkOut}
            </p>
          </div>
          <div className="bg-white dark:bg-[#1d1d1b] border border-gray-100 dark:border-white/7 p-8">
            <h4 className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-luxury-gold mb-5">
              Cancellation Policy
            </h4>
            <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">{propertyConfig.policies.cancellation}</p>
          </div>
        </motion.div>

        {/* House Rules */}
        {propertyConfig.policies.houseRules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="max-w-4xl mx-auto mt-8"
          >
            <h4 className="text-xl font-serif font-semibold mb-4 text-luxury-dark dark:text-white">
              House Rules
            </h4>
            <ul className="grid md:grid-cols-2 gap-3">
              {propertyConfig.policies.houseRules.map((rule, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <span className="text-luxury-gold mt-1">✓</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </section>
  )
}





