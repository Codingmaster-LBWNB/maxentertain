'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/maxowner/bookings', label: 'Bookings', icon: '📆' },
  { href: '/maxowner/guests', label: 'Guests', icon: '👥' },
  { href: '/maxowner/pricing', label: 'Pricing', icon: '💰' },
  { href: '/maxowner/inquiries', label: 'Inquiries', icon: '📋' },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/maxowner/login') return <>{children}</>

  const handleLogout = async () => {
    await fetch('/api/maxowner/auth/logout', { method: 'POST' })
    router.push('/maxowner/login')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0d] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#1a1a18] border-r border-white/10 flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <span className="text-luxury-gold font-serif tracking-widest text-base">MAX OWNER</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ↗ View site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-400 transition-colors rounded-lg"
          >
            ⎋ Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
