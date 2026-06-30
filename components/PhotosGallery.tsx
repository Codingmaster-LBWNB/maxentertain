'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { propertyConfig } from '@/config/property'

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"%3E%3Crect fill="%23222" width="1200" height="800"/%3E%3C/svg%3E'
const BLUR_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjMiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMiIGZpbGw9IiMxYTFhMWEiLz48L3N2Zz4='

function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
  (e.target as HTMLImageElement).style.opacity = '1'
}

export default function PhotosGallery() {
  const safeSrc = (src: string) => (src.startsWith('data:') ? src : encodeURI(src))

  const sections = useMemo(() => {
    const defined = propertyConfig.photoSections
    if (defined && defined.length > 0) return defined
    return [{ id: 'all', title: 'All Photos', images: propertyConfig.images }]
  }, [])

  const compressedSet = useMemo(() => new Set(propertyConfig.imagesCompressed ?? []), [])

  const toThumb = (src: string) => {
    if (!propertyConfig.imagesCompressed || propertyConfig.imagesCompressed.length === 0) return src
    // Insert /compressed/ before filename and normalize extension to .jpg
    const candidate = src.replace(/\/([^/]+)$/, (_, fname) => `/compressed/${fname.replace(/\.[^.]+$/, '.jpg')}`)
    return compressedSet.has(candidate) ? candidate : src
  }

  const flat = useMemo(() => {
    const photos: Array<{
      sectionId: string
      sectionTitle: string
      hdSrc: string
      thumbSrc: string
    }> = []

    const seen = new Set<string>()
    for (const section of sections) {
      for (const hdSrc of section.images) {
        if (!hdSrc || seen.has(hdSrc)) continue
        seen.add(hdSrc)
        photos.push({ sectionId: section.id, sectionTitle: section.title, hdSrc, thumbSrc: toThumb(hdSrc) })
      }
    }
    for (const hdSrc of propertyConfig.images) {
      if (!hdSrc || seen.has(hdSrc)) continue
      seen.add(hdSrc)
      photos.push({ sectionId: 'other', sectionTitle: 'Other', hdSrc, thumbSrc: toThumb(hdSrc) })
    }
    return photos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections])

  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '')
  const totalImages = flat.length

  // Scroll-spy: highlight the section currently in view so the compact nav
  // (dropdown on mobile, tabs on desktop) always reflects where you are.
  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(`section-${s.id}`))
      .filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const id = visible[0]?.target.id
        if (id) setActiveSection(id.replace('section-', ''))
      },
      { rootMargin: '-120px 0px -65% 0px', threshold: 0 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  const jumpToSection = (id: string) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const lockedScrollYRef = useRef<number>(0)

  const close = () => setActiveIndex(null)
  const prev = () => setActiveIndex((i) => (i === null ? null : (i - 1 + totalImages) % totalImages))
  const next = () => setActiveIndex((i) => (i === null ? null : (i + 1) % totalImages))

  // Lock page scroll when lightbox is open
  useEffect(() => {
    if (activeIndex === null) return
    const body = document.body
    lockedScrollYRef.current = window.scrollY
    const prevOverflow = body.style.overflow
    const prevPosition = body.style.position
    const prevTop = body.style.top
    const prevWidth = body.style.width
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${lockedScrollYRef.current}px`
    body.style.width = '100%'
    return () => {
      body.style.overflow = prevOverflow
      body.style.position = prevPosition
      body.style.top = prevTop
      body.style.width = prevWidth
      window.scrollTo(0, lockedScrollYRef.current)
    }
  }, [activeIndex])

  useEffect(() => {
    if (activeIndex === null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, totalImages])

  const openPhoto = (idx: number) => setActiveIndex(idx)

  // Clamp number of dot indicators so it doesn't overflow
  const showDots = totalImages <= 30

  return (
    <>
      {/* Section jump nav — sticky below the page header */}
      <div className="sticky top-14 z-20 -mx-4 md:-mx-8 lg:-mx-16 px-4 md:px-8 lg:px-16 border-b"
        style={{ backgroundColor: 'rgba(12,12,11,0.95)', borderColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>

        {/* Mobile: compact dropdown (replaces the long horizontal scroll bar) */}
        <div className="md:hidden relative py-2.5">
          <select
            value={activeSection}
            onChange={(e) => jumpToSection(e.target.value)}
            aria-label="Jump to a photo section"
            className="w-full appearance-none rounded-md border px-4 py-2.5 pr-10 font-sans text-sm font-semibold tracking-[0.12em] uppercase text-white focus:outline-none focus:border-luxury-gold/60"
            style={{ backgroundColor: '#0c0c0b', borderColor: 'rgba(255,255,255,0.15)' }}
          >
            {sections.map((s, i) => {
              const count = flat.filter((p) => p.sectionId === s.id).length
              if (count === 0) return null
              return (
                <option key={s.id} value={s.id}>
                  {String(i + 1).padStart(2, '0')} · {s.title} ({count})
                </option>
              )
            })}
          </select>
          <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-luxury-gold" style={{ fontSize: '22px' }}>
            expand_more
          </span>
        </div>

        {/* Desktop: tabs with active highlight */}
        <div className="hidden md:flex gap-0 overflow-x-auto no-scrollbar">
          {sections.map((s) => {
            const isActive = s.id === activeSection
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpToSection(s.id)}
                className={`shrink-0 px-4 py-4 font-sans text-sm font-semibold tracking-[0.16em] uppercase transition-colors border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'text-white border-luxury-gold'
                    : 'text-white/60 hover:text-white border-transparent hover:border-luxury-gold/40'
                }`}
              >
                {s.title}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-16 pt-12">
        {sections.map((section, sIdx) => {
          const items = flat.filter((p) => p.sectionId === section.id)
          if (items.length === 0) return null

          const useFeatured = items.length >= 3

          return (
            <section key={section.id} id={`section-${section.id}`} className="scroll-mt-32">

              {/* Section header */}
              <div className="flex items-center gap-5 mb-6">
                <div className="h-px flex-shrink-0 w-6" style={{ backgroundColor: 'rgba(212,175,55,0.4)' }} />
                <div className="min-w-0">
                  <span className="block text-xs font-sans font-semibold tracking-[0.2em] uppercase mb-1"
                    style={{ color: 'rgba(212,175,55,0.85)' }}>
                    {String(sIdx + 1).padStart(2, '0')} — {items.length} photos
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-white leading-tight">
                    {section.title}
                  </h2>
                  {'description' in section && section.description ? (
                    <p className="text-sm md:text-base font-sans text-white/70 mt-1 leading-relaxed">
                      {section.description}
                    </p>
                  ) : null}
                </div>
                <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Mobile grid — uniform 2-col */}
              <div className="md:hidden grid grid-cols-2 gap-1.5">
                {items.map((p) => {
                  const globalIndex = flat.findIndex((x) => x.hdSrc === p.hdSrc)
                  const idx = globalIndex >= 0 ? globalIndex : 0
                  return (
                    <div
                      key={p.hdSrc}
                      role="button"
                      tabIndex={0}
                      onClick={() => openPhoto(idx)}
                      onKeyDown={(e: ReactKeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') openPhoto(idx)
                      }}
                      aria-label={`Open photo ${idx + 1}`}
                      className="relative aspect-[4/3] w-full overflow-hidden cursor-pointer focus:outline-none group"
                    >
                      <Image
                        src={safeSrc(p.thumbSrc)}
                        alt={`${propertyConfig.name} - ${section.title}`}
                        fill
                        className="object-cover group-hover:scale-105"
                        style={{ opacity: 0, transition: 'opacity 0.4s ease, transform 0.7s ease' }}
                        sizes="50vw"
                        loading="lazy"
                        quality={60}
                        placeholder="blur"
                        blurDataURL={BLUR_PLACEHOLDER}
                        onLoad={onImageLoad}
                        onError={(e) => { (e.target as HTMLImageElement).src = safeSrc(p.hdSrc || PLACEHOLDER) }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-400" />
                      <div className="absolute inset-0 border border-luxury-gold/0 group-hover:border-luxury-gold/50 transition-colors duration-400" />
                    </div>
                  )
                })}
              </div>

              {/* Desktop — featured first + uniform grid */}
              <div className="hidden md:block">
                {useFeatured ? (
                  <div
                    className="grid grid-cols-4 gap-1.5"
                    style={{ gridAutoRows: '220px' }}
                  >
                    {items.map((p, i) => {
                      const globalIndex = flat.findIndex((x) => x.hdSrc === p.hdSrc)
                      const idx = globalIndex >= 0 ? globalIndex : 0
                      const isFeatured = i === 0
                      return (
                        <div
                          key={p.hdSrc}
                          role="button"
                          tabIndex={0}
                          onClick={() => openPhoto(idx)}
                          onKeyDown={(e: ReactKeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') openPhoto(idx)
                          }}
                          aria-label={`Open photo ${idx + 1} (${section.title})`}
                          className={`relative overflow-hidden cursor-pointer focus:outline-none group ${
                            isFeatured ? 'col-span-2 row-span-2' : ''
                          }`}
                        >
                          <Image
                            src={safeSrc(p.thumbSrc)}
                            alt={`${propertyConfig.name} - ${section.title}`}
                            fill
                            className="object-cover group-hover:scale-105"
                            style={{ opacity: 0, transition: 'opacity 0.4s ease, transform 0.7s ease' }}
                            sizes={isFeatured ? '50vw' : '25vw'}
                            priority={idx < 4}
                            loading={idx < 4 ? undefined : 'lazy'}
                            quality={isFeatured ? 72 : 60}
                            placeholder="blur"
                            blurDataURL={BLUR_PLACEHOLDER}
                            onLoad={onImageLoad}
                            onError={(e) => { (e.target as HTMLImageElement).src = safeSrc(p.hdSrc || PLACEHOLDER) }}
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                          {/* Gold border */}
                          <div className="absolute inset-0 border border-luxury-gold/0 group-hover:border-luxury-gold/60 transition-colors duration-400" />
                          {/* Zoom icon */}
                          <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-7 h-7 bg-luxury-gold flex items-center justify-center">
                              <span className="material-icons text-white" style={{ fontSize: '14px' }}>zoom_in</span>
                            </div>
                          </div>
                          {/* Featured badge */}
                          {isFeatured && (
                            <div className="absolute top-3 left-3 px-2.5 py-1.5 bg-luxury-gold/95 text-white text-xs font-sans font-semibold tracking-[0.14em] uppercase">
                              Featured
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* Small sections: uniform grid */
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5"
                    style={{ gridAutoRows: '220px' }}
                  >
                    {items.map((p) => {
                      const globalIndex = flat.findIndex((x) => x.hdSrc === p.hdSrc)
                      const idx = globalIndex >= 0 ? globalIndex : 0
                      return (
                        <div
                          key={p.hdSrc}
                          role="button"
                          tabIndex={0}
                          onClick={() => openPhoto(idx)}
                          onKeyDown={(e: ReactKeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') openPhoto(idx)
                          }}
                          aria-label={`Open photo ${idx + 1} (${section.title})`}
                          className="relative overflow-hidden cursor-pointer focus:outline-none group"
                        >
                          <Image
                            src={safeSrc(p.thumbSrc)}
                            alt={`${propertyConfig.name} - ${section.title}`}
                            fill
                            className="object-cover group-hover:scale-105"
                            style={{ opacity: 0, transition: 'opacity 0.4s ease, transform 0.7s ease' }}
                            sizes="25vw"
                            loading="lazy"
                            quality={60}
                            placeholder="blur"
                            blurDataURL={BLUR_PLACEHOLDER}
                            onLoad={onImageLoad}
                            onError={(e) => { (e.target as HTMLImageElement).src = safeSrc(p.hdSrc || PLACEHOLDER) }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                          <div className="absolute inset-0 border border-luxury-gold/0 group-hover:border-luxury-gold/60 transition-colors duration-400" />
                          <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-7 h-7 bg-luxury-gold flex items-center justify-center">
                              <span className="material-icons text-white" style={{ fontSize: '14px' }}>zoom_in</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>

      {/* ── LIGHTBOX ── rendered via portal to <body> so it sits above the
          global fixed booking bar instead of being trapped in a lower stacking
          context. */}
      {activeIndex !== null && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(8,8,7,0.97)', touchAction: 'pan-x' }}
          role="dialog"
          aria-modal="true"
          onClick={close}
          onTouchStart={(e) => {
            const t = e.touches[0]
            touchStartXRef.current = t?.clientX ?? null
            touchStartYRef.current = t?.clientY ?? null
          }}
          onTouchEnd={(e) => {
            const startX = touchStartXRef.current
            const startY = touchStartYRef.current
            touchStartXRef.current = null
            touchStartYRef.current = null
            const t = e.changedTouches[0]
            if (startX === null || startY === null || !t) return
            const dx = t.clientX - startX
            const dy = t.clientY - startY
            if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy)) return
            if (dx > 0) prev()
            else next()
          }}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10"
            style={{ background: 'linear-gradient(to bottom, rgba(8,8,7,0.8), transparent)' }}>
            {/* Counter */}
            <div className="flex items-baseline gap-1.5 font-sans">
              <span className="text-white text-xl font-serif font-bold">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-white/30 text-sm">/ {String(totalImages).padStart(2, '0')}</span>
            </div>

            {/* Center: mobile prev/next arrows + desktop section label */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="md:hidden flex w-11 h-11 border items-center justify-center text-white/80 hover:text-white active:bg-white/10 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.18)' }}
                aria-label="Previous photo"
              >
                <span className="material-icons" style={{ fontSize: '24px' }}>chevron_left</span>
              </button>
              <span className="hidden md:block text-xs font-sans font-semibold tracking-[0.2em] uppercase"
                style={{ color: 'rgba(212,175,55,0.85)' }}>
                {flat[activeIndex]?.sectionTitle}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next() }}
                className="md:hidden flex w-11 h-11 border items-center justify-center text-white/80 hover:text-white active:bg-white/10 transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.18)' }}
                aria-label="Next photo"
              >
                <span className="material-icons" style={{ fontSize: '24px' }}>chevron_right</span>
              </button>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); close() }}
              className="w-9 h-9 border flex items-center justify-center text-white/50 hover:text-white transition-all group"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}
              aria-label="Close"
            >
              <span className="material-icons group-hover:scale-110 transition-transform" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>

          {/* Prev arrow */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="hidden md:flex absolute left-5 w-11 h-11 border items-center justify-center text-white/40 hover:text-white hover:border-luxury-gold/60 transition-all z-10"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            aria-label="Previous photo"
          >
            <span className="material-icons" style={{ fontSize: '22px' }}>chevron_left</span>
          </button>

          {/* Main image */}
          <div
            className="relative z-10"
            style={{ width: '90vw', maxWidth: '1100px', height: '76vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={safeSrc(flat[activeIndex]?.hdSrc || flat[activeIndex]?.thumbSrc || PLACEHOLDER)}
              alt={`${propertyConfig.name} - Photo ${activeIndex + 1}`}
              fill
              className="object-contain"
              style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
              sizes="90vw"
              priority
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              onLoad={onImageLoad}
            />
          </div>

          {/* Next arrow */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next() }}
            className="hidden md:flex absolute right-5 w-11 h-11 border items-center justify-center text-white/40 hover:text-white hover:border-luxury-gold/60 transition-all z-10"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            aria-label="Next photo"
          >
            <span className="material-icons" style={{ fontSize: '22px' }}>chevron_right</span>
          </button>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10"
            style={{ background: 'linear-gradient(to top, rgba(8,8,7,0.8), transparent)' }}>
            {/* Mobile counter */}
            <div className="md:hidden text-white/60 text-sm font-sans tracking-wider uppercase">
              {activeIndex + 1} of {totalImages}
            </div>

            {/* Dot progress indicators */}
            <div className="hidden md:flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
              {showDots
                ? Array.from({ length: totalImages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveIndex(i) }}
                    aria-label={`Go to photo ${i + 1}`}
                    className="transition-all duration-300"
                    style={{
                      width: i === activeIndex ? '20px' : '6px',
                      height: '2px',
                      backgroundColor: i === activeIndex ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                    }}
                  />
                ))
                : (
                  <span className="text-white/60 text-sm font-sans tracking-wider uppercase">
                    {activeIndex + 1} of {totalImages}
                  </span>
                )
              }
            </div>

            {/* Property name */}
            <div className="ml-auto text-xs font-sans font-semibold tracking-[0.18em] uppercase text-white/55">
              {propertyConfig.name}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
