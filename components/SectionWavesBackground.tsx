'use client'

import LineWaves from '@/components/LineWaves'

type SectionWavesBackgroundProps = {
  variant?: 'light' | 'dark'
  className?: string
}

const presets = {
  light: {
    speed: 0.22,
    innerLineCount: 30,
    outerLineCount: 34,
    warpIntensity: 0.65,
    rotation: -38,
    edgeFadeWidth: 0.12,
    colorCycleSpeed: 0.45,
    brightness: 0.09,
    color1: '#f4e4b8',
    color2: '#ffffff',
    color3: '#d4af37',
    enableMouseInteraction: false,
    mouseInfluence: 0.0,
  },
  dark: {
    speed: 0.28,
    innerLineCount: 34,
    outerLineCount: 38,
    warpIntensity: 0.9,
    rotation: -45,
    edgeFadeWidth: 0.08,
    colorCycleSpeed: 0.7,
    brightness: 0.16,
    color1: '#d4af37',
    color2: '#fff6df',
    color3: '#8a6a21',
    enableMouseInteraction: false,
    mouseInfluence: 0.0,
  },
}

export default function SectionWavesBackground({
  variant = 'dark',
  className = '',
}: SectionWavesBackgroundProps) {
  const selected = presets[variant]
  return (
    <div className={`waves-bg ${className}`} aria-hidden="true">
      <LineWaves {...selected} />
    </div>
  )
}
