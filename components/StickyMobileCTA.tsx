'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { trackClick } from '@/lib/analytics'

export default function StickyMobileCTA() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  // Only reveal after the user scrolls past (roughly) the hero / first screen.
  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.85)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Don't show the guest booking CTA on admin pages.
  if (pathname?.startsWith('/maxowner')) return null

  return (
    <>
      {/* Spacer at the end of the page so the fixed bar never covers content */}
      <div aria-hidden className="h-20 md:hidden" />

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0f0f0d]/95 px-4 py-3 shadow-2xl backdrop-blur transition-all duration-300 md:hidden ${
          visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
        }`}
      >
        <Link
          href="/#calendar"
          onClick={() => trackClick('Check Dates', { location: 'Sticky Mobile CTA' })}
          className="btn-primary flex w-full items-center justify-center gap-2"
        >
          <span className="material-icons" style={{ fontSize: 16 }}>calendar_today</span>
          Check Dates &amp; Book Direct
        </Link>
      </div>
    </>
  )
}
