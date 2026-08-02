import { getDb } from '@/lib/mongodb'

const SESSION_MAX_AGE_SEC = 60 * 60 * 24

/** Node-only session revocation store (not imported by Edge middleware). */

export async function revokeJti(jti: string, expSec?: number) {
  if (!process.env.MONGODB_URI) return
  try {
    const db = await getDb()
    const expiresAt = expSec
      ? new Date(expSec * 1000)
      : new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000)
    await db.collection('revoked_sessions').updateOne(
      { _id: jti } as any,
      { $set: { revokedAt: new Date(), expiresAt } },
      { upsert: true }
    )
  } catch {
    // best-effort; cookie clear still happens on logout
  }
}

export async function isJtiRevoked(jti: string): Promise<boolean> {
  if (!process.env.MONGODB_URI) return false
  try {
    const db = await getDb()
    const doc = await db.collection('revoked_sessions').findOne({ _id: jti } as any)
    return Boolean(doc)
  } catch {
    return false
  }
}
