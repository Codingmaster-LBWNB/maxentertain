'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { propertyConfig } from '@/config/property'
import { useSectionTime } from '@/hooks/useSectionTime'
import { trackClick } from '@/lib/analytics'

export default function Hero() {
  const sectionRef = useSectionTime('Hero')
  const safeSrc = (src: string) => (src.startsWith('data:') ? src : encodeURI(src))

  const heroImage = safeSrc('/Airbnb picture/1975 Point Nepean Road- HD/exterior2.jpg')
  const landingVideoSrc = encodeURI('/Airbnb picture/videos/landing_video.mp4')

  const videoRef = useRef<HTMLVideoElement>(null)
  const [landingOpacity, setLandingOpacity] = useState(0)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const fadingOutRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startCycle = useCallback(() => {
    if (!videoEnabled) return
    fadingOutRef.current = false
    // Wait 3s on the image, then fade in the video
    timerRef.current = setTimeout(() => {
      const video = videoRef.current
      if (!video) return
      video.currentTime = 0
      video.play().catch(() => {})
      setLandingOpacity(1)
    }, 3000)
  }, [videoEnabled])

  useEffect(() => {
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 767px)').matches
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
    setVideoEnabled(!prefersReduced && !saveData)
  }, [])

  useEffect(() => {
    if (!videoEnabled) return
    startCycle()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [startCycle, videoEnabled])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const FADE_OUT_START_S = 1.0 // begin fade out 1s before end

    const handleTimeUpdate = () => {
      if (!video.duration || fadingOutRef.current) return
      const remaining = video.duration - video.currentTime
      if (remaining <= FADE_OUT_START_S) {
        fadingOutRef.current = true
        setLandingOpacity(0)
      }
    }

    const handleEnded = () => {
      // After fade out (1s CSS transition) finishes, restart cycle
      timerRef.current = setTimeout(() => {
        startCycle()
      }, 1000)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [startCycle])

  const stats = [
    { icon: 'bed', label: `${propertyConfig.bedrooms} Bedrooms` },
    { icon: 'bathtub', label: `${propertyConfig.bathrooms} Bathrooms` },
    { icon: 'group', label: `${propertyConfig.maxGuests}+ Guests` },
  ]

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="MAX Entertain beachfront retreat exterior — Tootgarook, Mornington Peninsula"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Landing video — fades in/out over the image */}
        {videoEnabled ? (
          <video
            ref={videoRef}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: landingOpacity,
              transition: 'opacity 1s ease-in-out',
            }}
          >
            <source src={landingVideoSrc} type="video/mp4" />
          </video>
        ) : null}

        {/* Cinematic overlay: heavy left, fades to transparent right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />
        {/* Bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Top vignette */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      {/* Hero Content — left aligned, editorial */}
      <div className="absolute inset-0 z-10 flex items-start sm:items-center pt-[calc(5.5rem+env(safe-area-inset-top))] sm:pt-20">
        <div className="container-custom px-6 md:px-8 lg:px-16 pb-8 sm:pb-0">
          <div className="max-w-2xl xl:max-w-3xl">

            {/* Location tag */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-px w-10 bg-luxury-gold" />
              <span className="text-luxury-gold text-sm font-sans font-semibold tracking-[0.22em] uppercase">
                Mornington Peninsula, Victoria
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-serif font-bold text-white leading-[0.95] tracking-tight mb-4 lg:mb-3 drop-shadow-2xl"
            >
              MAX Entertain Beachside Retreat — Mornington Peninsula
            </motion.h1>

            {/* Gold rule */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.65 }}
              style={{ originX: 0 }}
              className="h-px w-20 bg-luxury-gold mb-4 lg:mb-3"
            />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.75 }}
              className="text-lg sm:text-xl md:text-2xl text-white/90 mb-4 sm:mb-6 lg:mb-4 leading-relaxed font-normal max-w-xl"
            >
              {propertyConfig.description}
            </motion.p>

            {/* Property stat chips */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.9 }}
              className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-8 lg:mb-5"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-sans font-semibold tracking-wider uppercase"
                  style={{ borderRadius: '2px' }}
                >
                  <span className="material-icons text-luxury-gold" style={{ fontSize: '16px' }}>{stat.icon}</span>
                  {stat.label}
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 1.05 }}
              className="flex flex-col gap-5"
            >
              {/* Direct booking */}
              <div>
                <p className="text-luxury-gold text-xs font-sans font-semibold tracking-[0.18em] uppercase mb-2">
                  Best rate · Book direct &amp; save
                </p>
                <Link href="/#calendar" onClick={() => trackClick('Check Dates', { location: 'Hero' })} className="btn-primary inline-flex items-center gap-2 justify-center">
                  <span className="material-icons" style={{ fontSize: '14px' }}>calendar_today</span>
                  Check Dates &amp; Book Direct
                </Link>
              </div>

              {/* Other platforms */}
              {(propertyConfig.booking?.airbnb || propertyConfig.booking?.bookingCom || propertyConfig.booking?.vrbo) && (
                <div>
                  <p className="text-white/55 text-xs font-sans font-semibold tracking-[0.18em] uppercase mb-2">
                    Or find us on
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                    {propertyConfig.booking?.airbnb && (
                      <a
                        href={propertyConfig.booking.airbnb}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackClick('Airbnb', { location: 'Hero' })}
                        className="inline-flex items-center gap-2 justify-center px-6 py-3.5 border border-white/35 text-white text-sm font-sans font-semibold tracking-wider uppercase backdrop-blur-sm bg-white/15 hover:bg-white/25 transition-all duration-300"
                        style={{ borderRadius: '2px' }}
                      >
                        <Image
                          src={safeSrc('/Airbnb picture/icons_files/airbnb_icon.jpg')}
                          alt="Airbnb"
                          width={16}
                          height={16}
                          className="w-4 h-4 object-contain rounded-sm"
                        />
                        Airbnb
                      </a>
                    )}
                    {propertyConfig.booking?.bookingCom && (
                      <a
                        href={propertyConfig.booking.bookingCom}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackClick('Booking.com', { location: 'Hero' })}
                        className="inline-flex items-center gap-2 justify-center px-6 py-3.5 border border-white/35 text-white text-sm font-sans font-semibold tracking-wider uppercase backdrop-blur-sm bg-white/15 hover:bg-white/25 transition-all duration-300"
                        style={{ borderRadius: '2px' }}
                      >
                        <Image
                          src={safeSrc('/Airbnb picture/icons_files/booking_icon.jpeg')}
                          alt="Booking.com"
                          width={16}
                          height={16}
                          className="w-4 h-4 object-contain bg-white rounded-sm p-0.5"
                        />
                        Booking.com
                      </a>
                    )}
                    {propertyConfig.booking?.vrbo && (
                      <a
                        href={propertyConfig.booking.vrbo}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackClick('VRBO', { location: 'Hero' })}
                        className="inline-flex items-center gap-2 justify-center px-6 py-3.5 border border-white/35 text-white text-sm font-sans font-semibold tracking-wider uppercase backdrop-blur-sm bg-white/15 hover:bg-white/25 transition-all duration-300"
                        style={{ borderRadius: '2px' }}
                      >
                        <Image
                          src={safeSrc('/Airbnb picture/icons_files/vrbo.png')}
                          alt="VRBO"
                          width={16}
                          height={16}
                          className="w-4 h-4 object-contain"
                        />
                        VRBO
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </div>

      {/* Explore Property link — bottom right corner */}
      <motion.div
        className="absolute bottom-8 left-8 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        <a
          href="#gallery"
          className="hidden md:flex flex-col items-center gap-2 text-white/75 hover:text-white transition-colors group"
        >
          <span className="text-xs font-sans font-semibold tracking-[0.22em] uppercase">Explore</span>
          <div className="w-5 h-8 border border-white/30 rounded-full flex justify-center group-hover:border-white/60 transition-colors">
            <motion.div
              className="w-0.5 h-2 bg-white/60 rounded-full mt-1.5"
              animate={{ y: [0, 10, 0], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </a>
        <Link
          href="/photos"
          className="hidden flex-col items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <span className="text-[10px] font-sans font-semibold tracking-[0.25em] uppercase">Photos</span>
          <div className="w-5 h-8 border border-white/30 rounded-full flex justify-center">
            <motion.div
              className="w-0.5 h-2 bg-white/60 rounded-full mt-1.5"
              animate={{ y: [0, 10, 0], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </Link>
      </motion.div>
    </section>
  )
}
