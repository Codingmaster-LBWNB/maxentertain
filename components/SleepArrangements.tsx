'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const BASE = '/Airbnb picture/1975 Point Nepean Road- HD/'

const BEDROOMS = [
  { name: 'Master Bedroom', photo: BASE + 'Master Bedroom.jpg', beds: '1 King bed · 1 Double sofa bed', sleeps: 3, icons: ['king_bed', 'weekend'] },
  { name: 'Bedroom 2',      photo: BASE + 'Bedroom2.jpg',       beds: '1 King bed · 1 Double sofa bed', sleeps: 3, icons: ['king_bed', 'weekend'] },
  { name: 'Bedroom 3',      photo: BASE + 'Bedroom3.jpg',       beds: '1 King bed',                      sleeps: 2, icons: ['king_bed'] },
  { name: 'Bedroom 4',      photo: BASE + 'Bedroom4.jpg',       beds: '1 King bed',                      sleeps: 2, icons: ['king_bed'] },
  { name: 'Bedroom 5',      photo: BASE + 'Bedroom5.jpg',       beds: '2 Bunk beds · each sleeps 3 (children welcome)', sleeps: 6, icons: ['bento', 'bento'] },
  { name: 'Bedroom 6',      photo: BASE + 'Bedroom6.jpg',       beds: '2 Single beds',                   sleeps: 2, icons: ['single_bed', 'single_bed'] },
]

export default function SleepArrangements() {
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

        {/* Embedded room cards (no lightbox/carousel) */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BEDROOMS.map((room, i) => (
            <motion.div
              key={room.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <div
                className="relative overflow-hidden rounded-2xl h-full"
                style={{
                  border: '1px solid rgba(212,175,55,0.18)',
                  boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                  background: 'linear-gradient(160deg,#fff,#fafaf7)',
                }}
              >
                <div
                  className="h-px w-full"
                  style={{ background: 'linear-gradient(90deg,transparent,#D4AF37 35%,#D4AF37 65%,transparent)' }}
                />
                <div
                  className="hidden dark:block absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: 'linear-gradient(160deg,#1a1810,#111008)', zIndex: 0 }}
                />

                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <Image
                    src={room.photo}
                    alt={room.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-sans"
                    style={{ background: 'rgba(212,175,55,0.92)', color: '#1a1400', backdropFilter: 'blur(6px)' }}
                  >
                    <span className="material-icons" style={{ fontSize: '13px' }}>person</span>
                    Sleeps {room.sleeps}
                  </div>
                </div>

                <div className="relative z-10 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif font-semibold text-base text-luxury-dark dark:text-white">{room.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {room.icons.map((icon, idx) => (
                      <div
                        key={`${room.name}-${icon}-${idx}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.22)' }}
                      >
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

    </section>
  )
}
