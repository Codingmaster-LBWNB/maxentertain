'use client'

import './MarqueeGallery.css'

const toCompressed = (src: string) =>
  src.replace('/1975 Point Nepean Road- HD/', '/1975 Point Nepean Road- HD/compressed/').replace(/\.[^.]+$/, '.jpg')

const ROW_1 = [
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/exterior.jpg'),               alt: 'Property exterior' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Pool area.jpg'),              alt: 'Pool area' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/spa and outdoor lounge.jpg'), alt: 'Spa and outdoor lounge' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Backyard rainbow.jpg'),       alt: 'Backyard' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Balcony with BBQ.jpg'),       alt: 'Balcony with BBQ' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/views.JPG'),                  alt: 'Views' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Theater room.jpg'),           alt: 'Theater room' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Gaming lounge.jpg'),          alt: 'Gaming lounge' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Main living room.jpg'),       alt: 'Main living room' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/kitchen.jpg'),                alt: 'Kitchen' },
]

const ROW_2 = [
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/exterior2.jpg'),              alt: 'Exterior 2' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Backyard.jpg'),               alt: 'Backyard' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Dining&living.jpg'),          alt: 'Dining & living' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Master Bedroom.jpg'),         alt: 'Master bedroom' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Bedroom2.jpg'),               alt: 'Bedroom 2' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Entertainment1.jpg'),         alt: 'Entertainment room' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Shooting arcade.jpg'),        alt: 'Shooting arcade' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Foosball talbe.jpg'),         alt: 'Foosball table' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/Masnter bed ensuite.jpg'),    alt: 'Master ensuite' },
  { src: toCompressed('/Airbnb picture/1975 Point Nepean Road- HD/kayak.JPG'),                  alt: 'Kayak' },
]

interface MarqueeRowProps {
  images: { src: string; alt: string }[]
  direction: 'left' | 'right'
}

function MarqueeRow({ images, direction }: MarqueeRowProps) {
  const doubled = [...images, ...images]
  return (
    <div className="marquee-outer">
      <div className={`marquee-track marquee-track--${direction}`}>
        {doubled.map((img, i) => (
          <div key={i} className="marquee-item">
            <img
              src={encodeURI(img.src)}
              alt={img.alt}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                // If compressed asset is missing, gracefully fallback to original HD path.
                const target = e.currentTarget
                if (target.dataset.fallbackApplied === '1') return
                target.dataset.fallbackApplied = '1'
                target.src = encodeURI(
                  img.src
                    .replace('/1975 Point Nepean Road- HD/compressed/', '/1975 Point Nepean Road- HD/')
                )
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MarqueeGallery() {
  return (
    <div className="flex flex-col gap-3">
      <MarqueeRow images={ROW_1} direction="left" />
      <MarqueeRow images={ROW_2} direction="right" />
    </div>
  )
}
