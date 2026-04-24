'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const BASE = '/Airbnb picture/1975 Point Nepean Road- HD/'

const BEDROOMS = [
  {
    name: 'Master Bedroom',
    photo: BASE + 'Master Bedroom.jpg',
    beds: '1 King bed · 1 Double sofa bed',
    sleeps: 3,
    icons: ['king_bed', 'weekend'],
  },
  {
    name: 'Bedroom 2',
    photo: BASE + 'Bedroom2.jpg',
    beds: '1 King bed · 1 Double sofa bed',
    sleeps: 3,
    icons: ['king_bed', 'weekend'],
  },
  {
    name: 'Bedroom 3',
    photo: BASE + 'Bedroom3.jpg',
    beds: '1 King bed',
    sleeps: 2,
    icons: ['king_bed'],
  },
  {
    name: 'Bedroom 4',
    photo: BASE + 'Bedroom4.jpg',
    beds: '1 King bed',
    sleeps: 2,
    icons: ['king_bed'],
  },
  {
    name: 'Bedroom 5',
    photo: BASE + 'Bedroom5.jpg',
    beds: '2 Bunk beds · each sleeps 3 (children welcome)',
    sleeps: 6,
    icons: ['bento', 'bento'],
  },
  {
    name: 'Bedroom 6',
    photo: BASE + 'Bedroom6.jpg',
    beds: '2 Single beds',
    sleeps: 2,
    icons: ['single_bed', 'single_bed'],
  },
]

