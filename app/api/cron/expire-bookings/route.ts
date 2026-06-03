import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredPendingBookings } from '@/lib/bookings'

export const runtime = 'nodejs'

function isAuthorised(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'

  const auth = req.headers.get('authorization')
  const querySecret = req.nextUrl.searchParams.get('secret')
  return auth === `Bearer ${secret}` || querySecret === secret
}

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expiredCount = await cleanupExpiredPendingBookings()
  return NextResponse.json({ ok: true, expiredCount })
}
