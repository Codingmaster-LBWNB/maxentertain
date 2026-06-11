'use client'

import Link from 'next/link'
import { propertyConfig } from '@/config/property'

export default function Footer() {
  return (
    <footer className="bg-luxury-dark text-white">
      {/* Top gold rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-luxury-gold/60 to-transparent" />

      <div className="container-custom px-4 md:px-8 lg:px-16 pt-16 pb-10">
        <div className="grid md:grid-cols-12 gap-12 mb-12">

          {/* Property Info — wider column */}
          <div className="md:col-span-5">
            <span className="block text-sm font-sans font-semibold tracking-[0.18em] uppercase text-luxury-gold mb-4">
              Award Winning Retreat
            </span>
            <h3 className="text-3xl font-serif font-bold mb-4 text-white leading-tight">
              {propertyConfig.name}
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed text-base max-w-sm">
              {propertyConfig.description}
            </p>
            <div className="flex items-center gap-2 text-gray-300 text-sm font-sans font-semibold tracking-[0.1em] uppercase">
              <span className="material-icons text-luxury-gold/60" style={{ fontSize: '14px' }}>location_on</span>
              <span>{propertyConfig.location}</span>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1" />

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-sans font-semibold tracking-[0.18em] uppercase text-luxury-gold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Property Details', href: '#details' },
                { label: 'Amenities', href: '#amenities' },
                { label: 'Guest Reviews', href: '#testimonials' },
                { label: 'Nearby Attractions', href: '#local-area' },
                { label: 'Check Availability', href: '#calendar' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Family Holidays', href: '/family-holidays-mornington-peninsula' },
                { label: 'Golf Group Stays', href: '/golf-accommodation-mornington-peninsula' },
                { label: 'Corporate Retreats', href: '/corporate-retreat-mornington-peninsula' },
                { label: 'Milestone Celebrations', href: '/milestone-birthday-accommodation' },
                { label: 'Peninsula Guides', href: '/guide' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors text-base inline-flex items-center gap-2 group"
                  >
                    <span className="h-px w-0 bg-luxury-gold group-hover:w-4 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-sans font-semibold tracking-[0.18em] uppercase text-luxury-gold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`mailto:${propertyConfig.contact.email}`}
                  className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors group"
                >
                  <span className="material-icons text-luxury-gold/50 group-hover:text-luxury-gold transition-colors mt-0.5" style={{ fontSize: '16px' }}>mail_outline</span>
                  <span className="text-base break-all">{propertyConfig.contact.email}</span>
                </a>
              </li>
              {propertyConfig.contact.phone && (
                <li>
                  <a
                    href={`tel:${propertyConfig.contact.phone}`}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
                  >
                    <span className="material-icons text-luxury-gold/50 group-hover:text-luxury-gold transition-colors" style={{ fontSize: '16px' }}>phone</span>
                    <span className="text-base">{propertyConfig.contact.phone}</span>
                  </a>
                </li>
              )}
              {propertyConfig.socialMedia && (
                <li className="flex gap-3 pt-2">
                  {propertyConfig.socialMedia.instagram && (
                    <a
                      href={propertyConfig.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 border border-gray-700 hover:border-luxury-gold flex items-center justify-center text-gray-400 hover:text-luxury-gold transition-all"
                      aria-label="Instagram"
                    >
                      <span className="material-icons" style={{ fontSize: '16px' }}>photo_camera</span>
                    </a>
                  )}
                  {propertyConfig.socialMedia.facebook && (
                    <a
                      href={propertyConfig.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 border border-gray-700 hover:border-luxury-gold flex items-center justify-center text-gray-400 hover:text-luxury-gold transition-all"
                      aria-label="Facebook"
                    >
                      <span className="material-icons" style={{ fontSize: '16px' }}>facebook</span>
                    </a>
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm font-sans tracking-wide">
            &copy; {new Date().getFullYear()} {propertyConfig.name}. All rights reserved.
            {' · '}
            <Link href="/privacy-policy" className="hover:text-white transition-colors underline underline-offset-4">
              Privacy
            </Link>
            {' · '}
            <Link href="/terms" className="hover:text-white transition-colors underline underline-offset-4">
              Booking Terms
            </Link>
          </p>
          <Link
            href="/#calendar"
            className="btn-primary py-2.5 px-6 inline-flex items-center gap-2"
          >
            <span className="material-icons" style={{ fontSize: '12px' }}>calendar_today</span>
            Check Dates
          </Link>
        </div>
      </div>
    </footer>
  )
}
