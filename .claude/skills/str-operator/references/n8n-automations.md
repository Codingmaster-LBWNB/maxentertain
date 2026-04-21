# N8N Automations for STR Operations

JR runs self-hosted N8N (v2.8.4-era) and has debugged webhook validation, MongoDB Atlas SSL/TLS, and Gemini AI nodes. Assume that baseline. Don't explain what a webhook is.

## The automation stack JR should run

Skip anything below that duplicates what a PMS does — buy a PMS if JR ever manages 3+ properties. For now (1 property), N8N is the right layer.

```
┌─────────────────────────────────────────────┐
│  Inquiry / Booking form (maxentertain.com)  │
│  Airbnb, Booking, VRBO messages              │
│  SMS / WhatsApp inbound                      │
└──────────────────┬──────────────────────────┘
                   ▼
            ┌──────────────┐
            │ N8N (router) │
            └──────┬───────┘
     ┌────────┬────┴────┬──────────┬──────────┐
     ▼        ▼         ▼          ▼          ▼
  MongoDB  Gmail     Google    Stripe/    AI assistant
  (CRM)    (auto-   Calendar  PayPal     (Gemini)
           reply)   (hold)    (deposit)
```

## Priority order of workflows to build

These are ordered by hours-saved and booking-lifted per hour-of-build.

### 1. Inquiry intake → auto-reply + CRM (2–3 hrs)
**Why first:** every minute between inquiry and response loses 5% of conversions. This is a pure win.

- **Trigger:** Webhook from the site's inquiry form
- **Nodes:**
  1. Webhook (POST from form)
  2. Validate payload (Set node with required-field checks)
  3. MongoDB Atlas — insert document into `inquiries` collection
  4. Google Calendar — create tentative event on requested dates (colour-coded for "held")
  5. Gmail — send auto-reply to guest with availability confirmation + next steps + direct-book link
  6. Gmail — send alert to Jason's email with all details + quick-reply templates
  7. (Optional) WhatsApp / SMS via Twilio for hot leads (>$3k potential)
- **Gotcha:** JR has hit webhook validation errors before — use N8N's "Respond to Webhook" node explicitly and return 200 even on validation fail (log the failure to a separate collection).

### 2. OTA message unification (4–6 hrs)
**Why:** Airbnb, Booking.com, and VRBO all have separate inboxes. Missed messages tank rankings on all three platforms.

- **Cheap version (no channel manager):** Airbnb/Booking.com both support email forwarding of guest messages. Forward all to a dedicated address → IMAP trigger in N8N → parse sender → route to unified Slack/Telegram channel with "reply to Airbnb / reply to Booking" quick-action buttons.
- **Proper version:** use Hospitable, Hostaway, or Lodgify API ($50–$150/mo for 1 property). Their unified inbox webhook → N8N → AI first-draft reply (Gemini with a strong system prompt about house rules and tone) → push draft to Slack for Jason's one-tap approval.
- **Hard rule:** do not send AI replies autonomously on OTA channels. Reviews live and die on platform messaging — human approval is non-negotiable until JR has 500+ message pairs as training data.

### 3. Pre-stay guest drip (3 hrs)
**Why:** reduces "where do I park", "what's the WiFi", "can we check in early" messages by 80%. Also upsells where relevant.

- **Trigger:** scheduled cron checking MongoDB for confirmed bookings
- **Nodes:**
  1. Cron (daily, 9am)
  2. MongoDB — query bookings where `checkIn` is 14/7/3/1 days away
  3. Switch node — route by days-until-check-in
  4. For each branch: Gmail send with appropriate template (14: welcome + local tips; 7: confirm arrival time + request guest list; 3: check-in instructions + gate code *not yet*; 1: gate code + WiFi + emergency contact)
  5. Update MongoDB with `lastCommsSent` timestamp to prevent duplicate sends
- **Template smart-merge:** use Gemini to personalize one paragraph per email based on the inquiry's original message (e.g. "I saw you mentioned celebrating Grandma's 80th — there's a bottle of Peninsula chardonnay waiting"). Tiny touches that 10x review scores.

### 4. Check-out → review request automation (1 hr)
**Why:** 120 reviews from 1000+ guests = ~12% review rate. Getting this to 25%+ is the single biggest ranking lift available.

