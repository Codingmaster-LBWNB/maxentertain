'use client'

import { useMemo } from 'react'

/** Deterministic LCG — same output on server and client (no hydration mismatch). */
function generateStars(count: number, seed: number): string {
  const out: string[] = []
  let s = seed >>> 0
  const rand = () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0xffffffff
  }
  for (let i = 0; i < count; i++) {
    out.push(`${Math.floor(rand() * 2000)}px ${Math.floor(rand() * 2000)}px #fff`)
  }
  return out.join(', ')
}

/**
 * Must be placed as first child of a `.star-wrapper` (position: relative; overflow: hidden).
 * Renders the dark-space gradient + three tiers of animated stars.
 * Each tier uses TWO layers offset by 2000 px so the loop is seamless.
 */
export default function StarBackground({ density = 'full' }: { density?: 'full' | 'light' }) {
  const s1 = useMemo(() => generateStars(density === 'light' ? 350 : 700, 42),  [density])
  const s2 = useMemo(() => generateStars(density === 'light' ? 100 : 200, 137), [density])
  const s3 = useMemo(() => generateStars(density === 'light' ? 50  : 100, 891), [density])

  const layer = (
    size: number,
    shadow: string,
    duration: string,
    topOffset = 0,
  ) => ({
    position: 'absolute' as const,
    top: topOffset,
    left: 0,
    width: `${size}px`,
    height: `${size}px`,
    background: 'transparent',
    borderRadius: size >= 3 ? '50%' : undefined,
    boxShadow: shadow,
    animation: `animStar ${duration} linear infinite`,
  })

  return (
    <div
      aria-hidden="true"
      className="star-bg absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 0,
        background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
      }}
    >
      {/* Small stars – two layers for seamless loop */}
      <div style={layer(1, s1, '50s')} />
      <div style={layer(1, s1, '50s', 2000)} />

      {/* Medium stars */}
      <div style={layer(2, s2, '100s')} />
      <div style={layer(2, s2, '100s', 2000)} />

      {/* Large stars */}
      <div style={layer(3, s3, '150s')} />
      <div style={layer(3, s3, '150s', 2000)} />
    </div>
  )
}
