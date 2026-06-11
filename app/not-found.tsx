import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0f0f0d] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-10 bg-luxury-gold" />
          <span className="text-luxury-gold text-sm font-sans font-semibold tracking-[0.22em] uppercase">
            404
          </span>
          <div className="h-px w-10 bg-luxury-gold" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
          This page has checked out
        </h1>
        <p className="text-white/70 leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has moved. The retreat, however,
          is still right where it&apos;s always been — 10 metres from the beach.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary inline-flex items-center gap-2 justify-center">
            <span className="material-icons" style={{ fontSize: '14px' }}>home</span>
            Back to Home
          </Link>
          <Link
            href="/#calendar"
            className="inline-flex items-center gap-2 justify-center px-6 py-3 border border-white/25 text-white font-sans font-semibold text-sm tracking-wider uppercase hover:bg-white/10 transition-all"
            style={{ borderRadius: '2px' }}
          >
            <span className="material-icons" style={{ fontSize: '14px' }}>event_available</span>
            Check Availability
          </Link>
        </div>
        <div className="mt-10 text-sm text-white/50">
          Popular pages:{' '}
          <Link href="/photos" className="text-luxury-gold hover:text-white transition-colors underline underline-offset-4">
            Photos
          </Link>
          {' · '}
          <Link href="/guide" className="text-luxury-gold hover:text-white transition-colors underline underline-offset-4">
            Peninsula Guides
          </Link>
          {' · '}
          <Link href="/inquiry" className="text-luxury-gold hover:text-white transition-colors underline underline-offset-4">
            Book Direct
          </Link>
        </div>
      </div>
    </main>
  )
}
