export interface GuideSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export interface Guide {
  slug: string
  title: string
  description: string
  datePublished: string
  heroImage: { src: string; alt: string }
  intro: string[]
  sections: GuideSection[]
  cta: { text: string; href: string; anchor: string }
}

export const guides: Guide[] = [
  {
    slug: 'multi-generational-family-holiday-mornington-peninsula',
    title: 'The Mornington Peninsula with three generations: how to keep everyone happy',
    description:
      'A practical guide to planning a multi-generational family holiday on the Mornington Peninsula — where to stay, what suits grandparents vs kids, and how to structure days so nobody melts down.',
    datePublished: '2026-06-11',
    heroImage: {
      src: '/Airbnb picture/1975 Point Nepean Road- HD/Backyard.jpg',
      alt: 'Family backyard with pool on the Mornington Peninsula',
    },
    intro: [
      'A three-generation holiday is the best kind of trip and the easiest to get wrong. Grandparents want comfort and quiet mornings; parents want to actually relax; kids want constant stimulation. Plan it like a couples\' getaway and someone is miserable by day two.',
      'We host multi-generational families on the Mornington Peninsula year-round, and the same patterns separate the great trips from the tense ones. Here is what works.',
    ],
    sections: [
      {
        heading: 'Rule 1: one house, separate zones',
        paragraphs: [
          'Splitting a family across motel rooms or two small houses kills the point of the trip — the shared breakfasts, the kids running to the grandparents\' room. But one house only works if it has genuine separation: enough bathrooms that nobody queues, and bedrooms far enough apart that a 6 AM toddler doesn\'t wake a 75-year-old.',
          'The practical checklist: at least one bathroom per couple (ensuites ideally), king beds for the adults rather than doubles, a kids\' zone away from the main bedrooms, and cots provided so you are not packing one. Heating matters more than families expect — Peninsula nights are cool most of the year, and under-tile bathroom heating is the kind of detail grandparents mention for years.',
        ],
      },
      {
        heading: 'Rule 2: the house needs to carry the rainy day',
        paragraphs: [
          'Melbourne weather follows you down the Peninsula. On a two-week summer stay you will get at least two or three days where the beach is off the table, and that is when most holiday houses fail — there is a TV, a deck you can\'t use, and a long day.',
          'Pick a house where a rainy day is genuinely good: a theatre room for a family movie, games the teenagers actually want (arcade machines and a Nintendo Switch outperform a shelf of board games), a pool table or table tennis for the dads\' tournament, and ideally a heated pool so swimming isn\'t weather-dependent. If the house has karaoke, the rainy night becomes the night everyone remembers.',
        ],
      },
      {
        heading: 'Structure the days in thirds',
        paragraphs: [
          'The schedule that keeps three generations happy: mornings together, afternoons apart, evenings together. A morning beach walk or pool session suits everyone. After lunch, split — grandparents rest or visit a winery, parents get a couple of hours at the hot springs, kids stay at the house with whoever drew the short straw (easy when the house has entertainment). Reconvene for a long dinner.',
          'Never plan more than one "outing" per day. The Peninsula rewards staying put more than ticking lists.',
        ],
      },
      {
        heading: 'The all-ages outings that actually work',
        paragraphs: ['Tested across hundreds of family stays, these suit ages 4 to 84:'],
        bullets: [
          'Peninsula Hot Springs (Fingal) — book the family bathing area; grandparents and toddlers are equally happy in warm water',
          'Arthurs Seat Eagle gondola (Dromana) — zero walking required, big views, ice cream at the top',
          'Moonlit Sanctuary (Pearcedale) — koalas and kangaroo feeding without the scale (or walking) of a big zoo',
          'Sorrento front beach and ferry — watch the Queenscliff ferry come in, fish and chips on the grass',
          'A calm bay beach (Tootgarook, Rye, Rosebud) — shallow, flat water where small kids and older swimmers are both safe',
        ],
      },
      {
        heading: 'Where to base yourselves',
        paragraphs: [
          'The southern bay side — Tootgarook, Rye, Blairgowrie — is the sweet spot for families. The bay beaches are calm and shallow (unlike the surf back-beaches), the hot springs are 10 minutes away, and Rosebud and Rye have every shop, chemist, and takeaway you will need. Sorrento and Portsea are lovely for a day trip but pricier and busier as a base.',
          'Our own house, MAX Entertain Beachside Retreat in Tootgarook, was set up around exactly the principles in this guide — 6 bedrooms with 5 ensuites for 20+ guests, a heated pool, a theatre, and a calm bay beach 10 metres across the road. If a three-generation trip is on your horizon, it was built for you.',
        ],
      },
    ],
    cta: {
      text: 'See our family-sized beach house',
      href: '/family-holidays-mornington-peninsula',
      anchor: 'family accommodation on the Mornington Peninsula',
    },
  },
  {
    slug: 'golf-weekend-mornington-peninsula',
    title: 'A golf weekend on the Mornington Peninsula: courses, logistics, and where to stay',
    description:
      'How to plan a golf trip on the Mornington Peninsula — which courses to play in what order, drive times, and how to house a group of 8–16 golfers under one roof.',
    datePublished: '2026-06-11',
    heroImage: {
      src: '/Airbnb picture/1975 Point Nepean Road- HD/exterior2.jpg',
      alt: 'Group accommodation base for a Mornington Peninsula golf weekend',
    },
    intro: [
      'The Mornington Peninsula is the best golf trip in Victoria hiding in plain sight: a dozen quality courses inside a 25-minute radius, including some of the highest-ranked public-access golf in Australia. The problem was never the golf — it\'s housing 8–16 golfers somewhere better than a motel.',
      'Here is the itinerary logic, course by course, plus the accommodation maths.',
    ],
    sections: [
      {
        heading: 'The courses, honestly ranked for a group trip',
        paragraphs: [
          'You cannot play everything in a weekend. The shortlist most groups settle on:',
        ],
        bullets: [
          'Moonah Links (Fingal) — the Open Course is championship length and the Legends Course is the friendlier second round; the obvious centrepiece day',
          'The Dunes (Rye) — arguably the best value golf in Victoria; true links feel, very group-friendly',
          'St Andrews Beach (Fingal) — one brilliant, fun course; pace of play is quick',
          'The National (Cape Schanck) — multiple courses; access usually requires a member or reciprocal arrangement, worth arranging in advance',
          'Portsea & Sorrento — classic clubland; shorter, charming, good "recovery round" options',
        ],
      },
      {
        heading: 'The weekend template',
        paragraphs: [
          'Friday: arrive by mid-afternoon, twilight nine at The Dunes or St Andrews Beach, BBQ at the house. Saturday: the marquee round at Moonah Links Open Course in the morning, spa and a long dinner after. Sunday: morning round at the Legends or The Dunes, lunch in Rye, drive home.',
          'Two logistical truths: book tee times before accommodation in peak months, and stay central — Tootgarook or Rye puts every course in the list within 10–20 minutes, so nobody is doing 40-minute drives with clubs at 7 AM.',
        ],
      },
      {
        heading: 'The accommodation maths',
        paragraphs: [
          'Twelve golfers in motel rooms means six rooms, no shared space, and dinner logistics every night. One large house is cheaper per head, and the 19th hole is your own deck instead of a car park.',
          'What a golf group actually needs from a house: enough real beds (golfers do not love bunk-sharing, so count kings and singles, not "sleeps" numbers), multiple bathrooms for the 7 AM shotgun-start scramble, parking for four-plus cars, a big fridge, a BBQ, and a spa for the post-round soak. A theatre screen for watching the football or replaying swings is the bonus that gets the same group rebooking next year.',
        ],
      },
      {
        heading: 'Off-course for the non-golfing hours',
        paragraphs: [
          'Peninsula Hot Springs or Alba Thermal Springs are 10 minutes from the central courses and the single best recovery move in golf. Red Hill and Main Ridge wineries fill a non-golf afternoon. Rye and Rosebud cover the group dinner if nobody wants to cook.',
          'Our house — MAX Entertain Beachside Retreat in Tootgarook — hosts golf groups regularly: 6 bedrooms with 4 kings and 5 ensuites, sleeps 20+, secure parking for 8 cars, spa, BBQ balcony, karaoke, and a 120-inch screen. Moonah Links and The Dunes are roughly 10 minutes away. One honest caveat: we host golf trips, not parties — noise rules apply from 11 PM, which suits groups with early tee times anyway.',
        ],
      },
    ],
    cta: {
      text: 'See our group accommodation for golf trips',
      href: '/golf-accommodation-mornington-peninsula',
      anchor: 'a 6-bedroom base for Peninsula golf groups',
    },
  },
  {
    slug: 'peninsula-hot-springs-vs-alba-thermal-springs',
    title: 'Peninsula Hot Springs vs Alba Thermal Springs: which one, when, and why',
    description:
      'An honest local comparison of Peninsula Hot Springs and Alba Thermal Springs & Spa in Fingal — atmosphere, crowds, families vs couples, and which to choose for your Mornington Peninsula trip.',
    datePublished: '2026-06-11',
    heroImage: {
      src: '/Airbnb picture/1975 Point Nepean Road- HD/spa and outdoor lounge.jpg',
      alt: 'Outdoor spa relaxation on the Mornington Peninsula',
    },
    intro: [
      'Both springs are in Fingal, under 10 minutes from our house in Tootgarook, and guests ask us "which one?" almost weekly. They are genuinely different experiences, and the right answer depends on who is in the car.',
    ],
    sections: [
      {
        heading: 'Peninsula Hot Springs: the original, and the bigger experience',
        paragraphs: [
          'Peninsula Hot Springs is the established icon — a sprawling, naturally landscaped valley of 70-plus bathing experiences, from the famous hilltop pool with 360-degree views to cave pools, reflexology walks, and a proper bath house. It feels like a day out rather than a session: most visitors stay three to five hours and still don\'t see everything.',
          'Its other advantage is breadth: there are family-friendly bathing areas where kids are welcome at certain times, and adults-only zones when you want quiet. Book the dawn or evening sessions if crowds bother you — middle of the day in school holidays is busy, and the hilltop pool queue is real.',
        ],
      },
      {
        heading: 'Alba: newer, sleeker, more adult',
        paragraphs: [
          'Alba Thermal Springs & Spa opened in 2022 and feels it — architectural concrete-and-green design, 30-plus pools set in native gardens, a strong spa and treatment program, and Thyme, a genuinely good in-house restaurant. The whole experience is more curated and more hushed.',
          'Alba is the pick for couples, friends\' weekends, and anyone whose idea of a springs visit is closer to a luxury spa day than a family adventure. It is generally less crowded than Peninsula Hot Springs at comparable times, and the bathing-plus-lunch combination is the best "treat day" formula on the Peninsula.',
        ],
      },
      {
        heading: 'The decision in one paragraph',
        paragraphs: [
          'Kids in the group, first visit, or you want the full iconic experience: Peninsula Hot Springs. Adults only, design-and-dining inclined, or you\'ve already done PHS: Alba. Multi-generational groups staying a week near Fingal genuinely do both — PHS as the family outing, Alba as the parents\' escape while the grandparents hold the fort.',
        ],
        bullets: [
          'Peninsula Hot Springs: bigger, more variety, family bathing options, book dawn/dusk to dodge crowds',
          'Alba: newer, quieter, more luxurious, superior dining, adults-first atmosphere',
          'Both: about 10 minutes from Tootgarook/Rye, book ahead in summer and school holidays — walk-ins are a gamble',
        ],
      },
      {
        heading: 'Make it a springs trip, not a springs day-trip',
        paragraphs: [
          'Driving 90 minutes from Melbourne, bathing, and driving home is the least relaxing way to do hot springs. Staying nearby turns it into the holiday it should be — dawn session at PHS while the house sleeps, back for breakfast, beach in the afternoon.',
          'Our place, MAX Entertain Beachside Retreat, is about 10 minutes from both springs — with its own solar-heated pool and 6-person spa for the days in between. Guests regularly structure a week as: PHS early in the stay, Alba mid-week, house spa every other night.',
        ],
      },
    ],
    cta: {
      text: 'Stay 10 minutes from both springs',
      href: '/family-holidays-mornington-peninsula',
      anchor: 'a beach house near Peninsula Hot Springs',
    },
  },
  {
    slug: 'mornington-peninsula-winter',
    title: "Mornington Peninsula in winter: why it's our favourite season",
    description:
      'What to do on the Mornington Peninsula in winter — hot springs, wineries, whale watching, storm beaches — and why winter is the smartest time to book a large holiday house.',
    datePublished: '2026-06-11',
    heroImage: {
      src: '/Airbnb picture/1975 Point Nepean Road- HD/Main living room.jpg',
      alt: 'Living room with gas fireplace for a winter Mornington Peninsula stay',
    },
    intro: [
      'Everyone books the Peninsula for January and fights for car parks. The locals\' secret is June to August: the same coastline with no crowds, restaurant tables without bookings, hot springs steaming properly in the cold air — and holiday houses at their most available.',
      'Here is the honest case for a winter Peninsula trip, and how to do it well.',
    ],
    sections: [
      {
        heading: 'Hot springs were made for cold air',
        paragraphs: [
          'A 38-degree pool is pleasant in summer; in winter it is transcendent. Steam rising off the hilltop pool at Peninsula Hot Springs on a 10-degree morning is the Peninsula\'s single best winter moment, and Alba\'s heated pools-and-lunch formula works even better when it\'s grey outside.',
          'Winter is also when bookings are easiest to get — the dawn sessions that sell out in January are wide open in July.',
        ],
      },
      {
        heading: 'Wineries, fires, and long lunches',
        paragraphs: [
          'Red Hill and Main Ridge do winter properly: cellar doors with fireplaces, pinot noir that suits the weather, and long-lunch restaurants — Pt Leo Estate, Montalto, Ten Minutes by Tractor — where a grey afternoon is the feature, not the bug. Book the lunch, skip the rush.',
          'Add the food trail around it: Red Hill cheese, Main Ridge chocolates, Mornington Peninsula Brewery for the non-wine contingent.',
        ],
      },
      {
        heading: 'Whales, storms, and empty beaches',
        paragraphs: [
          'Winter is whale season — humpbacks and southern right whales track along the coast from roughly June to September, with lookouts at Cape Schanck and along the Point Nepean ocean side. The back-beaches (Gunnamatta, St Andrews, Cape Schanck) put on a genuine storm-watching show after a front.',
          'And the calm bay beaches are at their most beautiful empty: a winter morning walk on Tootgarook or Rye beach, with the bay flat and silver and nobody on it, beats any summer afternoon there.',
        ],
      },
      {
        heading: 'Winter is the big-house season',
        paragraphs: [
          'The economics flip in winter: large holiday houses that are contested in summer are available and often better-priced, which is exactly when extended families and friend groups should pounce — milestone birthdays, reunions, and offsites work better in winter anyway, because the house is the point.',
          'Choose the house for winter specifically: a gas fireplace, under-tile bathroom heating, a heated spa, and serious indoor entertainment. Our place in Tootgarook — MAX Entertain Beachside Retreat — was honestly built for this season: 120-inch theatre, arcade and karaoke nights, a warm spa under cold sky, and the fireplace running while the kids\' Mario Kart tournament decides bragging rights. The solar-heated pool stretches swimming into the shoulder seasons, and the spa carries the depths of July.',
        ],
        bullets: [
          'Whale watching: Cape Schanck and Point Nepean lookouts, June–September',
          'Storm watching: Gunnamatta and Cape Schanck back-beaches after a front',
          'Hot springs: book dawn sessions — easy in winter, magical in cold air',
          'Long lunches: Pt Leo Estate, Montalto, Ten Minutes by Tractor — fireplace season',
        ],
      },
    ],
    cta: {
      text: 'See the house built for winter stays',
      href: '/milestone-birthday-accommodation',
      anchor: 'a winter celebration house on the Peninsula',
    },
  },
]

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug)
}
