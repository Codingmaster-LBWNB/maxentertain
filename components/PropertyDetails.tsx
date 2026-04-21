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

        {/* Property Stats — 3 distinct floating cards */}
        <div className="grid grid-cols-3 gap-4 md:gap-5 mb-20">
          {details.map((detail, index) => {
            const themes = [
              {
                // Bedrooms — warm amber
                bg: 'linear-gradient(145deg, #fefce8 0%, #fef9c3 60%, #fef3c7 100%)',
                bgDark: 'linear-gradient(145deg, #1c1505 0%, #231a06 60%, #1c1505 100%)',
                border: 'rgba(217,119,6,0.3)',
                borderDark: 'rgba(217,119,6,0.25)',
                glow: 'rgba(245,158,11,0.12)',
                glowDark: 'rgba(217,119,6,0.2)',
                iconBg: 'rgba(245,158,11,0.15)',
                iconBgDark: 'rgba(217,119,6,0.2)',
                iconBorder: 'rgba(245,158,11,0.4)',
                iconColor: '#d97706',
                iconColorDark: '#f59e0b',
                numColor: '#92400e',
                numColorDark: '#fde68a',
                labelColor: '#b45309',
                labelColorDark: '#fbbf24',
                accentLine: 'rgba(245,158,11,0.5)',
              },
              {
                // Bathrooms — cool sapphire
                bg: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 60%, #f0f9ff 100%)',
                bgDark: 'linear-gradient(145deg, #05101a 0%, #081624 60%, #05101a 100%)',
                border: 'rgba(14,165,233,0.3)',
                borderDark: 'rgba(14,165,233,0.22)',
                glow: 'rgba(14,165,233,0.1)',
                glowDark: 'rgba(14,165,233,0.18)',
                iconBg: 'rgba(14,165,233,0.14)',
                iconBgDark: 'rgba(14,165,233,0.18)',
                iconBorder: 'rgba(14,165,233,0.35)',
                iconColor: '#0284c7',
                iconColorDark: '#38bdf8',
                numColor: '#075985',
                numColorDark: '#bae6fd',
                labelColor: '#0369a1',
                labelColorDark: '#7dd3fc',
                accentLine: 'rgba(14,165,233,0.5)',
              },
              {
                // Max Guests — luxury gold
                bg: 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 60%, #fffbeb 100%)',
                bgDark: 'linear-gradient(145deg, #130f02 0%, #1a1403 60%, #130f02 100%)',
                border: 'rgba(212,175,55,0.35)',
                borderDark: 'rgba(212,175,55,0.28)',
                glow: 'rgba(212,175,55,0.12)',
                glowDark: 'rgba(212,175,55,0.22)',
                iconBg: 'rgba(212,175,55,0.15)',
                iconBgDark: 'rgba(212,175,55,0.2)',
                iconBorder: 'rgba(212,175,55,0.45)',
                iconColor: '#92700a',
                iconColorDark: '#D4AF37',
                numColor: '#78350f',
                numColorDark: '#fde68a',
                labelColor: '#92700a',
                labelColorDark: '#D4AF37',
                accentLine: 'rgba(212,175,55,0.55)',
              },
            ]
            const t = themes[index]!

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.15 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="relative group cursor-default"
              >
                {/* Light mode card */}
                <div
                  className="relative overflow-hidden rounded-2xl flex flex-col items-center text-center px-3 md:px-6 py-8 md:py-10 dark:hidden"
                  style={{
                    background: t.bg,
                    border: `1px solid ${t.border}`,
                    boxShadow: `0 4px 24px ${t.glow}, 0 1px 0 rgba(255,255,255,0.8) inset`,
                  }}
                >
                  <div className="absolute top-0 left-[20%] right-[20%] h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${t.accentLine}, transparent)` }} />

                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 md:mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: t.iconBg, border: `1px solid ${t.iconBorder}` }}
                  >
                    <span className="material-icons" style={{ fontSize: '20px', color: t.iconColor }}>{detail.icon}</span>
                  </div>

                  <div
                    className="text-3xl md:text-5xl font-serif font-bold leading-none mb-2"
                    style={{ color: t.numColor }}
                  >
                    {detail.value}
                  </div>

                  <div
                    className="text-[9px] md:text-[10px] font-sans font-bold tracking-[0.2em] uppercase"
                    style={{ color: t.labelColor }}
                  >
                    {detail.label}
                  </div>
                </div>

                {/* Dark mode card */}
                <div
                  className="relative overflow-hidden rounded-2xl flex-col items-center text-center px-3 md:px-6 py-8 md:py-10 hidden dark:flex"
                  style={{
                    background: t.bgDark,
                    border: `1px solid ${t.borderDark}`,
                    boxShadow: `0 4px 32px ${t.glowDark}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                  }}
                >
                  <div className="absolute top-0 left-[20%] right-[20%] h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${t.accentLine}, transparent)` }} />

                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 md:mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: t.iconBgDark, border: `1px solid ${t.iconBorder}` }}
                  >
                    <span className="material-icons" style={{ fontSize: '20px', color: t.iconColorDark }}>{detail.icon}</span>
                  </div>

                  <div
                    className="text-3xl md:text-5xl font-serif font-bold leading-none mb-2"
                    style={{ color: t.numColorDark }}
                  >
                    {detail.value}
                  </div>

                  <div
                    className="text-[9px] md:text-[10px] font-sans font-bold tracking-[0.2em] uppercase"
                    style={{ color: t.labelColorDark }}
                  >
                    {detail.label}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

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





