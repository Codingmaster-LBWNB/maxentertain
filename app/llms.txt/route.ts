import { NextResponse } from 'next/server'
import { propertyConfig } from '@/config/property'
import { getSiteUrl } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  const cfg = propertyConfig
  const siteUrl = getSiteUrl()

  const amenities = cfg.amenities.join(', ')

  const nearby = cfg.localArea.attractions
    .map((a) => {
      const drive =
        a.drive ? `${a.drive.durationMin} min drive (${a.drive.distanceKm} km)` : a.distance ?? ''
      return `- ${a.name}${drive ? ` — ${drive}` : ''}`
    })
    .join('\n')

  const rules = cfg.policies.houseRules.map((r) => `- ${r}`).join('\n')

  const bookingLinks = [
    cfg.booking?.airbnb ? `- Airbnb: ${cfg.booking.airbnb}` : null,
    cfg.booking?.bookingCom ? `- Booking.com: ${cfg.booking.bookingCom}` : null,
    cfg.booking?.vrbo ? `- VRBO: ${cfg.booking.vrbo}` : null,
    `- Direct booking: ${siteUrl}/inquiry`,
  ]
    .filter(Boolean)
    .join('\n')

  const text = `# ${cfg.name}

> This file helps AI assistants and web crawlers understand this property listing. Updated regularly.

## Property Overview

- **Name:** ${cfg.name}
- **Location:** ${cfg.location}
- **Website:** ${siteUrl}
- **Type:** Luxury beachfront holiday retreat (short-term rental)
- **Bedrooms:** ${cfg.bedrooms}
- **Bathrooms:** ${cfg.bathrooms}
- **Max guests:** ${cfg.maxGuests}
- **Price:** From AUD 1800/night

## Description

${cfg.description}

## Key Features

- 10 metres to the beach (across the road)
- Solar-heated swimming pool and 6-person spa/jacuzzi
- 120-inch home theatre room
- Fully-equipped kitchen and kitchenette
- Gas log fireplace
- Racing and shooting arcade games
- Nintendo Switch (Mario Kart, Mario Party, Smash Bros)
- Karaoke with JBL sound system
- Mini golf, trampoline, table tennis, pool table, foosball
- 4 kayaks provided
- Secure parking for 8 vehicles
- Pet friendly
- In-ceiling audio throughout

## Amenities

${amenities}

## Policies

- **Check-in:** ${cfg.policies.checkIn}
- **Check-out:** ${cfg.policies.checkOut}
- **Cancellation:** ${cfg.policies.cancellation}

### House Rules

${rules}

## Nearby Attractions

${nearby}

## Booking

${bookingLinks}

## Contact

- **Email:** ${cfg.contact.email}

## Awards

${(cfg.awards ?? []).map((a) => `- ${a.title} ${a.year} — ${a.category}`).join('\n')}

## Guest Reviews Summary

${cfg.testimonials.length} reviews with an average rating of 5.0/5. Guests consistently praise the entertainment facilities, proximity to the beach, cleanliness, and the responsiveness of the host.

### Selected Reviews

${cfg.testimonials
  .slice(0, 5)
  .map(
    (t) =>
      `**${t.name}** (${t.rating}/5, ${t.date}): "${t.comment.slice(0, 300)}${t.comment.length > 300 ? '…' : ''}"`
  )
  .join('\n\n')}
`

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
