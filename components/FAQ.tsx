'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { faqs } from '@/lib/faqs'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="flex-shrink-0"
      style={{ color: '#D4AF37' }}
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section
      id="faq"
      className="section-padding scroll-mt-24 md:scroll-mt-28"
      style={{ background: 'linear-gradient(180deg, #0f0e0b 0%, #0d0c09 100%)' }}
      aria-labelledby="faq-heading"
    >
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="section-label">FAQ</span>
          <h2 id="faq-heading" className="heading-primary text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-white/65 font-sans text-base md:text-lg max-w-xl mx-auto">
            Everything you need to know before booking
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-12 bg-luxury-gold/50" />
            <div className="w-1.5 h-1.5 bg-luxury-gold rotate-45" />
            <div className="h-px w-12 bg-luxury-gold/50" />
          </div>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.04, 0.24) }}
                className="rounded-xl overflow-hidden"
                style={{
                  background: isOpen
                    ? 'linear-gradient(145deg, rgba(212,175,55,0.08) 0%, rgba(255,255,255,0.04) 100%)'
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isOpen ? 'rgba(212,175,55,0.28)' : 'rgba(255,255,255,0.09)'}`,
                  transition: 'background 0.3s ease, border-color 0.3s ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="text-white/90 font-sans font-semibold text-[17px] leading-snug group-hover:text-white transition-colors duration-200">
                    {faq.q}
                  </span>
                  <ChevronIcon open={isOpen} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        className="px-6 pb-6 text-white/70 font-sans text-base leading-relaxed"
                        style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}
                      >
                        <p className="pt-4">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
