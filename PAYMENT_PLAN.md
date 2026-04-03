# Payment Integration Plan — MAX Entertain Luxury Rental

## Context

Currently, the site is inquiry-only: guests fill out a form, owner receives an EmailJS notification, then coordinates payment manually. The goal is to enable guests to pay immediately after selecting dates, using Stripe Checkout for PCI-safe card processing and N8N to automate all confirmation/cancellation emails. The existing pricing engine (`lib/pricing.ts`) and availability system (`/api/calendar` + iCal sync) are kept as-is and extended — not replaced.

---

## Tech Stack Decisions

| Concern | Choice | Reason |
|---|---|---|
| Payments | **Stripe Checkout (hosted)** | PCI SAQ-A compliant — no card data touches our server. Built-in Apple Pay, Google Pay, 3DS/SCA. |
| Database | **Supabase PostgreSQL** | Free tier, relational (date-range overlap queries), TypeScript client, serverless-safe HTTP connection. |
| Payment amount | **Full upfront** | High-value property; a deposit-then-balance flow adds significant complexity for minimal benefit. |
| Email/SMS automation | **N8N webhooks** | User's explicit requirement. Webhook-triggered workflows in N8N send all transactional emails. |

---

## Workflow Diagram

```mermaid
flowchart TD
    A([Guest selects dates\nin Calendar]) --> B{Dates available?}
    B -- No --> A
    B -- Yes --> C[Clicks 'Book Directly & Save']
    C --> D[/book?checkIn=&checkOut= loads]
    D --> E{Server availability\ndouble-check}
    E -- Unavailable --> F([Redirect home\nwith toast])
    E -- Available --> G[BookingForm + price summary\n+ cancellation policy shown]
    G --> H[Guest fills name, email,\nphone, guests, message]
    H --> I[POST /api/bookings]
    I --> J{Supabase atomic\noverlap check}
    J -- Conflict --> K([Return 409\nshow error + clear dates])
    J -- Clear --> L[Insert pending booking\nexpiresAt = now + 30min]
    L --> M[Create Stripe Checkout Session\nmetadata: bookingId, checkIn, checkOut]
    M --> N[Return checkoutUrl]
    N --> O[Client redirects to\nStripe hosted Checkout]
    O --> P{Guest action}

    P -- Abandons/times out --> Q[Stripe: checkout.session.expired]
    Q --> R[Webhook: status = expired]
    R --> S[N8N: booking.pending_expired]
    S --> T([Optional: 'Complete your booking'\nreminder email])

    P -- Pays --> U[Stripe: checkout.session.completed]
    U --> V[Webhook: status = confirmed\nstore paymentIntent + chargeId]
    V --> W[N8N: booking.confirmed]
    W --> X[Guest: confirmation email\nwith cancellation link]
    W --> Y[Owner: SMS + email\nwith guest details]
    V --> Z[Stripe redirects to\n/booking-confirmation?bookingId=]
    Z --> AA([Page shows confirmed\nbooking summary])

    subgraph Availability Blocking
        AB[GET /api/calendar] --> AC[Fetch iCal feeds]
        AC --> AD[Fetch confirmed Supabase bookings]
        AD --> AE[Merge → unified blockedDates]
    end

    subgraph Cancellation Flow
        BA([Guest opens link\nfrom confirmation email]) --> BB[/manage-booking/token]
        BB --> BC{Token valid &\nstatus = confirmed?}
        BC -- No --> BD([Error page])
        BC -- Yes --> BE[Show refund preview\nbased on days until checkIn]
        BE --> BF{Days before checkIn}
        BF -- '>14 days' --> BG[100% refund]
        BF -- '7–14 days' --> BH[50% refund]
        BF -- '<7 days' --> BI[0% refund]
        BG & BH & BI --> BJ[Guest confirms → POST /api/cancel]
        BJ --> BK{refundAud > 0?}
        BK -- Yes --> BL[stripe.refunds.create]
        BL --> BM{Success?}
        BM -- Failed --> BN[N8N: booking.refund_failed]
        BN --> BO([Owner alerted\nto manual refund])
        BM -- OK --> BP[status = cancelled]
        BK -- No --> BP
        BP --> BQ[N8N: booking.cancelled]
        BQ --> BR([Guest: cancellation + refund email])
        BQ --> BS([Owner: dates now free])
        BP --> BT([Dates reopen on calendar])
    end

    subgraph Owner-Initiated Cancellation
        CA([PATCH /api/admin/bookings/id]) --> CB[Same refund logic\n+ N8N events]
    end

    subgraph Cron: Expire Pending Holds
        DA([Vercel Cron every 15min]) --> DB[GET /api/cron/expire-bookings]
        DB --> DC[UPDATE status=expired\nWHERE pending AND expires_at < now]
    end
```

