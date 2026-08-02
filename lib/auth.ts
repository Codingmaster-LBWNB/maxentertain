import { randomUUID } from 'crypto'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'maxowner_session'
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 // 24 hours

function getJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_JWT_SECRET is required and must be at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

export async function signSession(): Promise<string> {
  const jti = randomUUID()
  return new SignJWT({ role: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(getJwtSecret())
}

/** JWT signature + role check. Safe for Edge middleware (no DB). */
export async function verifySession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload.role === 'owner'
  } catch {
    return false
  }
}

export async function readSessionPayload(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (payload.role !== 'owner') return null
    return payload
  } catch {
    return null
  }
}

export function getSessionToken(req: NextRequest | Request): string | undefined {
  if (req instanceof NextRequest || 'cookies' in req) {
    try {
      return (req as NextRequest).cookies.get(COOKIE_NAME)?.value
    } catch {
      // fall through to header parse
    }
  }
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  return match?.[1] ? decodeURIComponent(match[1]) : undefined
}

export function sessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE_SEC,
    path: '/',
  }
}

export function clearCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  }
}

/** Allow only same-site /maxowner paths after login (blocks open redirects). */
export function safeOwnerRedirectPath(from: string | null | undefined): string {
  const fallback = '/maxowner/pricing'
  if (!from) return fallback
  if (!from.startsWith('/maxowner')) return fallback
  if (from.startsWith('//') || from.includes('://') || from.includes('\\')) return fallback
  return from
}

/**
 * Route-level owner gate for Node.js API routes.
 * Verifies JWT and checks the Mongo revocation list (logout).
 */
export async function requireOwner(req: NextRequest | Request): Promise<NextResponse | null> {
  const token = getSessionToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await readSessionPayload(token)
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (typeof payload.jti === 'string') {
    const { isJtiRevoked } = await import('@/lib/authSessions')
    if (await isJtiRevoked(payload.jti)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return null
}

export async function revokeSessionToken(token: string | undefined): Promise<void> {
  if (!token) return
  const payload = await readSessionPayload(token)
  if (typeof payload?.jti === 'string') {
    const { revokeJti } = await import('@/lib/authSessions')
    await revokeJti(payload.jti, typeof payload.exp === 'number' ? payload.exp : undefined)
  }
}
