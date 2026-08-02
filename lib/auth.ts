import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { NextRequest } from 'next/server'

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
  // Web Crypto works in both Edge middleware and Node API routes.
  const jti = globalThis.crypto.randomUUID()
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
