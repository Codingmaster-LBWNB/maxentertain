'use client'

import { useEffect, useRef } from 'react'
import { trackSectionTime } from '@/lib/analytics'

/**
 * Attach to any section ref. Fires a "section_time" event when the user
 * scrolls the section out of view (or leaves the page), recording how
 * many seconds they had it at least 30% visible.
 */
export function useSectionTime(sectionName: string) {
  const ref = useRef<HTMLElement>(null)
  const enteredAt = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const flush = () => {
      if (enteredAt.current !== null) {
        const seconds = (Date.now() - enteredAt.current) / 1000
        trackSectionTime(sectionName, seconds)
        enteredAt.current = null
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          enteredAt.current = Date.now()
        } else {
          flush()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)

    // Also flush if the user closes the tab / navigates away
    window.addEventListener('pagehide', flush, { once: true })
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })

    return () => {
      observer.disconnect()
      flush()
    }
  }, [sectionName])

  return ref
}
