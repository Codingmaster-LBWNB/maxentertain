import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signSession, sessionCookieOptions } from '@/lib/auth'
import { getClientIp, isRateLimitedDurable, rateLimitDurable } from '@/lib/rateLimit'

const OWNER_LOCK_KEY = 'owner'
const MAX_IP_ATTEMPTS = 5
const IP_WINDOW_MS = 60_000
const MAX_OWNER_FAILURES = 10
const OWNER_WINDOW_MS = 15 * 60_000

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  if (!(await rateLimitDurable('admin-login-ip', ip, MAX_IP_ATTEMPTS, IP_WINDOW_MS))) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait a minute.' },
      { status: 429 }
    )
  }

  if (await isRateLimitedDurable('admin-login-owner', OWNER_LOCK_KEY, MAX_OWNER_FAILURES)) {
    return NextResponse.json(
      { error: 'Too many failed login attempts. Please try again in 15 minutes.' },
      { status: 429 }
    )
  }

  const { password } = await req.json().catch(() => ({ password: '' }))

  const stored = process.env.ADMIN_PASSWORD_HASH
  if (!stored) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 503 })
  }

  const valid = await bcrypt.compare(String(password), stored)
  if (!valid) {
    await rateLimitDurable('admin-login-owner', OWNER_LOCK_KEY, MAX_OWNER_FAILURES, OWNER_WINDOW_MS)
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await signSession()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(sessionCookieOptions(token))
  return res
}
