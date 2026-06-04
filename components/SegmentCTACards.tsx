'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const SEGMENTS = [
  {
    title: 'Family holidays',
    label: 'Multi-generational stays',
    description: 'Six bedrooms, five ensuites, cots, bunks, heated pool, theatre, games and beach access for grandparents, parents and kids.',
    icon: 'family_restroom',
    reviewFilter: 'families',
  },
  {
    title: 'Golf weekends',
    label: 'Peninsula golf base',
    description: 'Stay within easy reach of Moonah Links, The Dunes and The National, with room for 8-12 adults and proper shared spaces.',
    icon: 'golf_course',
    reviewFilter: 'golf',
  },
  {
    title: 'Corporate retreats',
    label: 'Offsites without hotel energy',
    description: 'Use the theatre, lounges, dining areas and beach walks for a private team reset 90 minutes from Melbourne.',
    icon: 'groups',
    reviewFilter: 'all',
  },
  {
    title: 'Milestone birthdays',
    label: 'Family celebrations',
    description: 'Perfect for 40th, 50th, 70th and 80th birthdays where everyone stays together without needing to leave the house.',
    icon: 'celebration',
    reviewFilter: 'celebrations',
  },
]

export default function SegmentCTACards() {
  return (
    <section id="guest-segments" className="section-padding bg-[#11100d] scroll-mt-24 md:scroll-mt-28">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="section-label">Plan Your Stay</span>
          <h2 className="heading-primary text-white">Built for the groups that book the Peninsula properly</h2>
          <p className="text-white/70 max-w-3xl mx-auto text-base md:text-lg">
            Choose the stay type that sounds like your group, read matching reviews, then check availability and book direct.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {SEGMENTS.map((segment, index) => (
            <motion.article
              key={segment.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl backdrop-blur-sm"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-luxury-gold/30 bg-luxury-gold/10 text-luxury-gold">
                <span className="material-icons" style={{ fontSize: 24 }}>{segment.icon}</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-luxury-gold">{segment.label}</p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-white">{segment.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-white/70">{segment.description}</p>
            </motion.article>
          ))}
        </div>

        {/* Single shared CTA for the whole section */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/#calendar"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <span className="material-icons" style={{ fontSize: 16 }}>calendar_today</span>
            Check dates
          </Link>
          <Link
            href="/#reviews"
            className="inline-flex items-center justify-center rounded-sm border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:border-luxury-gold hover:text-luxury-gold"
          >
            Read guest reviews
          </Link>
        </div>
      </div>
    </section>
  )
}