---

## Data Model (Supabase)

**`supabase/migrations/001_create_bookings.sql`** — new file

```sql
CREATE TYPE booking_status AS ENUM ('pending','confirmed','cancelled','refunded','expired');

CREATE TABLE bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status                booking_status NOT NULL DEFAULT 'pending',
  guest_name            TEXT NOT NULL,
  guest_email           TEXT NOT NULL,
  guest_phone           TEXT NOT NULL,
  guest_count           INTEGER NOT NULL,
  message               TEXT,
  check_in              DATE NOT NULL,
  check_out             DATE NOT NULL,
  nights                INTEGER NOT NULL,
  total_aud             INTEGER NOT NULL,         -- whole AUD (not cents)
  nights_breakdown      JSONB NOT NULL,           -- NightBreakdown[]
  stripe_session_id     TEXT UNIQUE,
  stripe_payment_intent TEXT UNIQUE,
  stripe_charge_id      TEXT,
  cancellation_token    UUID NOT NULL DEFAULT gen_random_uuid(),
  cancelled_at          TIMESTAMPTZ,
  cancel_reason         TEXT,
  refund_amount_aud     INTEGER,
  refund_stripe_id      TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at            TIMESTAMPTZ,
  confirmed_at          TIMESTAMPTZ
);

-- Critical: overlap query for double-booking prevention
CREATE INDEX idx_bookings_active_dates
  ON bookings (check_in, check_out)
  WHERE status IN ('pending', 'confirmed');

CREATE INDEX idx_bookings_stripe_session ON bookings (stripe_session_id);
CREATE INDEX idx_bookings_cancel_token   ON bookings (cancellation_token);
```

---

## Files to Create

```
app/
  book/page.tsx                        ← Server component: loads price summary + renders BookingForm
  book/BookingForm.tsx                 ← Client component: guest details form → POST /api/bookings
  booking-confirmation/page.tsx        ← Stripe success redirect; fetches booking by ID
  booking-cancelled/page.tsx           ← Stripe cancel redirect (guest abandoned checkout)
  manage-booking/[token]/page.tsx      ← Guest self-service cancellation page
  api/
    bookings/route.ts                  ← POST: create pending booking + Stripe Checkout Session
    bookings/[id]/route.ts             ← GET: fetch single booking (for confirmation page)
    stripe/webhook/route.ts            ← POST: raw body Stripe event handler
    cancel/route.ts                    ← POST: guest-initiated cancellation + refund
    availability-check/route.ts        ← POST: lightweight overlap check
    admin/bookings/route.ts            ← GET/PATCH: owner dashboard (ADMIN_SECRET protected)
    cron/expire-bookings/route.ts      ← GET: expire stale pending bookings (CRON_SECRET protected)

lib/
  supabase.ts                          ← Server-side Supabase client (service role key)
  stripe.ts                            ← Stripe client singleton
  bookings.ts                          ← CRUD helpers: createBooking, getBooking, confirmBooking, etc.
  cancellation.ts                      ← computeRefund(booking, now?): { refundAud, refundPercent, policyApplied }
  n8n.ts                               ← sendN8nEvent(event): fire-and-forget POST to N8N_WEBHOOK_URL

types/
  booking.ts                           ← Booking, BookingStatus, NightBreakdown, N8nEvent interfaces

components/
  BookingSummary.tsx                   ← Price breakdown panel (reused on /book and confirmation page)
  CancellationPolicy.tsx               ← Shows policy with dynamic refund dates for a given checkIn

supabase/
  migrations/001_create_bookings.sql
```

---

## Files to Modify

| File | Change |
|---|---|
| `components/Calendar.tsx` | Change "Book Directly & Save" `<Link href="/inquiry?...">` → `<Link href="/book?...">` |
| `app/api/calendar/route.ts` | After parsing iCal feeds, query Supabase for `confirmed` bookings and union their date ranges into `blockedDates` |

**The inquiry form (`components/InquiryForm.tsx`, `app/inquiry/page.tsx`) is left unchanged** — it remains available as a fallback contact channel.

---

## API Route Contracts

### `POST /api/bookings`
- **In:** `{ checkIn, checkOut, guestName, guestEmail, guestPhone, guests, message? }`
- **Out 200:** `{ bookingId, checkoutUrl, expiresAt, totalAud }`
- **Out 409:** `{ error: "DATES_UNAVAILABLE", blockedDates: string[] }`
- **Logic:** validate → Supabase overlap check → insert pending row → create Stripe Checkout Session → update row with sessionId → return checkoutUrl

