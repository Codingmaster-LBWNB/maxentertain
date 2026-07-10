import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import BookingForm from '@/app/book/BookingForm'
import { BookingValidationError, getBookingQuote } from '@/lib/bookings'

export const metadata: Metadata = {
  title: 'Book Direct | Mornington Peninsula Beachfront Retreat',
  description: 'Book MAX Entertain direct with secure Stripe checkout. See live pricing for this 6-bedroom Mornington Peninsula beachside retreat.',
  alternates: { canonical: '/book' },
  openGraph: {
    title: 'Book Direct | MAX Entertain',
    description: 'Secure direct booking for MAX Entertain Beachside Retreat on the Mornington Peninsula.',
    url: '/book',
  },
}

export default async function BookPage({
  searchParams,
}: {
  searchParams?: { checkIn?: string; checkOut?: string }
}) {
  const checkIn = searchParams?.checkIn ?? ''
  const checkOut = searchParams?.checkOut ?? ''
  let quote = null
  let error = ''

  if (checkIn && checkOut) {
    try {
      quote = await getBookingQuote(checkIn, checkOut)
    } catch (err) {
      error = err instanceof BookingValidationError ? err.message : 'Pricing is unavailable for those dates.'
    }
  } else {
    error = 'Please choose dates from the availability calendar first.'
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 md:fixed -z-10">
        <Image
          src={encodeURI('/Airbnb picture/1975 Point Nepean Road- HD/Living 1.jpg')}
          alt="MAX Entertain living room"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <main className="section-padding min-h-screen">
        <div className="container-custom">
          <Link href="/#calendar" className="mb-8 inline-flex items-center gap-2 text-white/90 drop-shadow transition-colors hover:text-white">
            <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back</span>
            <span>Back to Availability</span>
          </Link>

          {quote ? (
            <BookingForm
              checkIn={checkIn}
              checkOut={checkOut}
              pricing={{
                accommodationAud: quote.accommodationAud,
                shortStayLevyRate: quote.shortStayLevyRate,
                shortStayLevyAud: quote.shortStayLevyAud,
                petFeeAud: quote.petFeeAud,
                totalAud: quote.totalAud,
                totalCents: quote.totalCents,
                nights: quote.nights,
              }}
            />
          ) : (
            <div className="max-w-2xl rounded-sm bg-white/95 p-8 shadow-2xl dark:bg-[#1f1f1c]/95">
              <h1 className="font-serif text-3xl font-bold text-luxury-dark dark:text-white">
                Select Dates First
              </h1>
              <p className="mt-4 text-base text-gray-700 dark:text-gray-300">{error}</p>
              <Link href="/#calendar" className="btn-primary mt-8 inline-flex">
                Choose Available Dates
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