- **Trigger:** scheduled, 4 hours after check-out time
- **Nodes:**
  1. Cron
  2. MongoDB — query bookings with checkout = today, not yet review-requested
  3. Switch by booking source:
     - Airbnb / Booking / VRBO: send a friendly email asking for a review **on the platform they booked through** with a direct link
     - Direct: send a Google review request + a testimonial form that feeds the site
  4. 3 days later: one gentle follow-up if no review detected (check via the platform's API if available, or just assume unreviewed)
  5. 7 days later: if still no review and the guest gave 5-star-equivalent signals earlier, offer a returning-guest discount as a soft ask
- **Hard rule:** never ask for a 5-star review explicitly — platform-bannable. "We'd love your honest feedback" is the line.

### 5. Dynamic pricing sync (2 hrs if using PriceLabs)
**Why:** manual pricing on a 6BR peninsula property leaves $15-30k/year on the table.

- **Buy don't build:** PriceLabs or Wheelhouse. $20–$40/mo for 1 property.
- **N8N layer:** pull daily calendar + pricing exports from PriceLabs → MongoDB → run a Gemini "sanity check" node that flags anomalies (e.g. NYE priced below typical Saturday) → Slack alert for Jason to review.
- **Don't** write a custom pricing algorithm. STR dynamic pricing is a genuinely hard problem (seasonality, events, competitor lookaheads) and not JR's moat.

### 6. Cleaning coordination (3 hrs)
**Why:** turnover quality = review quality. A solo operator should not be texting cleaners manually.

- **Trigger:** booking confirmed or cancelled (webhook from channel manager)
- **Nodes:**
  1. Webhook from booking system
  2. Calculate checkout-to-next-checkin window
  3. Google Sheets (or MongoDB) — add/update a row in "Cleaning Schedule"
  4. SMS/WhatsApp to cleaner via Twilio with checkout time, checkin time, guest count, any special notes (pets, kids, party size)
  5. T-1 day reminder to cleaner
  6. Post-clean photo submission link (cleaner uploads 5 photos; N8N verifies in MongoDB; alert Jason if not submitted by X hours before check-in)

### 7. Financial reconciliation (1 hr, monthly)
- Stripe + PayPal + OTA payouts → Google Sheets → calculate net-of-commission per booking → flag any mismatches
- End of quarter: export for accounting

## The AI assistant pattern (Gemini / Claude via API)

JR has worked with Gemini in N8N before. A few patterns that work for STRs specifically:

**System prompt skeleton for the guest-messaging AI:**
```
You are Jason's assistant, drafting replies to guests enquiring about or staying at
MAX Entertain Beachside Retreat — a 6-bedroom beachfront home on the Mornington Peninsula.

Voice: warm, concise, confident. Australian English. Never use emoji in first contact.
Rules:
- Never promise early check-in or late checkout — offer "I'll check with Jason and confirm"
- Never quote a price — always say "Jason will confirm the exact rate"
- Never accept a booking — always defer to Jason for final confirmation
- Always confirm the group type (family / corporate / golf / other) in your first reply
- If the guest mentions kids, trampoline, or age <12: add the "trampoline is zipped in" line
- If the guest mentions pets: confirm pet-friendly but request breed + number
- If red flags (party references, one-night stays, 18-year-olds only): flag for Jason, do not reply

Output format: a JSON object with keys {draft_reply, flags, inferred_segment, suggested_rate_range}
```

**Why JSON output:** lets downstream N8N nodes branch on `flags` (auto-approve easy ones, route hard ones to Jason's Slack for review).

## Infrastructure notes specific to JR's setup

- **Self-hosted N8N (v2.8.4):** fine for 1 property; consider n8n Cloud or upgrade when latency matters for real-time guest replies.
- **MongoDB Atlas SSL/TLS errors** JR has seen before: usually IP allowlist on the Atlas cluster missing the N8N server's egress IP. Whitelist specifically, not 0.0.0.0/0 in production.
- **Webhook security:** N8N webhook URLs are guessable. Add an HMAC signature header on the website side and verify in a Function node — prevents form spam bots.
- **Expression errors:** when N8N complains about `$json.foo.bar` on a deep path, it's almost always because the previous node returned an array, not an object. Use `$json[0].foo.bar` or add a Set node to unwrap.
- **Keep secrets out of Set nodes.** Use N8N credentials for API keys — makes the workflow exportable / shareable later (useful when productizing for other hosts).

## The single biggest automation mistake

**Automating without measuring.** Before building any workflow, agree on one number to move (reply-time, conversion rate, review rate, hours saved per week). Tag the first 30 days as the baseline. If the workflow doesn't move that number, it's theatre.

## Building for later re-use (because the service business is coming)

When JR builds workflows for maxentertain.com, structure them to be multi-tenant from day 1 even though there's only one tenant:

- Put `propertyId` as a field on every MongoDB document
- Use credentials-per-property, not hard-coded API keys
- Parameterize the property name, address, check-in times as workflow variables at the top
- Export each workflow as JSON and keep them in a Git repo

This means when the first paying client shows up, onboarding them is a copy-paste-and-tweak instead of a rebuild.
