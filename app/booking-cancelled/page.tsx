import Link from 'next/link'
import { expireBooking, getBookingById } from '@/lib/bookings'

export default async function BookingCancelledPage({
  searchParams,
}: {
  searchParams?: { bookingId?: string }
}) {
  const bookingId = searchParams?.bookingId
  const booking = bookingId ? await getBookingById(bookingId) : null

  if (booking?.status === 'pending_payment') {
    await expireBooking(booking._id, 'guest_cancelled_checkout')
  }

  return (
    <main className="min-h-screen bg-luxury-light px-4 py-16 dark:bg-[#141411]">
      <div className="container-custom max-w-2xl">
        <div className="rounded-sm bg-white p-8 shadow-xl dark:bg-[#1f1f1c]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-luxury-gold">
            Checkout Not Completed
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-luxury-dark dark:text-white">
            Your booking is not confirmed
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
            No direct booking is held unless Stripe payment is completed. You can return to the calendar and start again if you still want these dates.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#calendar" className="btn-primary">
              Return to Calendar
            </Link>
            <Link href="/inquiry" className="inline-flex items-center justify-center border border-gray-300 px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-gray-700 transition-colors hover:border-luxury-gold hover:text-luxury-gold dark:border-white/20 dark:text-gray-300">
              Send Inquiry Instead
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
