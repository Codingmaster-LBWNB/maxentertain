import { NextRequest, NextResponse } from 'next/server'
import { clearCookieOptions, getSessionToken } from '@/lib/auth'
import { revokeSessionToken } from '@/lib/authServer'

export async function POST(req: NextRequest) {
  const token = getSessionToken(req)
  await revokeSessionToken(token)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(clearCookieOptions())
  return res
}
