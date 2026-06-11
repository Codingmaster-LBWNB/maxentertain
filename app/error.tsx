'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-[#0f0f0d] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-10 bg-luxury-gold" />
          <span className="text-luxury-gold text-sm font-sans font-semibold tracking-[0.22em] uppercase">
            Something went wrong
          </span>
          <div className="h-px w-10 bg-luxury-gold" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
          A brief interruption
        </h1>
        <p className="text-white/70 leading-relaxed mb-8">
          Something unexpected happened on our end. Try again, or head back to the homepage —
          if it keeps happening, email us and we&apos;ll sort it out.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary inline-flex items-center gap-2 justify-center">
            <span className="material-icons" style={{ fontSize: '14px' }}>refresh</span>
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 justify-center px-6 py-3 border border-white/25 text-white font-sans font-semibold text-sm tracking-wider uppercase hover:bg-white/10 transition-all"
            style={{ borderRadius: '2px' }}
          >
            <span className="material-icons" style={{ fontSize: '14px' }}>home</span>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
