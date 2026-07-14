export interface PropertyConfig {
  name: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  description: string;
  longDescription: string;
  amenities: string[];
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    houseRules: string[];
  };
  images: string[];
  imagesCompressed?: string[]; // Compressed versions for faster loading
  photoSections?: Array<{
    id: string;
    title: string;
    description?: string;
    images: string[]; // Use original (non-compressed) `/images/...` paths
  }>;
  testimonials: {
    name: string;
    rating: number;
    comment: string;
    highlight?: string[];
    source?: 'airbnb' | 'booking' | 'vrbo';
    sourceUrl?: string;
    date: string;
  }[];
  localArea: {
    title: string;
    description: string;
    attractions: {
      name: string;
      type: 'restaurant' | 'attraction' | 'activity' | 'beach' | 'shopping';
      // Optional external website for this attraction
      url?: string;
      // Legacy distance label (if you don't provide structured drive info)
      distance?: string;
      // Optional nearby photo (stored under `/public/images/...`)
      image?: string;
      // Optional computed driving distance + time
      drive?: {
        distanceKm: number;
        durationMin: number;
      };
    }[];
  };
  contact: {
    email: string;
    phone?: string;
    whatsapp?: string;
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
  };
  // Booking URLs
  booking?: {
    airbnb?: string; // Airbnb listing URL
    bookingCom?: string; // Booking.com listing URL
    vrbo?: string; // VRBO listing URL
    directBooking?: boolean; // Enable direct booking via inquiry form
  };
  // Awards and recognition
  awards?: {
    title: string;
    year: string;
    category: string;
    image?: string; // Path to award image
  }[];
}

// Single source of truth for assets.
// Everything lives under `public/Airbnb picture/...` and is served from `/<same path>`.
const AIRBNB_PICTURE_BASE = '/Airbnb picture'
const PHOTO_BASE = `${AIRBNB_PICTURE_BASE}/1975 Point Nepean Road- HD`
const ICONS_BASE = `${AIRBNB_PICTURE_BASE}/icons_files`
const NEARBY_BASE = `${AIRBNB_PICTURE_BASE}/nearby photos`

const photo = (filename: string) => `${PHOTO_BASE}/${filename}`
const icon = (filename: string) => `${ICONS_BASE}/${filename}`
const nearby = (filename: string) => `${NEARBY_BASE}/${filename}`

