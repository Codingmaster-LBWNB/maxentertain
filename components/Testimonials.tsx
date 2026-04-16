'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { propertyConfig } from '@/config/property'
import AwardBanner from '@/components/AwardBanner'

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function renderHighlightedText(text: string, keywords?: string[]) {
  const cleaned = (keywords ?? [])
    .map((k) => k.trim())
    .filter(Boolean)

  if (cleaned.length === 0) return text

  // Longer keywords first to avoid partial matches pre-empting longer phrases.
  const sorted = [...cleaned].sort((a, b) => b.length - a.length)
  const pattern = sorted.map(escapeRegExp).join('|')
  const re = new RegExp(`(${pattern})`, 'gi')

  const parts = text.split(re)
  return parts.map((part, i) => {
    const isHit = sorted.some((k) => k.toLowerCase() === part.toLowerCase())
    return isHit ? (
      <span key={i} className="font-semibold text-gray-900 dark:text-luxury-gold not-italic">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  })
}

export default function Testimonials() {
  const [isExpandedMobile, setIsExpandedMobile] = useState(false)
  const testimonials = propertyConfig.testimonials
  const firstFour = testimonials.slice(0, 4)
  const rest = testimonials.slice(4)

  const ReviewCard = ({ testimonial, index }: { testimonial: (typeof testimonials)[number]; index: number }) => (
    <motion.div
      key={`${testimonial.name}-${testimonial.date}-${index}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: (index % 3) * 0.1 }}
      className="bg-white dark:bg-[#1d1d1b] border border-gray-100 dark:border-white/7 p-8 hover:border-luxury-gold/30 dark:hover:border-luxury-gold/25 hover:shadow-md transition-all"
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-5">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <span key={i} className="material-icons text-luxury-gold" style={{ fontSize: '14px' }}>star</span>
        ))}
      </div>
      {/* Large quote mark */}
      <div className="text-6xl font-serif text-luxury-gold/20 leading-none mb-2 select-none">&ldquo;</div>
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-light text-base italic -mt-4">
        {renderHighlightedText(testimonial.comment, testimonial.highlight)}
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-50 dark:border-white/5">
        <div className="w-8 h-8 bg-luxury-gold/10 flex items-center justify-center flex-shrink-0">
          <span className="material-icons text-luxury-gold/60" style={{ fontSize: '16px' }}>person</span>
        </div>
        <div>
          <p className="text-xs font-sans font-semibold tracking-[0.15em] uppercase text-luxury-dark dark:text-white">{testimonial.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{testimonial.date}</p>
        </div>
      </div>
    </motion.div>
  )

  return (
    <section id="testimonials" className="section-padding bg-[#fafaf8] star-section scroll-mt-24 md:scroll-mt-28">
      <div className="container-custom">
        {/* Keep #award anchor working, but visually combine Award + Reviews */}
        <div id="award" className="mb-16">
          <AwardBanner embedded />
        </div>

        <div className="text-center mb-16">
          <span className="section-label">Testimonials</span>
          <h2 className="heading-primary">Guest Reviews</h2>
          <p className="text-luxury">
            See what our guests have to say about their stay
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {firstFour.map((testimonial, index) => (
            <ReviewCard key={`${testimonial.name}-${testimonial.date}-${index}`} testimonial={testimonial} index={index} />
          ))}

          {/* Desktop always shows all reviews; mobile shows the rest when expanded */}
          <div className={isExpandedMobile ? 'contents' : 'hidden md:contents'}>
            {rest.map((testimonial, index) => (
              <ReviewCard
                key={`${testimonial.name}-${testimonial.date}-${index + 4}`}
                testimonial={testimonial}
                index={index + 4}
              />
            ))}
          </div>
        </div>

        {/* Mobile: fold extra reviews behind a toggle */}
        {rest.length > 0 && (
          <div className="mt-10 md:hidden flex justify-center">
            <button
              type="button"
              onClick={() => setIsExpandedMobile((v) => !v)}
              className="btn-secondary px-8 py-3"
              aria-expanded={isExpandedMobile}
            >
              {isExpandedMobile ? 'Show fewer reviews' : `Show ${rest.length} more reviews`}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

