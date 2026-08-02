import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { requireOwner } from '@/lib/authServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const denied = await requireOwner(req)
  if (denied) return denied

  const checks = {
    mongo: false,
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
    resend: Boolean(process.env.RESEND_API_KEY && process.env.BOOKING_FROM_EMAIL),
    calendarFeeds: Boolean(process.env.ICAL_URLS || process.env.AIRBNB_ICAL_URL || process.env.VRBO_ICAL_URL || process.env.BOOKING_ICAL_URL),
    cronSecret: Boolean(process.env.CRON_SECRET),
    adminSecret: Boolean(process.env.ADMIN_JWT_SECRET),
    icalExportSecret: Boolean(process.env.ICAL_EXPORT_SECRET),
  }

  try {
    const db = await getDb()
    await db.command({ ping: 1 })
    checks.mongo = true
  } catch {
    checks.mongo = false
  }

  // Never return the raw ICAL_EXPORT_SECRET — only whether it is configured.
  return NextResponse.json({
    checks,
    icalExportConfigured: checks.icalExportSecret,
  })
}
