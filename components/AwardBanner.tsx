'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { propertyConfig } from '@/config/property'

/* ── Laurel / trophy icon ──────────────────────────────── */
function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V18H9v2h6v-2h-2v-2.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
    </svg>
  )
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
    </svg>
  )
}

/* ── Animated shine sweep ──────────────────────────────── */
function ShineSweep() {
  return (
    <motion.div
      className="absolute inset-y-0 w-24 pointer-events-none"
      style={{
        background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.22) 50%, transparent 80%)',
        left: '-15%',
      }}
      animate={{ left: ['−15%', '115%'] }}
      transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
    />
  )
}

/* ── Floating sparkle dot ──────────────────────────────── */
function FloatDot({ x, y, size, color, delay }: {
  x: number; y: number; size: number; color: string; delay: number
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
      animate={{ y: [-5, 5, -5], opacity: [0.15, 0.6, 0.15] }}
      transition={{ duration: 3.5, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

/* ── Award card ────────────────────────────────────────── */
interface AwardCardProps {
  award: { title: string; year: string; category: string; image?: string }
  index: number
  total: number
}

function AwardCard({ award, index }: AwardCardProps) {
  const isBooking = /booking/i.test(award.title)

  const theme = isBooking
    ? {
        // Booking.com — royal blue
        outerBg: 'linear-gradient(145deg, #001d52 0%, #003580 50%, #001d52 100%)',
        outerBorder: 'rgba(0,135,255,0.4)',
        outerShadow: '0 30px 80px rgba(0,53,128,0.6), 0 0 0 1px rgba(0,135,255,0.15)',
        innerBg: '#003580',
        topLine: 'rgba(59,130,246,0.9)',
        badge: { bg: 'rgba(0,135,255,0.2)', border: 'rgba(59,130,246,0.4)', text: '#93c5fd' },
        year: { bg: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.7)' },
        categoryColor: 'rgba(147,197,253,0.85)',
        cornerDot: 'rgba(59,130,246,0.6)',
      }
    : {
        // Airbnb — warm coral/rose
        outerBg: 'linear-gradient(145deg, #2d0a0a 0%, #5c1e1e 50%, #2d0a0a 100%)',
        outerBorder: 'rgba(251,113,133,0.35)',
        outerShadow: '0 30px 80px rgba(220,38,38,0.3), 0 0 0 1px rgba(251,113,133,0.12)',
        innerBg: '#fff',
        topLine: 'rgba(251,113,133,0.9)',
        badge: { bg: 'rgba(239,68,68,0.18)', border: 'rgba(251,113,133,0.4)', text: '#fca5a5' },
        year: { bg: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.6)' },
        categoryColor: 'rgba(252,165,165,0.85)',
        cornerDot: 'rgba(251,113,133,0.6)',
      }

  const dots = [
    { x: 8, y: 10, size: 4, delay: 0 },
    { x: 88, y: 8, size: 3, delay: 0.7 },
    { x: 92, y: 82, size: 4, delay: 1.3 },
    { x: 6, y: 85, size: 3, delay: 0.4 },
    { x: 50, y: 5, size: 2, delay: 1 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.18, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="relative group cursor-default"
    >
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: theme.outerBg,
          border: `1px solid ${theme.outerBorder}`,
          boxShadow: theme.outerShadow,
        }}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-[10%] right-[10%] h-px z-10"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.topLine}, transparent)` }}
        />

        {/* Floating dots */}
        {dots.map((d, i) => (
          <FloatDot key={i} {...d} color={theme.cornerDot} />
        ))}

        {/* Animated shine sweep on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ShineSweep />
        </div>

        <div className="relative z-10 p-5 md:p-6 flex flex-col gap-4">
          {/* Header row: platform badge + year */}
          <div className="flex items-center justify-between gap-3">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-sans font-bold tracking-[0.15em] uppercase"
              style={{
                background: theme.badge.bg,
                border: `1px solid ${theme.badge.border}`,
                color: theme.badge.text,
              }}
            >
              <TrophyIcon className="w-2.5 h-2.5" />
              {isBooking ? 'Booking.com' : 'Airbnb'}
            </div>
            <span
              className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: theme.year.bg, color: theme.year.text }}
            >
              {award.year}
            </span>
          </div>

          {/* Award image */}
          <div
            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden"
            style={{ background: theme.innerBg }}
          >
            <Image
              src={award.image!}
              alt={`${award.title} ${award.year} — ${award.category}`}
              fill
              className="object-contain p-3"
              quality={95}
              sizes="(min-width: 768px) 40vw, 90vw"
            />
          </div>

          {/* Footer: title + category */}
          <div className="space-y-1">
            <p
              className="text-[11px] font-sans font-bold tracking-[0.14em] uppercase"
              style={{ color: theme.categoryColor }}
            >
              {award.category}
            </p>
            <p className="text-xs font-sans" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {award.title}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Section ────────────────────────────────────────────── */
export default function AwardBanner({ embedded = false }: { embedded?: boolean }) {
  const awards = (propertyConfig.awards ?? []).filter((a) => Boolean(a.image)).slice(0, 2)
  if (awards.length === 0) return null

  const content = (
    <div className="flex flex-col items-center">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center mb-10 md:mb-14"
      >
        {/* Trophy badge */}
        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08))',
            border: '1px solid rgba(212,175,55,0.3)',
          }}
        >
          <TrophyIcon className="w-3.5 h-3.5 text-luxury-gold" />
          <span
            className="text-[10px] font-sans font-bold tracking-[0.22em] uppercase"
            style={{ color: '#D4AF37' }}
          >
            Award Recognition
          </span>
          <TrophyIcon className="w-3.5 h-3.5 text-luxury-gold" />
        </div>

        <h2 className="heading-primary mb-3">Industry Recognised</h2>

        {/* Animated sparkle row */}
        <div className="flex items-center gap-3">
          <div className="h-px w-10 bg-luxury-gold/40" />
          {[0, 0.15, 0.3].map((delay, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay, ease: 'easeInOut' }}
            >
              <SparkleIcon className="w-2.5 h-2.5 text-luxury-gold" />
            </motion.div>
          ))}
          <div className="h-px w-10 bg-luxury-gold/40" />
        </div>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 font-sans max-w-sm leading-relaxed">
          Recognised by the world&apos;s leading travel platforms for outstanding guest experiences
        </p>
      </motion.div>

      {/* Award cards grid */}
      <div className={`w-full max-w-3xl grid gap-5 md:gap-6 ${awards.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1 max-w-sm'}`}>
        {awards.map((award, idx) => (
          <AwardCard key={`${award.title}-${idx}`} award={award} index={idx} total={awards.length} />
        ))}
      </div>
    </div>
  )

  if (embedded) return content

  return (
    <section
      id="award"
      className="py-12 md:py-16 scroll-mt-24 md:scroll-mt-28 bg-white dark:bg-[#0f0f0e] star-section"
    >
      <div className="container-custom px-4">{content}</div>
    </section>
  )
}
