# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run start    # run production server locally
npm run lint     # run ESLint
```

No test suite is configured.

## Architecture

**Next.js 14 App Router** single-property luxury rental website deployed on Vercel.

### Key directories

- `app/` — App Router pages and API routes
- `components/` — All React components (flat, no subdirectories)
- `config/property.ts` — **Single source of truth** for all property content: name, description, location, amenities, policies, images, testimonials, booking links, and fallback `blockedDates`
- `config/emailjs.ts` — EmailJS credentials (prefer Vercel env vars in production)
- `lib/site.ts` — `getSiteUrl()` helper used across metadata, JSON-LD, sitemap, robots

### Pages

- `/` — Homepage assembling all section components in order
- `/photos` — Full-screen gallery (`app/photos/`)
- `/inquiry` — Standalone inquiry form page (`app/inquiry/`)
- `/api/calendar` — Server route that fetches and merges iCal feeds, returns `{ blockedDates: string[] }` (dates as `YYYY-MM-DD` in `Australia/Melbourne` timezone), cached 1 hour via Next.js `fetch` revalidation
- `/api/chat` — Anthropic Claude API proxy for the guest chat widget

### Availability data flow

1. `useAvailability` hook (client) fetches `/api/calendar` on mount and refreshes hourly
2. Falls back to `blockedDates` array in `config/property.ts` if the API fails
3. `AvailabilityInquirySync` component wires the calendar and inquiry form so they share the same blocked-date state

### Environment variables

| Variable | Side | Purpose |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_SITE_URL` / `SITE_URL` | client/server | Canonical site URL for metadata, sitemap, JSON-LD |
| `ICAL_URLS` | server only | Comma-separated iCal feed URLs |
| `AIRBNB_ICAL_URL`, `VRBO_ICAL_URL`, `BOOKING_ICAL_URL` | server only | Per-platform iCal URLs (alternative to `ICAL_URLS`) |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | client | EmailJS inquiry form |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | server only | Guest chat widget AI backend |
| `NEXT_PUBLIC_CHAT_ENABLED` | client | Set to `"true"` to show the chat widget |

iCal URLs contain auth tokens — always use server-only env vars (no `NEXT_PUBLIC_` prefix).

### Images

All property photos live under `public/Airbnb picture/1975 Point Nepean Road- HD/`. Icons and awards are in `public/Airbnb picture/icons_files/`. Nearby attraction images are in `public/Airbnb picture/nearby photos/`. Image paths referenced in `config/property.ts` must match filenames in these directories.

### Fonts

Two Google Fonts loaded via `next/font`: `Inter` (CSS var `--font-inter`) and `Playfair Display` (CSS var `--font-playfair`). Tailwind is configured to use these via `font-sans` and `font-serif` utilities.
