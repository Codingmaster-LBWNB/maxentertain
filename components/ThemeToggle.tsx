'use client'

import { useTheme } from '@/components/ThemeProvider'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const switchTo = (next: 'light' | 'dark', e: React.MouseEvent<HTMLButtonElement>) => {
    if (next === theme) return

    // ── Circle-expansion animation ──
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const size = Math.hypot(window.innerWidth, window.innerHeight) * 2.2

    const circle = document.createElement('div')
    const bgColor = next === 'dark' ? '#0f0f0e' : '#fafaf8'

    circle.style.cssText = [
      'position:fixed',
      `left:${x}px`,
      `top:${y}px`,
      `width:${size}px`,
      `height:${size}px`,
      'border-radius:50%',
      'transform:translate(-50%,-50%) scale(0)',
      `background:${bgColor}`,
      'z-index:9997',
      'pointer-events:none',
      'will-change:transform',
      'transition:transform 0.6s cubic-bezier(0.4,0,0.2,1)',
    ].join(';')

    document.body.appendChild(circle)

    // Kick off expansion
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        circle.style.transform = 'translate(-50%,-50%) scale(1)'
      })
    })

    // Apply theme after circle fully expands, then fade circle out
    setTimeout(() => {
      // Add transition class so colour changes cross-fade smoothly
      document.documentElement.classList.add('theme-transitioning')
      setTheme(next)

      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning')
        circle.style.transition = 'opacity 0.25s ease'
        circle.style.opacity = '0'
        setTimeout(() => circle.remove(), 260)
      }, 60)
    }, 480)
  }

  const isLight = theme === 'light'
  const isDark = theme === 'dark'

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-0 shadow-2xl"
      style={{ borderRadius: '999px' }}
      role="group"
      aria-label="Theme switcher"
    >
      {/* Light mode button */}
      <button
        type="button"
        onClick={(e) => switchTo('light', e)}
        aria-label="Switch to light mode"
        aria-pressed={isLight}
        title="Light mode"
        className={`
          relative flex items-center justify-center w-11 h-11 transition-all duration-300
          ${isLight
            ? 'bg-luxury-gold text-white shadow-lg'
            : 'bg-white/90 dark:bg-white/10 text-gray-400 dark:text-white/30 hover:text-luxury-gold dark:hover:text-luxury-gold'
          }
        `}
        style={{ borderRadius: '999px 0 0 999px', border: '1px solid rgba(212,175,55,0.3)' }}
      >
        {/* Sun icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-luxury-gold/20" />

      {/* Dark mode button */}
      <button
        type="button"
        onClick={(e) => switchTo('dark', e)}
        aria-label="Switch to dark mode"
        aria-pressed={isDark}
        title="Dark mode"
        className={`
          relative flex items-center justify-center w-11 h-11 transition-all duration-300
          ${isDark
            ? 'bg-luxury-gold text-white shadow-lg'
            : 'bg-white/90 dark:bg-white/10 text-gray-400 dark:text-white/30 hover:text-luxury-gold dark:hover:text-luxury-gold'
          }
        `}
        style={{ borderRadius: '0 999px 999px 0', border: '1px solid rgba(212,175,55,0.3)', borderLeft: 'none' }}
      >
        {/* Moon icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </div>
  )
}
