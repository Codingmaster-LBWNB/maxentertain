'use client'

import { useState } from 'react'

export default function CancelBookingButton({ token }: { token: string }) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const cancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? The refund policy shown on this page will apply.')) {
      return
    }

    setIsCancelling(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationToken: token }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Cancellation failed')

      setMessage(`Booking cancelled. Refund: $${Number(data.refundAud).toLocaleString()} (${data.refundPercent}%).`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancellation failed')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div>
      <button onClick={cancel} disabled={isCancelling} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
        {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
      </button>
      {message ? <p className="mt-4 font-semibold text-green-700">{message}</p> : null}
      {error ? <p className="mt-4 font-semibold text-red-600">{error}</p> : null}
    </div>
  )
}
