'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import ShareButton from '@/components/ShareButton'
import ThemeToggle from '@/components/ThemeToggle'

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
        isScrolled
          ? 'bg-white/96 dark:bg-[#0f0f0e]/96 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/8'
          : 'bg-transparent backdrop-blur-sm'
      }`}
    >
      <div className="container-custom px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between min-h-20 py-3 md:py-0 gap-4">

          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center gap-2 md:gap-3 font-serif font-bold transition-colors flex-shrink min-w-0 overflow-hidden ${
              isScrolled ? 'text-luxury-dark dark:text-white' : 'text-white drop-shadow-lg'
            }`}
          >
            <span className="relative h-9 w-9 md:h-10 md:w-10 overflow-hidden rounded-full bg-white/90 ring-1 ring-black/5 flex-shrink-0">
              <Image
                src={safeSrc('/Airbnb picture/icons_files/Icon.png')}
                alt="Max Entertain logo"
                fill
                className="object-cover scale-110"
                sizes="(max-width: 768px) 36px, 40px"
                quality={100}
                priority
              />
            </span>
            {/* md to lg: short */}
            <span className="hidden md:inline lg:hidden whitespace-nowrap text-sm truncate">
              Max Entertain
            </span>
            {/* lg to xl: medium */}
            <span className="hidden lg:inline xl:hidden whitespace-nowrap text-base truncate">
              Max Entertain Retreat
            </span>
            {/* xl+: full */}
            <span className="hidden xl:inline whitespace-nowrap text-xl truncate">
              Award Winning Luxury Retreat
            </span>
            {/* Mobile */}
            <span className="md:hidden block min-w-0 text-sm font-serif font-bold leading-tight whitespace-normal break-words max-w-[60vw]">
              Award Winning Luxury Retreat
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
                  className={`relative transition-colors font-sans text-[11px] font-semibold tracking-[0.15em] uppercase pb-0.5
                    after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-luxury-gold after:transition-all after:duration-300 hover:after:w-full
                    ${isLessImportant ? 'hidden xl:inline' : 'inline'}
                    ${isScrolled ? 'text-gray-600 dark:text-gray-400 hover:text-luxury-dark dark:hover:text-white' : 'text-white/80 hover:text-white'}
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
              href="/inquiry"
              className="btn-primary text-[10px] py-2.5 px-5 flex-shrink-0 inline-flex items-center gap-1.5"
            >
              <span className="material-icons" style={{ fontSize: '13px' }}>calendar_today</span>
              Enquiry
            </Link>

            <ThemeToggle transparent={!isScrolled} />
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-2 flex-shrink-0">
            <Link
              href="/inquiry"
              className="inline-flex items-center gap-2 bg-luxury-gold text-white px-3 py-2 rounded-lg font-semibold text-sm shadow-lg hover:bg-opacity-90 transition-all"
            >
              <span className="material-icons" style={{ fontSize: '16px' }}>calendar_today</span>
              Enquiry
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

            <ThemeToggle transparent={!isScrolled} />

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 transition-colors ${
                isScrolled ? 'text-luxury-dark' : 'text-white'
              }`}
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
            className="md:hidden bg-white dark:bg-[#0f0f0e] border-t border-gray-100 dark:border-white/8 shadow-lg"
          >
            <div className="container-custom px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.mobileHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-gray-500 dark:text-gray-400 hover:text-luxury-dark dark:hover:text-white transition-colors font-sans text-[11px] font-semibold tracking-[0.2em] uppercase py-3 border-b border-gray-50 dark:border-white/5"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/inquiry"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary w-full flex items-center justify-center gap-2 text-center"
              >
                <span className="material-icons" style={{ fontSize: '13px' }}>calendar_today</span>
                Send Enquiry
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