export default function SleepArrangements() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const savedScroll = useRef(0)

  // Lightbox keyboard nav
  useEffect(() => {
    if (activeIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null)
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i !== null ? Math.min(i + 1, BEDROOMS.length - 1) : null))
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i !== null ? Math.max(i - 1, 0) : null))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex])

  // Scroll lock when lightbox open — only apply/save on first open, not on bedroom navigation
  useEffect(() => {
    if (activeIndex !== null) {
      if (document.body.style.position !== 'fixed') {
        savedScroll.current = window.scrollY
        document.body.style.overflow = 'hidden'
        document.body.style.top = `-${savedScroll.current}px`
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
      }
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, savedScroll.current)
    }
  }, [activeIndex])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' })
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]!.clientX
    touchStartY.current = e.touches[0]!.clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0]!.clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0]!.clientY - touchStartY.current)
    if (Math.abs(dx) < 55 || dy > Math.abs(dx)) return
    if (dx < 0) setActiveIndex((i) => (i !== null ? Math.min(i + 1, BEDROOMS.length - 1) : null))
    else setActiveIndex((i) => (i !== null ? Math.max(i - 1, 0) : null))
  }

  return (
    <section id="sleep" className="section-padding bg-[#fafaf8] dark:bg-[#0f0e0b] scroll-mt-24 md:scroll-mt-28">
      <div className="container-custom">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="section-label">Rest</span>
          <h2 className="heading-primary">Sleep Arrangements</h2>
          <p className="text-luxury max-w-xl mx-auto">
            Six bedrooms configured for families of every size — from couples to multigenerational gatherings.
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-12 bg-luxury-gold/60" />
            <div className="w-1.5 h-1.5 bg-luxury-gold rotate-45" />
            <div className="h-px w-12 bg-luxury-gold/60" />
          </div>
        </motion.div>

        {/* Carousel wrapper */}
        <div className="relative group/carousel">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
            style={{ background: 'rgba(212,175,55,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
          >
            <span className="material-icons text-white" style={{ fontSize: '20px' }}>chevron_left</span>
          </button>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
            style={{ background: 'rgba(212,175,55,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
          >
            <span className="material-icons text-white" style={{ fontSize: '20px' }}>chevron_right</span>
          </button>

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4"
            style={{
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {BEDROOMS.map((room, i) => (
              <motion.div
                key={room.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="flex-shrink-0 cursor-pointer group/card"
                style={{ scrollSnapAlign: 'start', width: '300px' }}
                onClick={() => setActiveIndex(i)}
              >
                <div
                  className="relative overflow-hidden rounded-2xl h-full"
                  style={{
                    border: '1px solid rgba(212,175,55,0.18)',
                    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                    background: 'linear-gradient(160deg,#fff,#fafaf7)',
                  }}
                >
                  {/* Gold hairline top */}
                  <div className="h-px w-full flex-shrink-0"
                    style={{ background: 'linear-gradient(90deg,transparent,#D4AF37 35%,#D4AF37 65%,transparent)' }} />

                  {/* Dark mode bg */}
                  <div className="hidden dark:block absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: 'linear-gradient(160deg,#1a1810,#111008)', zIndex: 0 }} />

                  {/* Photo */}
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <Image
                      src={room.photo}
                      alt={room.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
                      sizes="300px"
                    />
                    {/* Sleeps badge */}
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-sans"
                      style={{ background: 'rgba(212,175,55,0.92)', color: '#1a1400', backdropFilter: 'blur(6px)' }}
                    >
                      <span className="material-icons" style={{ fontSize: '13px' }}>person</span>
                      Sleeps {room.sleeps}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="relative z-10 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif font-semibold text-base text-luxury-dark dark:text-white">
                        {room.name}
                      </h3>
                      <span className="material-icons text-luxury-gold/50 group-hover/card:text-luxury-gold transition-colors" style={{ fontSize: '18px' }}>
                        open_in_full
                      </span>
                    </div>

                    {/* Bed icons */}
                    <div className="flex items-center gap-2 mb-3">
                      {room.icons.map((icon, idx) => (
                        <div key={idx} className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.22)' }}>
                          <span className="material-icons text-luxury-gold" style={{ fontSize: '15px' }}>{icon}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 font-sans leading-relaxed">
                      {room.beds}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500 font-sans"
        >
          <span className="material-icons align-middle mr-1 text-luxury-gold/50" style={{ fontSize: '14px' }}>info</span>
          Additional air mattresses and portable bunk beds available on request — just mention it in your enquiry.
        </motion.p>
      </div>

      {/* ── Lightbox ── */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[200] flex flex-col"
          style={{ background: 'rgba(8,8,7,0.97)' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-xs font-sans tracking-[0.18em] uppercase text-white/30">
              Sleep Arrangements
            </div>
            <div className="text-xs font-sans text-white/30">
              {activeIndex + 1} / {BEDROOMS.length}
            </div>
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              aria-label="Close"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 relative flex items-center justify-center px-4 py-4 min-h-0">
            {/* Prev */}
            <button
              type="button"
              onClick={() => setActiveIndex((i) => Math.max((i ?? 0) - 1, 0))}
              disabled={activeIndex === 0}
              aria-label="Previous"
              className="hidden md:flex absolute left-4 z-10 w-11 h-11 rounded-full items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
            >
              <span className="material-icons" style={{ fontSize: '26px' }}>chevron_left</span>
            </button>

            <div className="relative w-full h-full max-w-4xl">
              <Image
                src={BEDROOMS[activeIndex]!.photo}
                alt={BEDROOMS[activeIndex]!.name}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Next */}
            <button
              type="button"
              onClick={() => setActiveIndex((i) => Math.min((i ?? 0) + 1, BEDROOMS.length - 1))}
              disabled={activeIndex === BEDROOMS.length - 1}
              aria-label="Next"
              className="hidden md:flex absolute right-4 z-10 w-11 h-11 rounded-full items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
            >
              <span className="material-icons" style={{ fontSize: '26px' }}>chevron_right</span>
            </button>
          </div>

          {/* Bottom bar */}
          <div className="flex-shrink-0 px-5 py-4 text-center"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="font-serif text-white text-lg font-semibold">
              {BEDROOMS[activeIndex]!.name}
            </div>
            <div className="text-sm text-white/40 font-sans mt-1">
              {BEDROOMS[activeIndex]!.beds} · Sleeps {BEDROOMS[activeIndex]!.sleeps}
            </div>

            {/* Mobile prev/next */}
            <div className="flex items-center justify-center gap-6 mt-4 md:hidden">
              <button
                type="button"
                onClick={() => setActiveIndex((i) => Math.max((i ?? 0) - 1, 0))}
                disabled={activeIndex === 0}
                className="flex items-center gap-1 text-sm text-white/50 disabled:opacity-20"
              >
                <span className="material-icons" style={{ fontSize: '18px' }}>chevron_left</span> Prev
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => Math.min((i ?? 0) + 1, BEDROOMS.length - 1))}
                disabled={activeIndex === BEDROOMS.length - 1}
                className="flex items-center gap-1 text-sm text-white/50 disabled:opacity-20"
              >
                Next <span className="material-icons" style={{ fontSize: '18px' }}>chevron_right</span>
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {BEDROOMS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to ${BEDROOMS[i]!.name}`}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i === activeIndex ? '#D4AF37' : 'rgba(255,255,255,0.2)' }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
