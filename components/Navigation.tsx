'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import ShareButton from '@/components/ShareButton'
import { trackClick } from '@/lib/analytics'

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const safeSrc = (src: string) => encodeURI(src)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks: Array<{ label: string; desktopHref: string; mobileHref: string }> = [
    { label: 'Photos', desktopHref: '#gallery', mobileHref: '/photos' },
    { label: 'Property', desktopHref: '#details', mobileHref: '#details' },
    { label: 'Amenities', desktopHref: '#amenities', mobileHref: '#amenities' },
    { label: 'Reviews', desktopHref: '#testimonials', mobileHref: '#testimonials' },
    { label: 'Nearby', desktopHref: '#local-area', mobileHref: '#local-area' },
    { label: 'Availability', desktopHref: '#calendar', mobileHref: '#calendar' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-[#0f0f0e]/96 md:bg-white/96 md:dark:bg-[#0f0f0e]/96 backdrop-blur-md shadow-sm border-b border-white/10 md:border-gray-100 md:dark:border-white/8'
          : 'bg-transparent backdrop-blur-sm'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="container-custom px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between min-h-20 py-3 md:py-0 gap-4">

          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center gap-2 md:gap-3 font-serif font-bold transition-colors flex-shrink min-w-0 text-white drop-shadow-lg ${
              isScrolled ? 'md:text-luxury-dark md:dark:text-white md:drop-shadow-none' : 'md:text-white'
            }`}
          >
            <span className="relative h-11 w-11 md:h-12 md:w-12 overflow-hidden rounded-full bg-white ring-1 ring-black/5 flex-shrink-0">
              <Image
                src={safeSrc('/Airbnb picture/icons_files/Icon.png')}
                alt="Max Entertain logo"
                fill
                className="object-contain p-1"
                sizes="(max-width: 768px) 44px, 48px"
                quality={100}
                priority
              />
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 lg:gap-5 flex-shrink-0">
            {navLinks.map((link) => {
              const isLessImportant =
                link.label === 'Property' ||
                link.label === 'Amenities' ||
                link.label === 'Nearby'
              return (
                <a
                  key={link.label}
                  href={link.desktopHref}
                  className={`relative transition-colors font-sans text-sm font-semibold tracking-[0.1em] uppercase pb-0.5
                    after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-luxury-gold after:transition-all after:duration-300 hover:after:w-full
                    ${isLessImportant ? 'hidden 2xl:inline' : 'inline'}
                    ${isScrolled ? 'text-gray-700 dark:text-gray-300 hover:text-luxury-dark dark:hover:text-white' : 'text-white/90 hover:text-white'}
                  `}
                >
                  {link.label}
                </a>
              )
            })}

            {/* Share button */}
            <div className="xl:hidden">
              <ShareButton
                iconOnly
                label="Share"
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-semibold text-sm shadow-lg transition-all border flex-shrink-0 ${
                  isScrolled
                    ? 'bg-white text-luxury-dark border-gray-200 hover:border-luxury-gold/40 hover:text-luxury-gold'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                }`}
              />
            </div>
            <div className="hidden xl:block">
              <ShareButton
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm shadow-lg transition-all flex-shrink-0 ${
                  isScrolled
                    ? 'bg-white text-luxury-dark border border-gray-200 hover:border-luxury-gold/40 hover:text-luxury-gold'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/15'
                }`}
              />
            </div>

            <Link
              href="/#calendar"
              onClick={() => trackClick('Check Dates', { location: 'Nav' })}
              className="btn-primary py-2.5 px-5 flex-shrink-0 inline-flex items-center gap-1.5"
            >
              <span className="material-icons" style={{ fontSize: '13px' }}>calendar_today</span>
              Check Dates
            </Link>

          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-2 flex-shrink-0">
            <Link
              href="/#calendar"
              onClick={() => trackClick('Check Dates', { location: 'Mobile Nav' })}
              className="inline-flex items-center gap-2 bg-luxury-gold text-white px-3 py-2 rounded-lg font-semibold text-sm shadow-lg hover:bg-opacity-90 transition-all"
            >
              <span className="material-icons" style={{ fontSize: '16px' }}>calendar_today</span>
              Dates
            </Link>

            <ShareButton
              iconOnly
              label="Share"
              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg shadow-lg transition-all border ${
                isScrolled
                  ? 'bg-white text-luxury-dark border-gray-200 hover:border-luxury-gold/40 hover:text-luxury-gold'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
              }`}
            />

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMobileMenuOpen
                ? <span className="material-icons" style={{ fontSize: '24px' }}>close</span>
                : <span className="material-icons" style={{ fontSize: '24px' }}>menu</span>
              }
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0f0f0e] border-t border-white/10 shadow-lg"
          >
            <div className="container-custom px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.mobileHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-100 hover:text-luxury-gold transition-colors font-sans text-base font-semibold tracking-[0.12em] uppercase py-4 border-b border-white/10"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/#calendar"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary w-full flex items-center justify-center gap-2 text-center"
              >
                <span className="material-icons" style={{ fontSize: '13px' }}>calendar_today</span>
                Check Dates
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
