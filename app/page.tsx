import Hero from '@/components/Hero'
import Navigation from '@/components/Navigation'
import PropertyDetails from '@/components/PropertyDetails'
import Amenities from '@/components/Amenities'
import FAQ from '@/components/FAQ'
import Testimonials from '@/components/Testimonials'
import LocalArea from '@/components/LocalArea'
import ImageGallery from '@/components/ImageGallery'
import SleepArrangements from '@/components/SleepArrangements'
import StatsCards from '@/components/StatsCards'
import SegmentCTACards from '@/components/SegmentCTACards'
import StarBackground from '@/components/StarBackground'
import Footer from '@/components/Footer'
import JsonLd from '@/components/JsonLd'
import AvailabilityInquirySync from '@/components/AvailabilityInquirySync'
import { propertyConfig } from '@/config/property'
import { getSiteUrl } from '@/lib/site'
import { faqs } from '@/lib/faqs'

function schemaDateFromMonthYear(value: string) {
  const parsed = new Date(`${value} 1`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10)
}

export default function Home() {
  const siteUrl = getSiteUrl()
  const reviewCount = propertyConfig.testimonials.length
  const verifiedReviewCount = 120
  const avgRating =
    Math.round(
      (propertyConfig.testimonials.reduce((sum, t) => sum + t.rating, 0) / reviewCount) * 10
    ) / 10

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LodgingBusiness', 'VacationRental'],
    name: propertyConfig.name,
    description: propertyConfig.description,
    url: siteUrl,
    image: propertyConfig.images.slice(0, 8).map((p) => `${siteUrl}${encodeURI(p)}`),
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1975 Point Nepean Road',
      addressLocality: 'Tootgarook',
      addressRegion: 'VIC',
      postalCode: '3941',
      addressCountry: 'AU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -38.3657,
      longitude: 144.8784,
    },
    email: propertyConfig.contact.email,
    petsAllowed: propertyConfig.amenities.some((a) => /pet/i.test(a)),
    priceRange: 'From AUD 1800/night',
    checkinTime: '15:00',
    checkoutTime: '10:00',
    numberOfRooms: propertyConfig.bedrooms,
    numberOfBedrooms: propertyConfig.bedrooms,
    numberOfBathroomsTotal: propertyConfig.bathrooms,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: propertyConfig.maxGuests,
    },
    starRating: {
      '@type': 'Rating',
      ratingValue: '5',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: String(verifiedReviewCount),
      bestRating: '5',
      worstRating: '1',
    },
    review: propertyConfig.testimonials.slice(0, 6).map((t) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: t.name },
      reviewRating: { '@type': 'Rating', ratingValue: String(t.rating), bestRating: '5' },
      reviewBody: t.comment,
      datePublished: schemaDateFromMonthYear(t.date),
    })),
    amenityFeature: propertyConfig.amenities.slice(0, 12).map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    })),
    sameAs: [
      propertyConfig.booking?.airbnb,
      propertyConfig.booking?.bookingCom,
      propertyConfig.booking?.vrbo,
    ].filter(Boolean),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <main className="min-h-screen">
      <JsonLd data={jsonLd} />
      <JsonLd data={faqJsonLd} />
      <Navigation />
      <Hero />
      {/* Star-background wrapper: all sections inside will float above the star canvas */}
      <div className="star-wrapper">
        <StarBackground density="light" />
        <StatsCards />
        <SegmentCTACards />
        <ImageGallery />
        <SleepArrangements />
        <PropertyDetails />
        <Amenities />
        <FAQ />
        <Testimonials />
        <LocalArea />
        <AvailabilityInquirySync />
      </div>
      <Footer />
    </main>
  )
}

