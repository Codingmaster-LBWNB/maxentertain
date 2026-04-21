import { track } from '@vercel/analytics'

/**
 * Track a button or link click.
 * Shows up in Vercel Analytics → Events as "click".
 */
export function trackClick(label: string, extra?: Record<string, string>) {
  track('click', { label, ...extra })
}

/**
 * Track time spent in a section.
 * Shows up in Vercel Analytics → Events as "section_time".
 */
export function trackSectionTime(section: string, seconds: number) {
  if (seconds < 2) return // ignore accidental flashes
  track('section_time', { section, seconds: String(Math.round(seconds)) })
}