### `POST /api/stripe/webhook` (raw body, signature verified)
| Stripe event | Action |
|---|---|
| `checkout.session.completed` | Set `confirmed`, store `paymentIntent`+`chargeId`, fire N8N `booking.confirmed` |
| `checkout.session.expired` | Set `expired`, fire N8N `booking.pending_expired` |
| `payment_intent.payment_failed` | Set `expired`, log error |
| `charge.refund.updated` | On `failed` → fire N8N `booking.refund_failed` |
| `charge.dispute.created` | Log, alert owner via N8N |

### `POST /api/cancel`
- **In:** `{ bookingId, cancellationToken }`
- **Logic:** validate token → `computeRefund()` → `stripe.refunds.create()` if refundAud > 0 → `status = cancelled` → N8N `booking.cancelled`
- **Out 200:** `{ refundAud, refundPercent, message }`

---

## N8N Event Payloads

All events POST to `N8N_WEBHOOK_URL` with header `X-Webhook-Secret`.

| Event | Key Fields | N8N Actions |
|---|---|---|
| `booking.confirmed` | guestName, guestEmail, checkIn, checkOut, totalAud, nightsBreakdown, cancellationUrl | Guest: HTML confirmation email; Owner: SMS + email with guest details |
| `booking.cancelled` | refundAmountAud, refundPercent, policyApplied, daysBeforeCheckIn | Guest: cancellation + refund email; Owner: dates-free notification |
| `booking.pending_expired` | guestEmail, checkIn, checkOut, totalAud | Optional: "Complete your booking" nudge email |
| `booking.refund_failed` | bookingId, refundAmountAud | Owner: manual refund alert |

---

## Cancellation Logic (`lib/cancellation.ts`)

```
daysBeforeCheckIn = differenceInCalendarDays(parseISO(booking.checkIn), now)

> 14 days  → 100% refund
7–14 days  → 50%  refund
< 7 days   → 0%   refund
```

Uses `date-fns` (already installed). The same computed values power both the `/manage-booking` preview UI and the actual refund API call.

---

## Double-Booking Prevention (Three Layers)

1. **Supabase overlap query at checkout creation** — rejects concurrent requests for the same dates
2. **`/api/calendar` merges Supabase confirmed bookings** — calendar UI shows direct bookings as blocked within 1-hour revalidation
3. **Vercel Cron expires pending holds** — stale 30-min holds released every 15 min so dates don't stay locked forever

**Gap:** Airbnb/VRBO won't know about direct bookings automatically. N8N `booking.confirmed` email to owner should remind them to block dates on those platforms manually (or via their API if available).

---

## New Environment Variables

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=     # server-only
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
ADMIN_SECRET=
CRON_SECRET=
```

---

## New Packages

```bash
npm install stripe @supabase/supabase-js
```

---

## Implementation Phases

| Phase | Work |
|---|---|
| 1 — Foundation | Supabase project + migration; `lib/supabase.ts`, `lib/stripe.ts`, `types/booking.ts`, `lib/cancellation.ts`, `lib/n8n.ts` |
| 2 — Backend APIs | `/api/bookings`, `/api/stripe/webhook`, `/api/bookings/[id]`, `/api/cancel`, `/api/availability-check`, `/api/cron/expire-bookings`; modify `/api/calendar` to merge Supabase dates |
| 3 — Frontend | `/book`, `/booking-confirmation`, `/booking-cancelled`, `/manage-booking/[token]`; modify `Calendar.tsx` link |
| 4 — N8N + Ops | Configure N8N webhook workflows for each event type; register Stripe webhook in Stripe Dashboard; add `vercel.json` cron |
| 5 — Go Live | Switch to live Stripe keys; end-to-end smoke test; manually block dates on Airbnb/VRBO for first direct booking |

---

## Verification

1. **Stripe test mode:** Complete a full booking with card `4242 4242 4242 4242` — confirm email received via N8N, booking appears in Supabase as `confirmed`, calendar shows dates blocked
2. **Abandonment:** Start checkout, let session expire — verify `expired` status in Supabase, dates reopen
3. **Cancellation >14 days:** Cancel via manage-booking link — verify full refund issued in Stripe, `cancelled` status in Supabase, email received
4. **Cancellation 7–14 days:** Verify 50% refund
5. **Cancellation <7 days:** Verify $0 refund, correct messaging
6. **Double-booking:** Open two browser tabs, select same dates, submit both simultaneously — verify only one checkout is created
7. **Cron:** Manually call `/api/cron/expire-bookings` with `CRON_SECRET`, verify pending rows expire
