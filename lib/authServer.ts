import { NextRequest, NextResponse } from 'next/server'
import { getSessionToken, readSessionPayload } from '@/lib/auth'
import { isJtiRevoked, revokeJti } from '@/lib/authSessions'

/**
 * Node-only owner auth helpers (Mongo revocation).
 * Never import this from middleware.ts — mongodb cannot run on Edge.
 */

/** Route-level owner gate for Node.js API routes. */
export async function requireOwner(req: NextRequest | Request): Promise<NextResponse | null> {
  const token = getSessionToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await readSessionPayload(token)
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (typeof payload.jti === 'string' && (await isJtiRevoked(payload.jti))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}

export async function revokeSessionToken(token: string | undefined): Promise<void> {
  if (!token) return
  const payload = await readSessionPayload(token)
  if (typeof payload?.jti === 'string') {
    await revokeJti(payload.jti, typeof payload.exp === 'number' ? payload.exp : undefined)
  }
}
