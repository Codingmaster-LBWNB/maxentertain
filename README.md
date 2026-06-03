# RentalWebApp (Max Entertain)

Luxury property rental website built with Next.js (App Router) and Tailwind CSS.

## Features

- Landing page sections: hero, gallery, details, amenities, reviews, local area map, availability, inquiry
- Availability calendar synced from iCal feeds via `/api/calendar`
- Inquiry form with disabled/unavailable dates and server-validated availability
- SEO basics: `sitemap.xml`, `robots.txt`, OpenGraph/Twitter images, JSON-LD schema

## Tech stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Resend (server-side inquiry + booking emails)
- Google Gemini API (guest chat)
- iCal parsing: `ical.js`

## Local development

Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Configuration

### Property content

Edit `config/property.ts` to update:
- Property name, description, location
- Amenities, policies, testimonials
- Images (see below)
- Booking links

### Images

- **Single source of truth**: put all property photos under:
  - `public/Airbnb picture/1975 Point Nepean Road- HD/`

Other property assets:
- `public/Airbnb picture/icons_files/` (icons + awards)
- `public/Airbnb picture/nearby photos/` (nearby attraction images)

Update the image arrays in `config/property.ts` to match your filenames.

## Environment variables

Create `.env.local` for local dev (Vercel env vars for production).

### Site URL (recommended)

Used for sitemap, robots, metadata base URL, and absolute URLs in JSON-LD.

Set one of:
- `NEXT_PUBLIC_BASE_URL` (example: `https://maxentertain.com`)
- `NEXT_PUBLIC_SITE_URL` (example: `https://maxentertain.com`)
- `SITE_URL` (example: `https://maxentertain.com`)

If not set, the app falls back to `https://maxentertain.com`.

### iCal availability (server-only)

iCal feed URLs often contain tokens. Configure them as server-side env vars (do not use `NEXT_PUBLIC_*`).

Use either:
- `ICAL_URLS` (comma-separated list of `.ics` URLs), or
- `AIRBNB_ICAL_URL`, `VRBO_ICAL_URL`, `BOOKING_ICAL_URL`

Verify locally at `http://localhost:3000/api/calendar` and in production at `https://maxentertain.com/api/calendar`.

### Inquiry and booking email (server-side via Resend)

Configure:

```bash
RESEND_API_KEY=...
BOOKING_FROM_EMAIL="MAX Entertain <bookings@maxentertain.com>"
OWNER_NOTIFICATION_EMAIL=owner@example.com
```

### AI guest chat (server + client, direct Gemini)

The floating guest chat widget calls `/api/chat`, which calls Gemini directly.

Server-side env vars:

```bash
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash-lite
```

Client-side feature flag (optional):

```bash
NEXT_PUBLIC_CHAT_ENABLED=true
```

Set `NEXT_PUBLIC_CHAT_ENABLED=false` to disable the widget without code changes.

## Deployment (Vercel)

1. Import the repo in Vercel
2. Set environment variables (Production):
   - Site URL (recommended): `NEXT_PUBLIC_BASE_URL=https://maxentertain.com`
   - iCal: `ICAL_URLS=...` (or the per-platform variables)
   - Email: `RESEND_API_KEY`, `BOOKING_FROM_EMAIL`, `OWNER_NOTIFICATION_EMAIL`
   - Chat: `GEMINI_API_KEY` (and optional `GEMINI_MODEL`)
   - Booking/payment: `MONGODB_URI`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CRON_SECRET`
3. Redeploy
4. Add your custom domain in Vercel and ensure it points to the project

## Notable routes

- `/` homepage
- `/photos` full gallery
- `/inquiry` dedicated inquiry page
- `/api/calendar` iCal-parsed blocked dates JSON

## Project scripts

- `npm run dev` start dev server
- `npm run build` production build
- `npm run start` run production server locally
- `npm run lint` run lint

