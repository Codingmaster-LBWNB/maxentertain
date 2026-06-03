'use client'

import { useState } from 'react'
import { faqs } from '@/lib/faqs'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={`flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      style={{ color: '#D4AF37' }}
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="section-padding" aria-labelledby="faq-heading">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="block text-luxury-gold text-sm font-sans font-semibold tracking-[0.22em] uppercase mb-3">
            FAQ
          </span>
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-serif font-bold text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className="rounded-xl border border-white/10 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-white/90 font-sans font-semibold text-base leading-snug">
                    {faq.q}
                  </span>
                  <ChevronIcon open={isOpen} />
                </button>

                {isOpen && (
                  <div
                    className="px-5 pb-5 text-white/70 font-sans text-base leading-relaxed"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
