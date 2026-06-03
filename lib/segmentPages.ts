export type SegmentPageSlug =
  | 'family-holidays-mornington-peninsula'
  | 'golf-accommodation-mornington-peninsula'
  | 'corporate-retreat-mornington-peninsula'
  | 'milestone-birthday-accommodation'
  | 'tootgarook-holiday-house'

export const segmentPages: Record<SegmentPageSlug, {
  title: string
  metaTitle: string
  description: string
  eyebrow: string
  bullets: string[]
  reviewFilter: 'families' | 'golf' | 'celebrations' | 'all'
  faq: Array<{ q: string; a: string }>
}> = {
  'family-holidays-mornington-peninsula': {
    eyebrow: 'Family Holidays',
    title: 'Mornington Peninsula family beach house for three generations',
    metaTitle: 'Mornington Peninsula Family Beach House | MAX Entertain',
    description: 'A 6-bedroom Tootgarook beachside retreat built for grandparents, parents and kids, with a heated pool, spa, theatre, games and beach access.',
    reviewFilter: 'families',
    bullets: ['Sleeps 16+ across 6 bedrooms', '5 ensuites plus powder rooms', 'Pool, spa, cinema, arcade games and mini golf', '10 metres to the beach across Point Nepean Road'],
    faq: [
      { q: 'Is it good for multi-generational families?', a: 'Yes. The house is designed for grandparents, parents and kids to stay together with separate bedrooms, multiple bathrooms and entertainment spaces.' },
      { q: 'Are there kid-friendly amenities?', a: 'Yes. Guests have access to the pool, spa, trampoline, mini golf, theatre room, Nintendo Switch, arcade games and table games.' },
    ],
  },
  'golf-accommodation-mornington-peninsula': {
    eyebrow: 'Golf Weekends',
    title: 'Mornington Peninsula golf group accommodation near the best courses',
    metaTitle: 'Mornington Peninsula Golf Accommodation | MAX Entertain',
    description: 'A private 6-bedroom base for golf groups visiting Moonah Links, The Dunes, The National and other Peninsula courses.',
    reviewFilter: 'golf',
    bullets: ['Ideal for 8-12 adults', 'Large kitchen, BBQ and shared living spaces', 'Close to Moonah Links, The Dunes and The National', 'Private gated parking for multiple cars'],
    faq: [
      { q: 'Which golf courses are nearby?', a: 'Moonah Links, The Dunes and The National are all within easy driving distance from Tootgarook.' },
      { q: 'Can adult golf groups book direct?', a: 'Yes, provided house rules are followed. Parties and Schoolies bookings are not accepted.' },
    ],
  },
  'corporate-retreat-mornington-peninsula': {
    eyebrow: 'Corporate Retreats',
    title: 'Private corporate retreat accommodation on the Mornington Peninsula',
    metaTitle: 'Corporate Retreat Mornington Peninsula | MAX Entertain',
    description: 'A private beachside retreat for small team offsites, planning days and executive resets 90 minutes from Melbourne.',
    reviewFilter: 'all',
    bullets: ['Private whole-home setting', 'Theatre room for presentations or downtime', 'Multiple breakout spaces', 'Beach walks and local dining nearby'],
    faq: [
      { q: 'Is the property suitable for work retreats?', a: 'Yes. It offers multiple shared spaces, a theatre room and a private setting close to the beach.' },
      { q: 'Are parties allowed?', a: 'No. Corporate retreats must follow the same house rules, including no parties and quiet outdoor hours overnight.' },
    ],
  },
  'milestone-birthday-accommodation': {
    eyebrow: 'Milestone Birthdays',
    title: 'Milestone birthday accommodation for family celebrations',
    metaTitle: 'Milestone Birthday Accommodation Mornington Peninsula',
    description: 'A large family-friendly retreat for 40th, 50th, 70th and 80th birthday stays, with entertainment for every generation.',
    reviewFilter: 'celebrations',
    bullets: ['Great for family birthday weekends', 'Cinema, karaoke, games, pool and spa', 'Bedrooms and bathrooms for large family groups', 'No parties; family celebrations only'],
    faq: [
      { q: 'Can we celebrate a birthday?', a: 'Family milestone celebrations are welcome, but parties and events are not permitted.' },
      { q: 'Is it suitable for older relatives?', a: 'Yes. Reviews regularly mention multi-generational groups, grandparents and milestone birthday stays.' },
    ],
  },
  'tootgarook-holiday-house': {
    eyebrow: 'Tootgarook Holiday House',
    title: 'Tootgarook holiday house 10 metres from the beach',
    metaTitle: 'Tootgarook Holiday House | MAX Entertain Beachside Retreat',
    description: 'A luxury 6-bedroom holiday house in Tootgarook, across the road from the beach and close to Rye, Rosebud and Peninsula hot springs.',
    reviewFilter: 'all',
    bullets: ['1975 Point Nepean Road, Tootgarook', 'Beach access across the road', 'Close to Rye, Rosebud, Sorrento and hot springs', 'Award-winning family-friendly stay'],
    faq: [
      { q: 'Where is the house located?', a: 'MAX Entertain is at 1975 Point Nepean Road, Tootgarook, on the Mornington Peninsula.' },
      { q: 'Is it directly on the sand?', a: 'The property is beachside across Point Nepean Road, about 10 metres from the beach access.' },
    ],
  },
}
