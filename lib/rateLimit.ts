import type { NextRequest } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getSiteUrl } from '@/lib/site'

type Bucket = { count: number; resetAtMs: number }

// Best-effort in-memory rate limiting (per serverless instance). Used as a
// fallback when MongoDB is unavailable. Prefer rateLimitDurable for auth.
function getStore(name: string): Map<string, Bucket> {
  const g = globalThis as unknown as { __rlStores?: Map<string, Map<string, Bucket>> }
  if (!g.__rlStores) g.__rlStores = new Map()
  let store = g.__rlStores.get(name)
  if (!store) {
    store = new Map()
    g.__rlStores.set(name, store)
  }
  return store
}

export function getClientIp(req: NextRequest): string {
  // Prefer platform-trusted headers when present (Vercel).
  const vercelIp = req.headers.get('x-vercel-forwarded-for')
  if (vercelIp) return vercelIp.split(',')[0]?.trim() || 'unknown'
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim() || 'unknown'
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown'
  return 'unknown'
}

/** Returns true if the request is allowed, false if rate-limited. */
export function rateLimit(storeName: string, key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const store = getStore(storeName)

  if (store.size > 5000) {
    for (const [k, v] of store) {
      if (v.resetAtMs <= now) store.delete(k)
    }
  }

  const hit = store.get(key)
  if (!hit || hit.resetAtMs <= now) {
    store.set(key, { count: 1, resetAtMs: now + windowMs })
    return true
  }
  if (hit.count >= max) return false
  hit.count += 1
  return true
}

/**
 * Durable rate limit via MongoDB (shared across serverless isolates).
 * Falls back to in-memory if Mongo is unavailable.
 */
export async function rateLimitDurable(
  storeName: string,
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  if (!process.env.MONGODB_URI) {
    return rateLimit(storeName, key, max, windowMs)
  }

  try {
    const db = await getDb()
    const col = db.collection<{ _id: string; count: number; resetAtMs: number }>('rate_limits')
    const now = Date.now()
    const id = `${storeName}:${key}`

    const updated = await col.findOneAndUpdate(
      { _id: id },
      [
        {
          $set: {
            count: {
              $cond: [{ $gt: [{ $ifNull: ['$resetAtMs', 0] }, now] }, { $add: [{ $ifNull: ['$count', 0] }, 1] }, 1],
            },
            resetAtMs: {
              $cond: [
                { $gt: [{ $ifNull: ['$resetAtMs', 0] }, now] },
                '$resetAtMs',
                now + windowMs,
              ],
            },
          },
        },
      ],
      { upsert: true, returnDocument: 'after' }
    )

    if (!updated) return rateLimit(storeName, key, max, windowMs)
    return updated.count <= max
  } catch {
    return rateLimit(storeName, key, max, windowMs)
  }
}

/** Peek whether a durable bucket is already exhausted (does not increment). */
export async function isRateLimitedDurable(
  storeName: string,
  key: string,
  max: number
): Promise<boolean> {
  if (!process.env.MONGODB_URI) {
    const store = getStore(storeName)
    const hit = store.get(key)
    if (!hit || hit.resetAtMs <= Date.now()) return false
    return hit.count >= max
  }

  try {
    const db = await getDb()
    const doc = await db.collection<{ _id: string; count: number; resetAtMs: number }>('rate_limits').findOne({
      _id: `${storeName}:${key}`,
    } as any)
    if (!doc || doc.resetAtMs <= Date.now()) return false
    return doc.count >= max
  } catch {
    return false
  }
}

/** Same-origin check for browser-facing public APIs. Fails closed in production. */
export function checkSameOrigin(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  const siteUrl = getSiteUrl()
  const origin = req.headers.get('origin') || req.headers.get('referer') || ''
  try {
    return new URL(origin).origin === new URL(siteUrl).origin
  } catch {
    return false
  }
}
