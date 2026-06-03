import Link from 'next/link'
import BookingSummary from '@/components/BookingSummary'
import CancellationPolicy from '@/components/CancellationPolicy'
import { computeRefund } from '@/lib/cancellation'
import { getBookingByCancellationToken, toPublicBookingSummary } from '@/lib/bookings'
import CancelBookingButton from '@/app/manage-booking/[token]/CancelBookingButton'

export default async function ManageBookingPage({
  params,
}: {
  params: { token: string }
}) {
  const booking = await getBookingByCancellationToken(params.token)
  const summary = booking ? toPublicBookingSummary(booking, true) : null
  const refund = booking ? computeRefund(booking) : null

  return (
    <main className="min-h-screen bg-luxury-light px-4 py-16 dark:bg-[#141411]">
      <div className="container-custom max-w-5xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-luxury-dark transition-colors hover:text-luxury-gold dark:text-white">
          <span className="material-icons" style={{ fontSize: '20px' }}>home</span>
          <span>Back to Property</span>
        </Link>

        {!summary || !booking || !refund ? (
          <div className="rounded-sm bg-white p-8 shadow-xl dark:bg-[#1f1f1c]">
            <h1 className="font-serif text-3xl font-bold text-luxury-dark dark:text-white">Booking Not Found</h1>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              This cancellation link is invalid or expired. Please contact Jason if you need help.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            <section className="rounded-sm bg-white p-8 shadow-xl dark:bg-[#1f1f1c] lg:col-span-7">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-luxury-gold">
                Manage Booking
              </p>
              <h1 className="mt-3 font-serif text-4xl font-bold text-luxury-dark dark:text-white">
                {summary.checkIn} to {summary.checkOut}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
                Status: <span className="font-semibold">{summary.status}</span>
              </p>

              <div className="mt-8 rounded-sm border border-luxury-gold/30 bg-luxury-gold/10 p-5">
                <h2 className="font-serif text-2xl font-bold text-luxury-dark dark:text-white">
                  Refund Preview
                </h2>
                <p className="mt-3 text-gray-700 dark:text-gray-300">
                  {refund.policyApplied}
                </p>
                <p className="mt-3 text-xl font-bold text-luxury-dark dark:text-white">
                  Estimated refund: ${refund.refundAud.toLocaleString()} ({refund.refundPercent}%)
                </p>
              </div>

              {summary.status === 'confirmed' ? (
                <div className="mt-8">
                  <CancelBookingButton token={params.token} />
                </div>
              ) : (
                <p className="mt-8 text-gray-700 dark:text-gray-300">
                  Online cancellation is only available for confirmed bookings.
                </p>
              )}
            </section>

            <aside className="space-y-5 lg:col-span-5">
              <BookingSummary pricing={summary.pricing} checkIn={summary.checkIn} checkOut={summary.checkOut} showLevy />
              <CancellationPolicy />
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
