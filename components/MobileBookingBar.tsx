'use client'

import { usePathname } from 'next/navigation'
import { trackClick } from '@/lib/analytics'

export default function MobileBookingBar() {
  const pathname = usePathname()
  if (pathname?.startsWith('/maxowner')) return null

  return (
    <>
      {/* Spacer so content above is never hidden behind the fixed bar on mobile */}
      <div aria-hidden className="md:hidden" style={{ height: 'calc(60px + env(safe-area-inset-bottom))' }} />

      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch min-h-[60px]"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'linear-gradient(135deg, #1c1a14 0%, #0d0c09 100%)',
          borderTop: '1px solid rgba(212,175,55,0.25)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
        }}
      >
        <a
          href="/#calendar"
          onClick={() => trackClick('Mobile Bar - Availability')}
          className="flex-1 flex flex-col items-center justify-center gap-1 transition-all active:bg-white/5"
        >
          <span className="material-icons text-luxury-gold" style={{ fontSize: '22px' }}>
            event_available
          </span>
          <span
            className="font-sans font-bold tracking-widest uppercase text-luxury-gold"
            style={{ fontSize: '10px' }}
          >
            Check Availability
          </span>
        </a>
      </div>
    </>
  )
}
