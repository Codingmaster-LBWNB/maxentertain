import type { Metadata } from 'next'
import InquiryForm from '@/components/InquiryForm'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Book Direct & Save | MAX Entertain Beachside Retreat',
  description: 'Enquire and book direct for the best rate at our award-winning Mornington Peninsula beachfront retreat. 6 bedrooms, heated pool, home theatre — 10 m from the beach.',
  alternates: { canonical: '/inquiry' },
  openGraph: {
    title: 'Book Direct & Save | MAX Entertain Beachside Retreat',
    description: 'Skip the OTA fees — book directly with the host for the best rate on the Mornington Peninsula.',
    type: 'website',
    url: '/inquiry',
  },
}

export default function InquiryPage({
  searchParams,
}: {
  searchParams?: { checkIn?: string; checkOut?: string }
}) {
  const safeSrc = (src: string) => encodeURI(src)
  const prefill = {
    checkIn: searchParams?.checkIn,
    checkOut: searchParams?.checkOut,
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background — fixed on desktop, absolute on mobile for iOS Safari compatibility */}
      <div className="absolute inset-0 md:fixed -z-10">
        <Image
          src={safeSrc('/Airbnb picture/1975 Point Nepean Road- HD/Backyard.jpg')}
          alt="Property background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Keep full-colour background; readability handled by the form card styling */}
      </div>

      <main className="relative min-h-screen">
      <div className="section-padding">
        <div className="container-custom">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-8 transition-colors drop-shadow"
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back</span>
            <span>Back to Property</span>
          </Link>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            {/* Left: copy (keeps background visible on the right) */}
            <div className="lg:col-span-5">
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white drop-shadow-2xl mb-3">
                  Your journey starts here
            </h1>
                <p className="text-white/90 text-base md:text-lg drop-shadow">
                  Stay at the top-rated luxury stay on the Mornington Peninsula.
                </p>
                <p className="text-white/90 text-base md:text-lg mt-3 leading-relaxed drop-shadow">
                  Please check out the{' '}
                  <Link href="/#calendar" className="underline underline-offset-4 hover:text-white">
                    availability calendar
                  </Link>{' '}
                  to find out our availability.
                </p>
              </div>
            </div>

            {/* Right: form (narrower so it doesn't cover the whole photo) */}
            <div className="lg:col-span-7 lg:justify-self-end w-full">
              <InquiryForm variant="glass" containerClassName="w-full max-w-xl ml-auto" prefill={prefill} />
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}





