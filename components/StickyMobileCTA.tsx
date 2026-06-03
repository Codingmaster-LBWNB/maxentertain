'use client'

import Link from 'next/link'
import { trackClick } from '@/lib/analytics'

export default function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0f0f0d]/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden">
      <Link
        href="/#calendar"
        onClick={() => trackClick('Check Dates', { location: 'Sticky Mobile CTA' })}
        className="btn-primary flex w-full items-center justify-center gap-2"
      >
        <span className="material-icons" style={{ fontSize: 16 }}>calendar_today</span>
        Check Dates &amp; Book Direct
      </Link>
    </div>
  )
}
