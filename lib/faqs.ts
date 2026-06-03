import { propertyConfig } from '@/config/property'

export const faqs = [
  {
    q: 'What are the check-in and check-out times?',
    a: `Check-in is from ${propertyConfig.policies.checkIn} and check-out is by ${propertyConfig.policies.checkOut}. Early check-in or late check-out may be available on request.`,
  },
  {
    q: 'How many guests can the property accommodate?',
    a: `The property sleeps up to ${propertyConfig.maxGuests} guests across ${propertyConfig.bedrooms} bedrooms. Sleeping arrangements include 4 king beds, 2 bunk beds, 2 single beds, 2 sofa beds, and 3 cots for infants.`,
  },
  {
    q: 'Is the pool heated year-round?',
    a: 'Yes — the swimming pool is solar-heated, so it is warm and usable throughout the year. The 6-person spa is also available year-round.',
  },
  {
    q: 'How far is the property from the beach?',
    a: 'The beach is just 10 metres across the road — a 30-second walk from the front door. Kayaks are provided for guests who want to get out on the water.',
  },
  {
    q: 'Are pets allowed?',
    a: `Yes, pets are welcome. Please disclose your pet at the time of booking and follow the house pet guidelines. ${propertyConfig.policies.houseRules.find((r) => /pet/i.test(r)) ?? ''}`,
  },
  {
    q: 'What entertainment is available for kids?',
    a: 'The property has a 120-inch home theatre, racing and shooting arcades, Nintendo Switch, karaoke, mini golf, trampoline, table tennis, pool table, foosball, kayaks, and a solar-heated pool and spa.',
  },
  {
    q: 'What is the cancellation policy?',
    a: propertyConfig.policies.cancellation,
  },
  {
    q: 'How close are the Peninsula Hot Springs?',
    a: 'Peninsula Hot Springs is a 10-minute drive (7.1 km). Alba Thermal Springs & Spa is also nearby at 8 minutes (5.8 km).',
  },
  {
    q: 'How do I book and is there a discount for booking direct?',
    a: 'Select dates in the availability calendar and book directly through this website to avoid OTA service fees and deal with the host personally.',
  },
  {
    q: 'Are parties or events allowed?',
    a: 'No — the property strictly does not accept parties. Outdoor areas including the pool, spa, decking, and balconies must be quiet between 11 PM and 7 AM. Noise monitoring is active. Schoolies bookings are not accepted.',
  },
]
