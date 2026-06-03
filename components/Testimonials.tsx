'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { propertyConfig } from '@/config/property'
import AwardBanner from '@/components/AwardBanner'
import { useSectionTime } from '@/hooks/useSectionTime'
import SectionWavesBackground from '@/components/SectionWavesBackground'

type ReviewFilter = 'all' | 'families' | 'golf' | 'celebrations'

const FILTERS: { id: ReviewFilter; label: string }[] = [
  { id: 'all', label: 'All reviews' },
  { id: 'families', label: 'Families' },
  { id: 'golf', label: 'Golf groups' },
  { id: 'celebrations', label: 'Celebrations' },
]

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
      <span key={i} className="font-semibold text-luxury-gold not-italic">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  })
}

export default function Testimonials() {
  const sectionRef = useSectionTime('Reviews')
  const [isExpandedMobile, setIsExpandedMobile] = useState(false)
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>('all')
  const testimonials = propertyConfig.testimonials

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requested = params.get('guestType') as ReviewFilter | null
    if (requested && FILTERS.some((filter) => filter.id === requested)) {
      setActiveFilter(requested)
      setIsExpandedMobile(true)
    }
  }, [])

  const matchesFilter = (testimonial: (typeof testimonials)[number]) => {
    if (activeFilter === 'all') return true
    const haystack = `${testimonial.comment} ${(testimonial.highlight ?? []).join(' ')}`.toLowerCase()
    if (activeFilter === 'golf') return /golf|golfer|course|moonah|dunes|national/.test(haystack)
    if (activeFilter === 'celebrations') return /birthday|celebrat|40th|50th|70th|80th|christmas|milestone/.test(haystack)
    return /family|families|children|kids|grandparent|grandma|grandchildren|three generations|large group|all ages/.test(haystack)
  }

  const filteredTestimonials = testimonials.filter(matchesFilter)
  const firstFour = filteredTestimonials.slice(0, 4)
  const rest = filteredTestimonials.slice(4)

  const ReviewCard = ({ testimonial, index }: { testimonial: (typeof testimonials)[number]; index: number }) => {
    const initial = testimonial.name.charAt(0).toUpperCase()
    return (
      <motion.div
        key={`${testimonial.name}-${testimonial.date}-${index}`}
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.09 }}
        className="group relative overflow-hidden rounded-2xl flex flex-col"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 18px 55px rgba(0,0,0,0.24)',
        }}
      >
        {/* Gold left accent bar */}
        <div className="absolute left-0 top-6 bottom-6 w-[2px] rounded-full"
          style={{ background: 'linear-gradient(180deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)' }} />

        {/* Hover border glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.3)' }} />

        <div className="p-7 pl-8 md:p-8 md:pl-9 flex flex-col flex-1">
          {/* Stars + rating */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex gap-0.5">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <span key={i} className="material-icons text-luxury-gold" style={{ fontSize: '16px' }}>star</span>
              ))}
            </div>
            <span className="text-xs font-sans font-bold tracking-[0.14em] text-luxury-gold uppercase ml-1">
              {testimonial.rating}.0
            </span>
          </div>

          {/* Decorative quote */}
          <div className="font-serif font-bold leading-none select-none mb-3"
            style={{ fontSize: '56px', color: 'rgba(212,175,55,0.15)', lineHeight: 1 }}>
            &ldquo;
          </div>

          {/* Review text */}
          <p className="text-white/85 leading-relaxed font-sans text-base md:text-[17px] flex-1 -mt-2 mb-7 italic">
            {renderHighlightedText(testimonial.comment, testimonial.highlight)}
          </p>

          {/* Author */}
          <div className="flex items-center gap-3 pt-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {/* Gold initial avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-serif font-bold text-base"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))',
                border: '1px solid rgba(212,175,55,0.35)',
                color: '#D4AF37',
              }}>
              {initial}
            </div>
            <div>
              <p className="text-sm font-sans font-semibold tracking-[0.14em] uppercase text-white/90">
                {testimonial.name}
              </p>
              <p className="text-sm text-white/65 font-sans mt-0.5">{testimonial.date}</p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="section-padding scroll-mt-24 md:scroll-mt-28 section-with-waves testimonials-transition-bridge"
      style={{ background: 'linear-gradient(180deg, #141208 0%, #0f0e0b 100%)' }}
    >
      <SectionWavesBackground variant="dark" className="testimonials-waves" />
      <div className="container-custom">
        {/* Keep #award anchor working, but visually combine Award + Reviews */}
        <div id="award" className="mb-16">
          <AwardBanner embedded />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label">Testimonials</span>
          <h2 className="heading-primary" style={{ color: '#fff' }}>Guest Reviews</h2>
          <p className="text-white/70 font-sans text-base md:text-lg max-w-xl mx-auto">
            See what our guests have to say about their stay
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-12 bg-luxury-gold/50" />
            <div className="w-1.5 h-1.5 bg-luxury-gold rotate-45" />
            <div className="h-px w-12 bg-luxury-gold/50" />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => {
                  setActiveFilter(filter.id)
                  setIsExpandedMobile(false)
                }}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                  activeFilter === filter.id
                    ? 'border-luxury-gold bg-luxury-gold text-black'
                    : 'border-white/15 text-white/70 hover:border-luxury-gold hover:text-luxury-gold'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </motion.div>

        {filteredTestimonials.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/70">
            No reviews match this filter yet.
          </div>
        ) : (
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
        )}

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

