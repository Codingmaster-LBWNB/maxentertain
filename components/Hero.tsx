'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { propertyConfig } from '@/config/property'

export default function Hero() {
  const safeSrc = (src: string) => (src.startsWith('data:') ? src : encodeURI(src))
  const PLACEHOLDER =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"%3E%3Crect fill="%23ddd" width="1200" height="800"/%3E%3C/svg%3E'

  const heroImage = safeSrc('/Airbnb picture/1975 Point Nepean Road- HD/exterior2.jpg')

  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoOpacity, setVideoOpacity] = useState(1)
  const fadingRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const FADE_DURATION_MS = 900
    const FADE_START_S = 1.5 // seconds before end to begin fade

    const handleTimeUpdate = () => {
      if (!video.duration) return
      const remaining = video.duration - video.currentTime
      if (remaining < FADE_START_S && !fadingRef.current) {
        fadingRef.current = true
        setVideoOpacity(0)
        setTimeout(() => {
          setVideoOpacity(1)
          fadingRef.current = false
        }, FADE_DURATION_MS)
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [])

  const stats = [
    { icon: 'bed', label: `${propertyConfig.bedrooms} Bedrooms` },
    { icon: 'bathtub', label: `${propertyConfig.bathrooms} Bathrooms` },
    { icon: 'group', label: `${propertyConfig.maxGuests}+ Guests` },
  ]

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={heroImage}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: videoOpacity,
            transition: 'opacity 0.9s ease-in-out',
          }}
        >
          <source src={encodeURI('/Airbnb picture/videos/Video_Generation_With_Motion_And_Transition.mp4')} type="video/mp4" />
        </video>

        {/* Cinematic overlay: heavy left, fades to transparent right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />
        {/* Bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Top vignette */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      {/* Hero Content — left aligned, editorial */}
      <div className="absolute inset-0 z-10 flex items-end sm:items-center">
        <div className="container-custom px-6 md:px-8 lg:px-16 pb-20 sm:pb-0 sm:pt-16">
          <div className="max-w-2xl xl:max-w-3xl">

            {/* Location tag */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-px w-10 bg-luxury-gold" />
              <span className="text-luxury-gold/90 text-xs font-sans font-semibold tracking-[0.3em] uppercase">
                Mornington Peninsula, Victoria
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold text-white leading-[0.95] tracking-tight mb-5 drop-shadow-2xl"
            >
              {propertyConfig.name}
            </motion.h1>

            {/* Gold rule */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.65 }}
              style={{ originX: 0 }}
              className="h-px w-20 bg-luxury-gold mb-6"
            />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.75 }}
              className="text-base sm:text-lg md:text-xl text-white/80 mb-5 sm:mb-8 leading-relaxed font-light max-w-lg"
            >
              {propertyConfig.description}
            </motion.p>

            {/* Property stat chips */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.9 }}
              className="flex flex-wrap gap-2 sm:gap-3 mb-5 sm:mb-10"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-sans font-semibold tracking-widest uppercase"
                  style={{ borderRadius: '2px' }}
                >
                  <span className="material-icons text-luxury-gold" style={{ fontSize: '14px' }}>{stat.icon}</span>
                  {stat.label}
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 1.05 }}
              className="flex flex-col sm:flex-row gap-3 flex-wrap"
            >
              <Link href="/inquiry" className="btn-primary inline-flex items-center gap-2 justify-center">
                <span className="material-icons" style={{ fontSize: '14px' }}>calendar_today</span>
                Book Directly &amp; Save
              </Link>

              {propertyConfig.booking?.airbnb && (
                <a
                  href={propertyConfig.booking.airbnb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 justify-center px-6 py-3.5 border border-white/30 text-white text-xs font-sans font-semibold tracking-widest uppercase backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300"
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
                  className="inline-flex items-center gap-2 justify-center px-6 py-3.5 border border-white/30 text-white text-xs font-sans font-semibold tracking-widest uppercase backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300"
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
                  className="inline-flex items-center gap-2 justify-center px-6 py-3.5 border border-white/30 text-white text-xs font-sans font-semibold tracking-widest uppercase backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300"
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
            </motion.div>

          </div>
        </div>
      </div>

      {/* Explore Property link — bottom right corner */}
      <motion.div
        className="absolute bottom-8 right-8 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        <a
          href="#gallery"
          className="hidden md:flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors group"
        >
          <span className="text-[10px] font-sans font-semibold tracking-[0.25em] uppercase">Explore</span>
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
          className="md:hidden flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors"
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
