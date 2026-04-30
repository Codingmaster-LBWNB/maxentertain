'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

/* ── Count-up hook ─────────────────────────────────────── */
function useCountUp(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setCount(target); return }
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, trigger])
  return count
}

/* ── SVG Icons ─────────────────────────────────────────── */
function StarFillIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function GlobeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
    </svg>
  )
}

/* ── Floating particle ──────────────────────────────────── */
function Particle({ x, y, size, color, delay, dur }: {
  x: number; y: number; size: number; color: string; delay: number; dur: number
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
      animate={{ y: [-6, 6, -6], opacity: [0.12, 0.45, 0.12] }}
      transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

/* ── Main component ─────────────────────────────────────── */
export default function StatsCards() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const reviews = useCountUp(120, 2200, inView)
  const guests  = useCountUp(1000, 2600, inView)

  const goldParticles = [
    { x: 14, y: 12, size: 3, delay: 0 },
    { x: 78, y: 18, size: 2, delay: 0.6 },
    { x: 30, y: 72, size: 2, delay: 1.1 },
    { x: 62, y: 65, size: 3, delay: 0.3 },
    { x: 88, y: 48, size: 2, delay: 0.9 },
    { x: 48, y: 22, size: 2, delay: 1.4 },
  ]

  const blueParticles = [
    { x: 18, y: 20, size: 3, delay: 0.2 },
    { x: 72, y: 14, size: 2, delay: 0.8 },
    { x: 40, y: 68, size: 2, delay: 0 },
    { x: 85, y: 55, size: 3, delay: 1.2 },
    { x: 55, y: 30, size: 2, delay: 0.5 },
    { x: 25, y: 45, size: 2, delay: 1.6 },
  ]

  return (
    <section ref={ref} className="relative py-12 md:py-16 bg-[#fafaf8] dark:bg-[#0f0f0e] star-section overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">

          {/* ── Reviews Card — Gold constellation ── */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative group cursor-default"
          >
            <div
              className="relative overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(145deg, #100f08 0%, #1c1802 55%, #100f08 100%)',
                border: '1px solid rgba(212,175,55,0.22)',
                boxShadow: '0 0 0 1px rgba(212,175,55,0.06), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.15)',
              }}
            >
              {/* Radial glow — intensifies on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.16) 0%, transparent 65%)' }}
              />

              {/* Top edge shimmer line */}
              <div className="absolute top-0 left-[12%] right-[12%] h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.7), transparent)' }} />

              {/* Floating gold particles */}
              {goldParticles.map((p, i) => (
                <Particle key={i} {...p} color="rgba(212,175,55,0.55)" dur={3 + i * 0.4} />
              ))}

              <div className="relative z-10 flex flex-col items-center text-center px-8 py-12 gap-4">
                {/* Icon halo */}
                <div
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: 'radial-gradient(circle at 40% 35%, rgba(212,175,55,0.22), rgba(212,175,55,0.05))',
                    border: '1px solid rgba(212,175,55,0.35)',
                    boxShadow: '0 0 18px rgba(212,175,55,0.18)',
                  }}
                >
                  <StarFillIcon className="w-5 h-5" style={{ color: '#D4AF37' }} />
                </div>

                {/* Counter */}
                <div className="flex items-start gap-0.5 leading-none">
                  <span
                    className="text-[64px] font-serif font-bold tabular-nums leading-none"
                    style={{
                      background: 'linear-gradient(155deg, #f8e96a 0%, #D4AF37 45%, #8a6a0a 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {reviews}
                  </span>
                  <span
                    className="text-3xl font-serif font-bold mt-3"
                    style={{ color: 'rgba(212,175,55,0.7)' }}
                  >+</span>
                </div>

                {/* Label */}
                <div className="space-y-2">
                  <div
                    className="text-sm font-sans font-bold tracking-[0.16em] uppercase"
                    style={{ color: '#D4AF37' }}
                  >
                    5‑Star Reviews
                  </div>
                  {/* Animated star row */}
                  <div className="flex items-center justify-center gap-1" aria-label="5 stars">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, rotate: -30 }}
                        animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                        transition={{ delay: 1.3 + i * 0.1, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                      >
                        <StarFillIcon className="w-3 h-3" style={{ color: '#D4AF37' }} />
                      </motion.div>
                    ))}
                  </div>
                </div>

                <p className="text-base leading-relaxed max-w-[240px]"
                  style={{ color: 'rgba(255,255,255,0.68)' }}>
                  Consistently praised by guests for exceptional stays
                </p>
              </div>

              {/* Bottom edge line */}
              <div className="absolute bottom-0 left-[12%] right-[12%] h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.18), transparent)' }} />
            </div>
          </motion.div>

          {/* ── Guests Card — Aurora blue ── */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="relative group cursor-default"
          >
            <div
              className="relative overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(145deg, #06090f 0%, #0b1322 55%, #06090f 100%)',
                border: '1px solid rgba(96,165,250,0.18)',
                boxShadow: '0 0 0 1px rgba(96,165,250,0.05), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(96,165,250,0.12)',
              }}
            >
              {/* Aurora sweep */}
              <motion.div
                className="absolute inset-x-0 top-0 h-52 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% -10%, rgba(96,165,250,0.3) 0%, rgba(139,92,246,0.15) 50%, transparent 70%)',
                }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Radial hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(96,165,250,0.14) 0%, transparent 65%)' }}
              />

              {/* Top edge shimmer line */}
              <div className="absolute top-0 left-[12%] right-[12%] h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.7), transparent)' }} />

              {/* Floating blue particles */}
              {blueParticles.map((p, i) => (
                <Particle key={i} {...p} color={i % 2 === 0 ? 'rgba(96,165,250,0.55)' : 'rgba(139,92,246,0.45)'} dur={3.2 + i * 0.35} />
              ))}

              <div className="relative z-10 flex flex-col items-center text-center px-8 py-12 gap-4">
                {/* Icon halo */}
                <div
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: 'radial-gradient(circle at 40% 35%, rgba(96,165,250,0.2), rgba(96,165,250,0.04))',
                    border: '1px solid rgba(96,165,250,0.3)',
                    boxShadow: '0 0 18px rgba(96,165,250,0.15)',
                  }}
                >
                  <GlobeIcon className="w-5 h-5" style={{ color: '#60a5fa' }} />
                </div>

                {/* Counter */}
                <div className="flex items-start gap-0.5 leading-none">
                  <span
                    className="text-[64px] font-serif font-bold tabular-nums leading-none"
                    style={{
                      background: 'linear-gradient(155deg, #e0f2fe 0%, #60a5fa 45%, #3b82f6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {guests.toLocaleString()}
                  </span>
                  <span
                    className="text-3xl font-serif font-bold mt-3 text-blue-400"
                    style={{ opacity: 0.7 }}
                  >+</span>
                </div>

                {/* Label */}
                <div className="space-y-2">
                  <div className="text-sm font-sans font-bold tracking-[0.16em] uppercase text-blue-200">
                    Guests Per Year
                  </div>
                  {/* Animated dot trail */}
                  <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
                    {[...Array(7)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="rounded-full"
                        style={{
                          width: i === 3 ? 9 : 5,
                          height: i === 3 ? 9 : 5,
                          background: i === 3
                            ? 'rgba(96,165,250,0.9)'
                            : `rgba(96,165,250,${0.15 + i * 0.08})`,
                        }}
                        initial={{ scale: 0 }}
                        animate={inView ? { scale: 1 } : {}}
                        transition={{ delay: 1.4 + i * 0.09, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-base leading-relaxed max-w-[240px]"
                  style={{ color: 'rgba(255,255,255,0.68)' }}>
                  Welcoming travellers from around the world
                </p>
              </div>

              {/* Bottom edge line */}
              <div className="absolute bottom-0 left-[12%] right-[12%] h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.18), transparent)' }} />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
