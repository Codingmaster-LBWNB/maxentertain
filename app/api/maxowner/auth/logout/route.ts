import { NextRequest, NextResponse } from 'next/server'
import { clearCookieOptions, getSessionToken, revokeSessionToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = getSessionToken(req)
  await revokeSessionToken(token)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(clearCookieOptions())
  return res
}
