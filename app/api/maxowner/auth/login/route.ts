import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signSession, sessionCookieOptions } from '@/lib/auth'
import { getClientIp, rateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  // Brute-force protection: 5 attempts per minute per IP
  if (!rateLimit('admin-login', getClientIp(req), 5, 60_000)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait a minute.' },
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
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await signSession()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(sessionCookieOptions(token))
  return res
}
