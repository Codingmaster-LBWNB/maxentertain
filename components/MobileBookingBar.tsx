'use client'

import Link from 'next/link'
import { trackClick } from '@/lib/analytics'

export default function MobileBookingBar() {
  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch min-h-[60px]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'linear-gradient(135deg, #1c1a14 0%, #0d0c09 100%)',
        borderTop: '1px solid rgba(212,175,55,0.25)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Check Availability */}
      <a
        href="#calendar"
        onClick={() => trackClick('Mobile Bar - Availability')}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:bg-white/5 tap-highlight-transparent"
      >
        <span className="material-icons" style={{ fontSize: '20px', color: 'rgba(255,255,255,0.55)' }}>
          event_available
        </span>
        <span
          className="font-sans font-bold tracking-widest uppercase"
          style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)' }}
        >
          Availability
        </span>
      </a>

      <div className="my-3" style={{ width: '1px', background: 'rgba(212,175,55,0.2)' }} />

      {/* Reviews */}
      <a
        href="#testimonials"
        onClick={() => trackClick('Mobile Bar - Reviews')}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:bg-white/5"
      >
        <span className="material-icons" style={{ fontSize: '20px', color: 'rgba(255,255,255,0.55)' }}>
          star
        </span>
        <span
          className="font-sans font-bold tracking-widest uppercase"
          style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)' }}
        >
          Reviews
        </span>
      </a>

      <div className="my-3" style={{ width: '1px', background: 'rgba(212,175,55,0.2)' }} />

      {/* Book Direct — highlighted */}
      <Link
        href="/inquiry"
        onClick={() => trackClick('Mobile Bar - Book Direct')}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:opacity-80"
        style={{ background: 'rgba(212,175,55,0.12)' }}
      >
        <span className="material-icons text-luxury-gold" style={{ fontSize: '20px' }}>
          calendar_today
        </span>
        <span
          className="font-sans font-bold tracking-widest uppercase text-luxury-gold"
          style={{ fontSize: '9px' }}
        >
          Book Direct
        </span>
      </Link>
    </div>
  )
}