export const propertyConfig: PropertyConfig = {
  name: "MAX Entertain Beachside Retreat - Amazing Backyard",
  location: "1975 Point Nepean Road, Tootgarook, Victoria 3941, Australia",
  bedrooms: 6,
  bathrooms: 7,
  maxGuests: 20,
  description: "Brand new family-owned beachfront retreat featuring 6 bedrooms, 5 ensuites, 2 half bathrooms, a solar-heated pool & jacuzzi, home theatre, BBQ — and just 10 metres from the beach!",
  longDescription: `🏡 About This Space:

Welcome to our beautiful family-owned beachfront retreat, thoughtfully designed for families and groups to relax, reconnect and create lasting memories together. With 6 spacious bedrooms, 5 private ensuites and 2 extra bathrooms, everyone enjoys comfort, privacy and plenty of space — plus a private swimming pool and spa, outdoor BBQ area, home theatre, driving arcade and Nintendo Switch to keep all ages entertained from morning to night.

💛 Why Families Love Staying Here:

- ☀️ A solar-heated swimming pool and warm spa mean fun in the water all year round
- 🔥 Under-tile heating in every bathroom keeps mornings cozy and comfortable
- 🎵 In-ceiling speakers let you enjoy music while cooking, playing or relaxing
- 🛡 A secure, modern home so you can truly relax
- 🌊 The beach is just across the road — perfect for morning walks, sandcastles and sunset strolls

🛏 Comfortable Sleeping for Everyone:

Our home comfortably accommodates large families and groups with:

- 👑 4 King beds for parents and couples
- 🛏 2 Bunk beds for kids and teens
- 🛌 2 Single beds
- 🛋 2 Sofa beds for flexible sleeping
- 🛏 3 cots for the little ones

Everyone has a cozy place to rest after a day of fun.

🍽 Living & Dining:

The home features a fully equipped kitchen, perfect for family meals, plus a warm living room with a gas fireplace for relaxed evenings together.
There is also a private theatre room with a large 120-inch screen for movie nights the whole family will love.

🎉 Endless Entertainment for Kids & Adults:

Your family will enjoy:

- 🏊 A large solar-heated pool
- ♨️ A 6-person spa
- 🎮 Arcade games (racing & shooting)
- 🎮 Nintendo Switch (super mario kart, Mario Party and super smash bros)
- 🎤 Karaoke with JBL sound system
- ⛳ Mini golf
- 🤸 Trampoline
- 🚣 4 varity sized kayaks
- 🎬 Netflix
- 🏓 Table tennis
- 🎱 Pool table
- ⚽ Foosball
- 🎯 Reaction stick machine
- 🎲 Varity range of board games

There’s something for every age — no one will be bored here!

📍 Perfect Family Location:

- 🌊 Just 10 metres to the beach — safe, easy access for children
- ♨️ Only 7–8 minutes to famous hot springs
- 🛍 2 km to Rye town centre
- 🛒 6 minutes to supermarkets & shopping

Everything you need for a stress-free holiday is close by.

🔑 Guest Access:

Your family will enjoy full private use of:

- 🚗 Secure parking
- 🏊 Pool and spa
- 🍳 Kitchen & kitchenette
- 🎬 Theatre room

(Only storage rooms are locked.)

🌙 Other Things to Note:

To ensure everyone enjoys a calm and pleasant stay:

- 🚫 No parties
- 🔇 Outdoor areas close between 11pm – 7am
- 🔊 Noise monitoring is in place
- 🎓 No Schoolies bookings

This helps keep the home safe, quiet and comfortable for families and neighbours alike.`,
  amenities: [
    "Wi-Fi",
    "Air Conditioning",
    "Heating",
    "Kitchen",
    "Fully Equipped Kitchen",
    "Dishwasher",
    "Washing Machine",
    "Dryer",
    "TV",
    "Private Theatre Room",
    "120 inch Projector Screen",
    "Netflix",
    "Parking (8 spaces)",
    "Swimming Pool (Solar Heated)",
    "Hot Tub/Spa (6 person)",
    "Garden",
    "Balcony",
    "BBQ Grill",
    "Coffee Maker",
    "Gas Log Fireplace",
    "In-Ceiling Speakers",
    "Smart Home Tech",
    "Security System",
    "Undertile Heating",
    "Racing Arcade (2 seater)",
    "Shooting Arcade (2 players)",
    "Karaoke System",
    "Mini Golf",
    "Trampoline",
    "Table Tennis",
    "Pool Table",
    "Foosball Table",
    "Sea View",
    "Beach Access (10m walk)",
    "Pet Friendly (Pets Welcome)",
  ],
  policies: {
    checkIn: "3:00 PM",
    checkOut: "10:00 AM",
    cancellation:
      "More than 14 days before check-in: full refund. 7–14 days before check-in: 50% refund. Less than 7 days before check-in: no refund.",
    houseRules: [
      "STRICTLY NO PARTIES - Mornington Peninsula Shire Council Short Stay Accommodation Code of Conduct rules apply",
      "Outdoor areas including swimming pools, spas, outdoor decking and balconies are not to be used between 11:00 PM to 7:00 AM",
      "This property is monitored by Noise Alarms",
      "THIS PROPERTY DOES NOT ACCEPT SCHOOLIES",
      "Pets welcome (please disclose at booking and follow house guidelines)",
      "No smoking",
    ],
  },
  // Photo gallery (single source of truth: `public/Airbnb picture/...`)
  images: [
    // Exterior
    photo("exterior.jpg"),
    photo("exterior2.jpg"),

    // Backyard / pool
    photo("Pool area.jpg"),
    photo("spa and outdoor lounge.jpg"),
    photo("Backyard.jpg"),
    photo("Backyard1.jpg"),
    photo("Backyard2.jpg"),
    photo("Backyard3.jpg"),
    photo("Backyard4.jpg"),
    photo("Backyard5.jpg"),
    photo("backyard6.jpg"),
    photo("backyard7.jpg"),
    photo("bakyard8.jpg"),
    photo("backyard9.jpg"),
    photo("Backyard rainbow.jpg"),

    // Balcony
    photo("Balcony.jpg"),
    photo("Balcony with BBQ.jpg"),

    // Living / dining / kitchen
    photo("Main living room.jpg"),
    photo("Living 1.jpg"),
    photo("Dining&living.jpg"),
    photo("dining1.jpg"),
    photo("living & dining2.jpg"),
    photo("living&dining3.jpg"),
    photo("kitchen.jpg"),
    photo("Kitchenne.jpg"),

    // Bedrooms
    photo("Master Bedroom.jpg"),
    photo("Bedroom2.jpg"),
    photo("Bedroom3.jpg"),
    photo("Bedroom4.jpg"),
    photo("Bedroom5.jpg"),
    photo("Bedroom6.jpg"),

    // Ensuites / bathrooms
    photo("Masnter bed ensuite.jpg"),
    photo("Ensuite2.jpg"),
    photo("ensuite3.jpg"),
    photo("ensuite4.jpg"),
    photo("ensuite5.jpg"),
    photo("powder room1.jpg"),
    photo("powder room2.jpg"),
    photo("Undertile heating.jpeg"),

    // Laundry
    photo("Laundary.jpg"),

    // Entertainment
    photo("Theater room.jpg"),
    photo("Theater.jpg"),
    photo("Entertainment1.jpg"),
    photo("Gaming lounge.jpg"),
    photo("Shooting arcade.jpg"),
    photo("Foosball talbe.jpg"),
    photo("NS.jpg"),
    photo("reaction_stick_machine.jpg"),
    photo("sports equipments.jpg"),

    // Beach / views
    photo("views.JPG"),
    photo("kayak.JPG"),
  ],
  imagesCompressed: [
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Backyard rainbow.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Backyard.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Backyard1.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Backyard2.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Backyard3.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Backyard4.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Backyard5.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/backyard6.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/backyard7.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/backyard9.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/bakyard8.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Balcony with BBQ.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Balcony.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Bedroom2.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Bedroom3.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Bedroom4.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Bedroom5.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Bedroom6.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Dining&living.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/dining1.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Ensuite2.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/ensuite3.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/ensuite4.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/ensuite5.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Entertainment1.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/exterior.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/exterior2.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Foosball talbe.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Gaming lounge.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/kayak.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/kitchen.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Kitchenne.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Laundary.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/living & dining2.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Living 1.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/living&dining3.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Main living room.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Masnter bed ensuite.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Master Bedroom.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/NS.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Pool area.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/powder room1.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/powder room2.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/reaction_stick_machine.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Shooting arcade.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/spa and outdoor lounge.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/sports equipments.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Theater room.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Theater.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/Undertile heating.jpg",
    "/Airbnb picture/1975 Point Nepean Road- HD/compressed/views.jpg",
  ],
  photoSections: [
    {
      id: "exterior",
      title: "Exterior",
      description: "Street frontage, arrival and first impressions.",
      images: [photo("exterior.jpg"), photo("exterior2.jpg")],
    },
    {
      id: "backyard",
      title: "Backyard and Pool",
      description: "Solar-heated pool, spa, BBQ and outdoor lounge areas.",
      images: [
        photo("Pool area.jpg"),
        photo("spa and outdoor lounge.jpg"),
        photo("Backyard.jpg"),
        photo("Backyard1.jpg"),
        photo("Backyard2.jpg"),
        photo("Backyard3.jpg"),
        photo("Backyard4.jpg"),
        photo("Backyard5.jpg"),
        photo("backyard6.jpg"),
        photo("backyard7.jpg"),
        photo("bakyard8.jpg"),
        photo("backyard9.jpg"),
        photo("Backyard rainbow.jpg"),
      ],
    },
    {
      id: "balcony",
      title: "Balcony and BBQ",
      description: "Outdoor balcony seating with BBQ.",
      images: [photo("Balcony.jpg"), photo("Balcony with BBQ.jpg")],
    },
    {
      id: "living",
      title: "Living and Dining",
      description: "Open-plan living and dining spaces for groups.",
      images: [
        photo("Main living room.jpg"),
        photo("Living 1.jpg"),
        photo("Dining&living.jpg"),
        photo("dining1.jpg"),
        photo("living & dining2.jpg"),
        photo("living&dining3.jpg"),
      ],
    },
    {
      id: "kitchen",
      title: "Kitchen",
      description: "Fully equipped kitchen for family meals and entertaining.",
      images: [photo("kitchen.jpg"), photo("Kitchenne.jpg")],
    },
    {
      id: "bedroom-1",
      title: "Bedroom 1 (Master) + Ensuite",
      description: "Master bedroom with private ensuite.",
      images: [photo("Master Bedroom.jpg"), photo("Masnter bed ensuite.jpg")],
    },
    {
      id: "bedroom-2",
      title: "Bedroom 2 + Ensuite 2",
      description: "Bedroom 2 with ensuite bathroom.",
      images: [photo("Bedroom2.jpg"), photo("Ensuite2.jpg")],
    },
    {
      id: "bedroom-3",
      title: "Bedroom 3 + Ensuite 3",
      description: "Bedroom 3 with ensuite bathroom.",
      images: [photo("Bedroom3.jpg"), photo("ensuite3.jpg")],
    },
    {
      id: "bedroom-4",
      title: "Bedroom 4 + Ensuite 4",
      description: "Bedroom 4 with ensuite bathroom.",
      images: [photo("Bedroom4.jpg"), photo("ensuite4.jpg")],
    },
    {
      id: "bedroom-5",
      title: "Bedroom 5 + Ensuite 5",
      description: "Bedroom 5 with ensuite bathroom.",
      images: [photo("Bedroom5.jpg"), photo("ensuite5.jpg")],
    },
    {
      id: "bedroom-6",
      title: "Bedroom 6",
      description: "Additional bedroom setup for larger groups.",
      images: [photo("Bedroom6.jpg")],
    },
    {
      id: "bathrooms",
      title: "Bathrooms and Powder Rooms",
      description: "Extra bathrooms, powder rooms and under-tile heating.",
      images: [
        photo("powder room1.jpg"),
        photo("powder room2.jpg"),
        photo("Undertile heating.jpeg"),
      ],
    },
    {
      id: "laundry",
      title: "Laundry",
      description: "Laundry facilities for longer stays.",
      images: [photo("Laundary.jpg")],
    },
    {
      id: "entertainment",
      title: "Games and Theatre",
      description: "Home theatre and games area for kids and adults.",
      images: [
        photo("Theater room.jpg"),
        photo("Theater.jpg"),
        photo("Entertainment1.jpg"),
        photo("Gaming lounge.jpg"),
        photo("Shooting arcade.jpg"),
        photo("Foosball talbe.jpg"),
        photo("NS.jpg"),
        photo("reaction_stick_machine.jpg"),
        photo("sports equipments.jpg"),
      ],
    },
    {
      id: "views",
      title: "Beach and Views",
      description: "Beachside views and outdoor experiences nearby.",
      images: [photo("views.JPG"), photo("kayak.JPG")],
    },
  ],
  testimonials: [
    {
      name: "Stephen",
      rating: 5,
      comment: "Great house for a group of golfers. Nice big screen TV, great kitchen & BBQ area out on the deck. Some of the guys enjoyed the cinema room also. House accommodated our needs perfectly & Jason the host super responsive which made booking & planning nice & easy.",
      highlight: ["big screen TV", "BBQ", "cinema room", "super responsive"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387",
      date: "November 2025",
    },
    {
      name: "Julia",
      rating: 5,
      comment: "We had the best weekend staying here. The house was a lot of fun and we hardly left as everything was there. It really is a great set up and Jason was the perfect host.",
      highlight: ["best weekend", "lot of fun", "everything was there", "perfect host"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387",
      date: "October 2025",
    },
    {
      name: "Sam",
      rating: 5,
      comment: "We all had an exceptional stay. The house catered to all ages and interests, which came into its own when one of the days was very rainy.",
      highlight: ["exceptional", "all ages", "very rainy"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387",
      date: "November 2025",
    },
    {
      name: "Susan",
      rating: 5,
      comment:
        "What a perfect place to spend Christmas 2025 with three generations. I don't think there could be an Airbnb in all of Australia that has more wonderful things to keep everyone entertained, no matter what age or gender. The pool had new blow-up floats, the home theatre/karaoke room had a very fun star ceiling, there was ping pong and a pool table and arcade games along with a trampoline (kids are zipped in, so no worry of falls) and a little mini golf course. The house was spotless with six luxurious bedrooms and baths, all within walking distance of a lovely cafe. In addition, the beach was just a quick walk across the street. Jason couldn't have been a more welcoming host. He was quick to respond leading up to our stay or when we had questions after arriving and he even arranged for the Woolies Santa to deliver a bag of special goodies on Christmas day! Lucky for us, it was the second time we've stayed at Jason's home this year and we can't wait for visit Number Three!",
      highlight: ["Christmas 2025", "three generations", "home theatre", "karaoke", "mini golf"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387/reviews",
      date: "December 2025",
    },
    {
      name: "Anne",
      rating: 5,
      comment:
        "Our 3 days stay at Jason's place lived up to all the expectations we had. As a group of 8 adults and 6 children (aged between 7 and 12) celebrating a 70th birthday of a grandparent, we had plenty of room for everyone. Beautifully appointed ensuites were beside 5 of the bedrooms and the two girl grandchildren who shared with twin beds had a great powder room nearby. If you want the kids to have fun then this place doesn't disappoint. The kids roamed from the pool to the spa, to the games area to the fabulous theatre room then did it all again! Adults could really relax and enjoy the house. We managed an afternoon with the kayaks across the road at the beach and a game of cricket at the park around the corner (next street left towards Rye). And some of us loved the daily coffee break at 'the kitchen cafe' a five minute walk from the house turning right. Great ambiance. Thanks Jason for providing such a thoughtful entertainment house spotlessly maintained. We would love to return.",
      highlight: ["8 adults", "6 children", "theatre room", "pool", "spa"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387/reviews",
      date: "December 2025",
    },
    {
      name: "Nicole",
      rating: 5,
      comment:
        "We stayed here as a family gathering for our mum/grandma's 80th birthday. The house had EVERYTHING we could need for a cruisy, fun, 'don't need to leave the house' kind of weekend! Bedrooms & bathrooms for everyone. Games for big kids and little kids. The cinema was a great escape. The outdoor spa was a perfect start to the morning or end to the evening. The car racing games provided much fun for the competitive spirits. The pool table and table tennis both downstairs also provided another space to have some quiet time or competitive banter! Beach across the road. Coffee shop walking distance. The sun on the front balcony, beautiful. Plenty of car parking. Safe and secure with electric gate. A fabulous house for a large group to hang out. Loved it.",
      highlight: ["80th birthday", "don't need to leave the house", "cinema", "outdoor spa", "Beach across the road"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387/reviews",
      date: "August 2025",
    },
    {
      name: "Bonnie",
      rating: 5,
      comment:
        "We had the most incredible weekend at Jason's place, it exceeded all expectations! The home is beautifully presented, thoughtfully equipped, and instantly welcoming. The arcade games, theatre room, and karaoke setup made for the perfect winter escape, we barely needed to leave the house. Every little detail has been carefully considered, from the cozy furnishings to the fun-filled amenities. We loved the hot tub in the rain, waking up to sunrise over the beach, and soaking in the sunset views. The location was ideal for a relaxing winter break with friends, offering plenty of space and a great coastal vibe. Everything was spotless, the beds were super comfortable, and the outdoor area was perfect. Jason was a responsive and thoughtful host, and the check-in/out process was seamless thanks to his clear communication. We can't wait to come back. Highly recommend. 10/10!",
      highlight: ["arcade games", "theatre room", "karaoke", "hot tub in the rain", "sunrise over the beach"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387/reviews",
      date: "July 2025",
    },
    {
      name: "Susan",
      rating: 5,
      comment:
        "Wow, wow, WOW! From the minute we walked in the door of Jason's beautiful home, we knew we'd found someplace special. Our group was large, spanning three generations, and we had so much fun bouncing from one activity to the next... pool, ping pong, arcade games, karaoke, mini golf, trampoline... there was something for everyone! Five spacious bedrooms and 4.5 baths offered plenty of privacy while fantastic living areas enabled us to comfortably gather as a large group to relax and spend time together. The location was ideal with a great cafe a short stroll away and a kid-friendly beach directly across the street. It's clear that Jason takes pride in his luxurious, well-appointed home and goes to great lengths to offer his guests a 5-star experience. He was friendly, extremely accommodating on short notice and an absolute pleasure to work with. Our group all agreed we were lucky that Cyclone Alfred ruined our plans for Byron Bay because we had a perfect stay with you!",
      highlight: ["three generations", "arcade games", "mini golf", "kid-friendly beach", "5-star experience"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387/reviews",
      date: "March 2025",
    },
    {
      name: "Sue",
      rating: 5,
      comment:
        "Jason's property is beautiful and has so much entertainment for the whole family. We had 3 generations for a big family Christmas and everyone enjoyed. It was great to be able to just walk across the road to the beach. The photos show exactly what the property looks like. We would personally would have liked a comfortable alfresco couch and dining area at the rear of the property to enjoy lounging whilst watching the kids play in the pool. Jason was always very responsive, helpful and kindly answered all of our questions! We wouldn't hesitate to recommend this place for a family holiday.",
      highlight: ["3 generations", "big family Christmas", "walk across the road to the beach", "very responsive", "recommend"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387/reviews",
      date: "December 2024",
    },
    {
      name: "Lisa",
      rating: 5,
      comment: "Our stay at Jason's air bnb was absolutely fantastic for our large family. It was the perfect place to celebrate our daughter's 40th birthday and granddaughter's birthday with all our family. Thankyou very much Jason.",
      highlight: ["absolutely fantastic", "large family", "perfect place", "40th birthday"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387",
      date: "October 2025",
    },
    {
      name: "Andy",
      rating: 5,
      comment: "Amazing house, very clean and you will not run out of things to do! Thank you Jason",
      highlight: ["very clean", "not run out of things to do"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387",
      date: "October 2025",
    },
    {
      name: "Mohammad",
      rating: 5,
      comment:
        "Excellent house with 100% matching with pictures and descriptions. For a large family with children, it's an exceptional find. The host is very helpful and quick to respond. We thoroughly enjoyed our stay.",
      highlight: ["100% matching", "exceptional", "quick to respond", "large family"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387/reviews",
      date: "1 day ago",
    },
    {
      name: "Jayne",
      rating: 5,
      comment:
        "Amazing House, it had everything for the kids, very clean, we had a great time would highly recommend it, one of the best houses we have stayed in",
      highlight: ["everything for the kids", "very clean", "highly recommend", "best houses"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387/reviews",
      date: "4 days ago",
    },
    {
      name: "Osama",
      rating: 5,
      comment:
        "The house is more than amazing for all ages and so elegant. Jason is a great host always reachable and more than a nice person really appreciate what he did for us during our stay. We recommend this house and this host sooo much.",
      highlight: ["amazing", "all ages", "great host", "always reachable"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387/reviews",
      date: "1 week ago",
    },
    {
      name: "Sara",
      rating: 5,
      comment:
        "This was our second time staying at Jason’s! Such a great location and the house is full of activities for kids and adults of all ages! Also one of the cleanest AirBnb’s we’ve ever stayed at.",
      highlight: ["second time", "great location", "full of activities", "cleanest"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387/reviews",
      date: "1 week ago",
    },
    {
      name: "Madison",
      rating: 5,
      comment:
        "We were so happy with our stay! Jason was a great host and always responded promptly to any questions we had. The house was perfect in every way, spotlessly clean and filled with so many great amenities. Thank you again for a wonderful stay!",
      highlight: ["responded promptly", "spotlessly clean", "great amenities", "wonderful stay"],
      source: "airbnb",
      sourceUrl: "https://www.airbnb.com.au/rooms/1043607785247725387/reviews",
      date: "2 weeks ago",
    },
  ],
  localArea: {
    title: "Explore the Mornington Peninsula",
    description: "The Mornington Peninsula has long been a favourite destination for coastal holidays and cosy winter escapes. In the warmer months, swimming and surf beaches await whilst seaside restaurants and local markets provide an array of places to eat and drink.",
    attractions: [
      {
        name: "Rye Pier",
        type: "attraction",
        url: "https://www.visitmorningtonpeninsula.org/Places-To-See/Beaches-Coastline/Piers-Jetties/View/5b42f1e6af2d017d4be728e4/Rye-Pier",
        image: nearby("Rye pier.webp"),
        drive: { distanceKm: 3.1, durationMin: 6 },
      },
      {
        name: "Peninsula Hot Springs",
        type: "activity",
        url: "https://www.peninsulahotsprings.com/",
        image: nearby("Peninsular hot springs.jpeg"),
        drive: { distanceKm: 7.1, durationMin: 10 },
      },
      {
        name: "Alba Thermal Springs & Spa",
        type: "activity",
        url: "https://albathermalsprings.com.au/",
        image: nearby("alba.jpg"),
        drive: { distanceKm: 5.8, durationMin: 8 },
      },
      {
        name: "Rosebud Plaza",
        type: "shopping",
        url: "https://rosebudplaza.com.au/",
        image: nearby("rosebud plazza.jpg"),
        drive: { distanceKm: 4.2, durationMin: 6 },
      },
      {
        name: "Pt. Leo Estate",
        type: "restaurant",
        url: "https://www.ptleoestate.com.au/",
        image: nearby("Pt. Leo Estate.jpeg"),
        drive: { distanceKm: 27.7, durationMin: 28 },
      },
      {
        name: "The Cups Estate",
        type: "restaurant",
        url: "https://www.thecupsestate.com.au/",
        image: nearby("The cups estate.jpg"),
        drive: { distanceKm: 5.0, durationMin: 6 },
      },
      {
        name: "Moonah Links Golf",
        type: "activity",
        url: "https://www.moonahlinks.com.au/cms/",
        image: nearby("Moonah Links golf.jpg"),
        drive: { distanceKm: 6.4, durationMin: 9 },
      },
      {
        name: "The National Golf Club",
        type: "activity",
        url: "https://nationalgolf.com.au/",
        image: nearby("national golf.jpg"),
        drive: { distanceKm: 14.5, durationMin: 17 },
      },
      {
        name: "RACV Cape Schanck Resort",
        type: "activity",
        url: "https://www.racv.com.au/travel-experiences/resorts/cape-schanck/golf.html",
        image: nearby("Racv golf.jpg"),
        drive: { distanceKm: 14.3, durationMin: 16 },
      },
      {
        name: "The Dunes Golf Links",
        type: "activity",
        url: "https://thedunes.com.au/",
        image: nearby("the dunes.webp"),
        drive: { distanceKm: 4.6, durationMin: 7 },
      },
      // Drive times below are approximate from Tootgarook. Photos to be added to
      // `/public/Airbnb picture/nearby photos/` and referenced via image: nearby("...").
      {
        name: "Arthurs Seat Eagle",
        type: "attraction",
        url: "https://aseagle.com.au/",
        drive: { distanceKm: 19.2, durationMin: 22 },
      },
      {
        name: "Enchanted Adventure",
        type: "activity",
        url: "https://enchantedadventure.com.au/",
        drive: { distanceKm: 19.5, durationMin: 23 },
      },
      {
        name: "Moonlit Sanctuary Wildlife Park",
        type: "attraction",
        url: "https://moonlitsanctuary.com.au/",
        drive: { distanceKm: 41.5, durationMin: 40 },
      },
      {
        name: "Point Nepean National Park",
        type: "attraction",
        url: "https://www.parks.vic.gov.au/places-to-see/parks/point-nepean-national-park",
        drive: { distanceKm: 17.0, durationMin: 21 },
      },
      {
        name: "Cape Schanck Lighthouse",
        type: "attraction",
        url: "https://www.parks.vic.gov.au/places-to-see/points-of-interest/cape-schanck-lightstation",
        drive: { distanceKm: 20.8, durationMin: 24 },
      },
      {
        name: "Sorrento",
        type: "attraction",
        url: "https://www.visitmorningtonpeninsula.org/Destinations/Sorrento",
        drive: { distanceKm: 10.4, durationMin: 13 },
      },
    ],
  },
  contact: {
    email: "1975pointnepean@gmail.com",
  },
  // Booking URLs
  booking: {
    airbnb: "https://www.airbnb.com.au/rooms/1043607785247725387",
    bookingCom: "https://www.booking.com/hotel/au/amazing-backyard-max-entertain-beachside-retreat.en-gb.html",
    vrbo: "https://www.vrbo.com/en-au/holiday-rental/p9909000",
    directBooking: true, // Enable direct booking via inquiry form
  },
  // Awards and recognition
  awards: [
    {
      title: "Airbnb Host Awards",
      year: "2024",
      category: "Best Family Friendly Stay",
      image: icon("airbnb_award.jpg"),
    },
    {
      title: "Booking.com Traveller Review Awards",
      year: "2026",
      category: "Traveller Review Awards",
      image: icon("booking award.png"),
    },
  ],
};

// Blocked dates for calendar (format: YYYY-MM-DD)
// You can update this or import from iCal
export const blockedDates: string[] = [
  // Example blocked dates
  // "2024-06-15",
  // "2024-06-16",
  // "2024-07-01",
  // "2024-07-02",
];


