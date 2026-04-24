'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const BASE = '/Airbnb picture/1975 Point Nepean Road- HD/'

const BEDROOMS = [
  { name: 'Master Bedroom', photo: BASE + 'Master Bedroom.jpg', beds: '1 King bed · 1 Double sofa bed', sleeps: 3, icons: ['king_bed', 'weekend'] },
  { name: 'Bedroom 2',      photo: BASE + 'Bedroom2.jpg',       beds: '1 King bed · 1 Double sofa bed', sleeps: 3, icons: ['king_bed', 'weekend'] },
  { name: 'Bedroom 3',      photo: BASE + 'Bedroom3.jpg',       beds: '1 King bed',                      sleeps: 2, icons: ['king_bed'] },
  { name: 'Bedroom 4',      photo: BASE + 'Bedroom4.jpg',       beds: '1 King bed',                      sleeps: 2, icons: ['king_bed'] },
  { name: 'Bedroom 5',      photo: BASE + 'Bedroom5.jpg',       beds: '2 Bunk beds · each sleeps 3 (children welcome)', sleeps: 6, icons: ['bento', 'bento'] },
  { name: 'Bedroom 6',      photo: BASE + 'Bedroom6.jpg',       beds: '2 Single beds',                   sleeps: 2, icons: ['single_bed', 'single_bed'] },
]

