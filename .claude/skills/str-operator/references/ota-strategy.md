# OTA Strategy

Airbnb, Booking.com, VRBO, and Stayz are distribution channels, not partners. Treat them like paid ads that convert themselves — you pay the 15% when they deliver a guest, you harvest that guest for direct rebooking.

## The portfolio view

JR is on Airbnb + Booking.com + VRBO. That's the right spread. Evaluate each by:

| Platform | Primary audience | Commission | Strengths for this property | Watch out for |
|---|---|---|---|---|
| Airbnb | US, UK, AU tech-savvy travellers; families | 3% host / 14–16% guest | Photography, storytelling, Superhost trust | Algorithm volatility, instant-book pressure, guest-review asymmetry |
| Booking.com | Older demographic, international, business | 15% (or 18% Preferred Partner) | Genius program volume, conservative guest base | High commission, guest-reviews-are-score-only, cancellation permissiveness |
| VRBO/Stayz | Whole-home US/AU families, older | 8% host + 6% traveller fee | Family-focused, higher ADR, longer stays | Lower volume in AU, weaker mobile UX |
| Airbnb Luxe / Plus | High-spend luxury | Same as Airbnb + curation | 6BR with pool may qualify — worth exploring | Strict photo and design standards |

For maxentertain.com specifically: Airbnb is likely the biggest volume driver (the award evidence suggests this), Booking.com is the international hedge, VRBO catches the US multi-gen family market. Don't add Expedia or HomeAway separately — they're all owned by the same company and route through VRBO.

## Listing parity vs. platform-specific optimization

Common mistake: copy-paste the same description to every OTA. Don't.

**Airbnb rewards:** storytelling, first-person voice, "what makes this place special" section, guidebook integration
**Booking.com rewards:** structured facts, bullet points, near-airport language, business-traveller signals
**VRBO rewards:** family-scenario descriptions, sleeping config clarity, "perfect for reunion" framing

Rewrite the description for each platform. Keep the photos consistent (use the same 30 hero photos in the same order) but tune the text.

## The first-time listing optimization pass

When asked to audit an OTA listing, check these in order:

1. **Title** — does it contain the 3 highest-intent keywords? ("Beachfront", "6BR", "Pool" for maxentertain)
2. **Cover photo** — is it the single most emotionally compelling image? Not the best photo, the most *aspirational*.
3. **First 5 photos** — exterior, best interior, pool/signature, view, master. In that order. Swap if not.
4. **Description opening** — does the first sentence name the guest segment? "Perfect for multi-generational family gatherings" > "Welcome to our home".
5. **Amenity checklist** — is every relevant box ticked? Missing amenities = missing filter matches = invisible to searchers.
6. **House rules** — specific and human, not legalese. "We welcome families celebrating milestones; we're not the venue for 21st birthdays" is a better filter than copy-pasted T&Cs.
7. **Cancellation policy** — Flexible vs Strict is an algorithm input. Strict protects revenue, hurts ranking on budget filters. For luxury 6BR, Firm or Strict makes sense.
8. **Price** — run a manual comp search for the same dates, similar size, similar distance-to-beach. Are you within 15% of the median? If higher, the signature features must justify; if lower, leaving money.

## Reviews are the ranking asset

Airbnb's algorithm weights recent reviews heavily. 120+ reviews is a strong floor. The next 120 should focus on:

- **Volume velocity**: 3–5 new reviews per month, steady. A dead-zone of 6 weeks with no reviews drops rankings.
- **Keyword richness**: reviews that mention specific features ("the solar-heated pool", "the theatre room", "Jason") help SEO both on-platform and off.
- **Recency recency recency**: sort-by-date mentality. A review from 2 months ago outweighs one from 2 years ago.

The review-generation automation from the N8N reference pays off here. Aim to lift review rate from ~12% to 25%.

## Superhost / Genius / Premier Host maintenance

- **Airbnb Superhost**: 4.8+ rating, 10+ trips/year, <1% cancellation, 90% response rate. Quarterly assessment. Maintain all four — losing Superhost drops bookings 10–20% until it's back.
- **Booking.com Preferred Partner**: higher commission (18%) but meaningful ranking lift. Worth it if the lift >3% of revenue, which for most properties it is.
- **Booking.com Genius**: requires offering a 10–20% discount to Genius members, gets you the Genius badge and priority in filtered search. Generally worth it — Genius members book more nights and cancel less.
- **VRBO Premier Host**: similar criteria. Less volume benefit in Australia, but still worth maintaining.

## Channel manager decision

For 1 property: probably skip, manage each platform's calendar via iCal sync (Airbnb and Booking both export iCal; import into each other). This is what maxentertain.com's site seems to already do ("Calendar syncs with all booking platforms automatically").

For 2+ properties or when JR wants unified messaging: Hospitable (~$40/mo per property), Hostaway (~$125/mo, more enterprise), or Lodgify (~$32/mo + direct-book site included).

For 5+ properties: Guesty or Hostaway, full stop.

Do not build a channel manager. Even if JR could. The 24/7 reliability problem is not solved by being a good engineer — it's solved by a team.

## Cancellation and overbooking risk management

With iCal sync between platforms there's always a risk of double-booking during the sync delay (up to 2 hours). Mitigations:

- Keep a 1-day buffer on check-in/check-out on the direct site (always block the day before/after an existing booking for the first 24 hours, then release)
- Use Airbnb/Booking.com's Instant Book risk filters
- Have a clear overbooking SOP: offer the affected guest a premium nearby alternative + full refund + future stay credit. Never cancel — the review and ranking damage is severe.

## OTA dependency hedge

Track monthly:
- Revenue by source (Airbnb / Booking / VRBO / Direct)
- % of repeat guests going direct vs re-booking through OTA

Target: year 1, direct = 15%. Year 2, direct = 30%. Year 3, direct = 45%. Anything above 50% is hard because OTAs are where new guests find you.

## Dealing with difficult guests and reviews

Every STR operator will get one bad review. How it's handled matters more than the review itself:

- **Respond within 24 hours**, publicly, professionally, specifically. "We're sorry you didn't enjoy your stay — we've reached out directly to understand what went wrong" is table stakes.
- **Never get defensive** in public. The review is there for future guests to read, not to win an argument.
- **Address the specific complaint** in the response. Shows future guests you listen.
- **Fix the underlying issue** if legitimate. Update the listing (e.g. "please note there's a road between the house and the beach") to filter out mismatched expectations.

One 3-star review among 120 five-star reviews actually helps credibility. Don't try to get it removed unless it violates ToS.

## When to consider delisting a platform

If a platform is generating <10% of revenue *and* consuming >20% of operator time (because of their UX / policies), delist. For maxentertain.com, this is unlikely to apply to Airbnb or Booking, but could apply to any future platform JR experiments with.

Never delist suddenly — always run parallel for 3 months, make sure direct and remaining OTAs are absorbing the demand, then pull the listing.
