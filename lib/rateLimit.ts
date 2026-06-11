import type { NextRequest } from 'next/server'

type Bucket = { count: number; resetAtMs: number }

// Best-effort in-memory rate limiting (per serverless instance). Matches the
// pattern already used by /api/chat. Good enough to stop naive abuse and
// brute-force scripts; not a substitute for a WAF.
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
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown'
  return req.headers.get('x-real-ip') || 'unknown'
}

/** Returns true if the request is allowed, false if rate-limited. */
export function rateLimit(storeName: string, key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const store = getStore(storeName)

  // Opportunistic cleanup so the map cannot grow unbounded
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