// ── Lightbox (portalled, uses shared layoutId for instant image transition) ──
function Lightbox({ index, onClose, onPrev, onNext }: {
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const room = BEDROOMS[index]!
  const touchX = useRef(0)
  const touchY = useRef(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowRight')  onNext()
      if (e.key === 'ArrowLeft')   onPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onNext, onPrev])

  return createPortal(
    <motion.div
      key="lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 flex flex-col"
      style={{ background: 'rgba(8,8,7,0.96)', zIndex: 9999 }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]!.clientX
        touchY.current = e.touches[0]!.clientY
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0]!.clientX - touchX.current
        const dy = Math.abs(e.changedTouches[0]!.clientY - touchY.current)
        if (Math.abs(dx) < 55 || dy > Math.abs(dx)) return
        if (dx < 0) onNext(); else onPrev()
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-xs font-sans tracking-[0.18em] uppercase text-white/40 select-none">
          Sleep Arrangements
        </span>
        <span className="text-xs font-sans text-white/40 select-none">
          {index + 1} / {BEDROOMS.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-sans font-semibold transition-all"
          style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.45)', color: '#D4AF37' }}
        >
          <span className="material-icons" style={{ fontSize: '16px' }}>close</span>
          Close
        </button>
      </div>

      {/* Image — layoutId matches the card, so framer-motion morphs between them */}
      <div className="flex-1 flex items-center justify-center min-h-0 px-14 md:px-20 py-4 relative">
        <button type="button" onClick={onPrev} disabled={index === 0} aria-label="Previous"
          className="absolute left-3 md:left-5 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
          <span className="material-icons" style={{ fontSize: '24px' }}>chevron_left</span>
        </button>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            layoutId={`bedroom-img-${index}`}
            className="relative w-full h-full max-w-4xl"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Image
              src={room.photo}
              alt={room.name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </motion.div>
        </AnimatePresence>

        <button type="button" onClick={onNext} disabled={index === BEDROOMS.length - 1} aria-label="Next"
          className="absolute right-3 md:right-5 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
          <span className="material-icons" style={{ fontSize: '24px' }}>chevron_right</span>
        </button>
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 px-5 py-4 text-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="font-serif text-white text-lg font-semibold">{room.name}</p>
        <p className="text-sm font-sans mt-1" style={{ color: 'rgba(212,175,55,0.75)' }}>{room.beds}</p>
        <p className="text-xs text-white/30 font-sans mt-0.5">Sleeps {room.sleeps}</p>

        {/* Mobile prev/next */}
        <div className="flex items-center justify-center gap-8 mt-4 md:hidden">
          <button type="button" onClick={onPrev} disabled={index === 0}
            className="flex items-center gap-1 text-sm font-sans text-white/50 disabled:opacity-20">
            <span className="material-icons" style={{ fontSize: '18px' }}>chevron_left</span> Prev
          </button>
          <button type="button" onClick={onNext} disabled={index === BEDROOMS.length - 1}
            className="flex items-center gap-1 text-sm font-sans text-white/50 disabled:opacity-20">
            Next <span className="material-icons" style={{ fontSize: '18px' }}>chevron_right</span>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {BEDROOMS.map((_, i) => (
            <motion.button
              key={i}
              type="button"
              aria-label={`Go to ${BEDROOMS[i]!.name}`}
              onClick={() => {
                const steps = i - index
                if (steps > 0) for (let s = 0; s < steps; s++) onNext()
                else for (let s = 0; s < -steps; s++) onPrev()
              }}
              animate={{ width: i === index ? 20 : 6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="h-1.5 rounded-full"
              style={{ background: i === index ? '#D4AF37' : 'rgba(255,255,255,0.2)' }}
            />
          ))}
        </div>
      </div>
    </motion.div>,
    document.body
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function SleepArrangements() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const savedScroll = useRef(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Scroll lock — only engage on first open, not while navigating between bedrooms
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

  const close = () => setActiveIndex(null)
  const prev  = () => setActiveIndex((i) => (i !== null && i > 0 ? i - 1 : i))
  const next  = () => setActiveIndex((i) => (i !== null && i < BEDROOMS.length - 1 ? i + 1 : i))

  const scrollCarousel = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' })

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

        {/* Carousel */}
        <div className="relative group/carousel">
          <button type="button" onClick={() => scrollCarousel('left')} aria-label="Scroll left"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
            style={{ background: 'rgba(212,175,55,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
            <span className="material-icons text-white" style={{ fontSize: '20px' }}>chevron_left</span>
          </button>
          <button type="button" onClick={() => scrollCarousel('right')} aria-label="Scroll right"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
            style={{ background: 'rgba(212,175,55,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
            <span className="material-icons text-white" style={{ fontSize: '20px' }}>chevron_right</span>
          </button>

          {/* touch-action: pan-x — browser handles only horizontal swipes here,
              vertical scroll passes through to the page (no interference on mobile) */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4"
            style={{
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              touchAction: 'pan-x',        // ← key fix: horizontal-only touch handling
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
                <div className="relative overflow-hidden rounded-2xl h-full"
                  style={{
                    border: '1px solid rgba(212,175,55,0.18)',
                    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                    background: 'linear-gradient(160deg,#fff,#fafaf7)',
                  }}>
                  <div className="h-px w-full" style={{ background: 'linear-gradient(90deg,transparent,#D4AF37 35%,#D4AF37 65%,transparent)' }} />
                  <div className="hidden dark:block absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: 'linear-gradient(160deg,#1a1810,#111008)', zIndex: 0 }} />

                  {/* layoutId ties this image to the lightbox for the shared-element morph */}
                  <motion.div
                    layoutId={`bedroom-img-${i}`}
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: '4/3' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <Image
                      src={room.photo}
                      alt={room.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
                      sizes="(max-width: 768px) 80vw, 300px"
                    />
                    {/* Sleeps badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-sans"
                      style={{ background: 'rgba(212,175,55,0.92)', color: '#1a1400', backdropFilter: 'blur(6px)' }}>
                      <span className="material-icons" style={{ fontSize: '13px' }}>person</span>
                      Sleeps {room.sleeps}
                    </div>
                    {/* Zoom hint */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
                      style={{ background: 'rgba(0,0,0,0.22)' }}>
                      <span className="material-icons text-white drop-shadow" style={{ fontSize: '32px' }}>zoom_in</span>
                    </div>
                  </motion.div>

                  <div className="relative z-10 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif font-semibold text-base text-luxury-dark dark:text-white">{room.name}</h3>
                      <span className="material-icons text-luxury-gold/40 group-hover/card:text-luxury-gold transition-colors" style={{ fontSize: '18px' }}>open_in_full</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {room.icons.map((icon, idx) => (
                        <div key={idx} className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.22)' }}>
                          <span className="material-icons text-luxury-gold" style={{ fontSize: '15px' }}>{icon}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-sans leading-relaxed">{room.beds}</p>
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

      {/* Lightbox — AnimatePresence enables the exit fade, layoutId drives the morph */}
      <AnimatePresence>
        {mounted && activeIndex !== null && (
          <Lightbox index={activeIndex} onClose={close} onPrev={prev} onNext={next} />
        )}
      </AnimatePresence>
    </section>
  )
}
