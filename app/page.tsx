import Hero from '@/components/Hero'
import Navigation from '@/components/Navigation'
import PropertyDetails from '@/components/PropertyDetails'
import Amenities from '@/components/Amenities'
import Testimonials from '@/components/Testimonials'
import LocalArea from '@/components/LocalArea'
import ImageGallery from '@/components/ImageGallery'
import SleepArrangements from '@/components/SleepArrangements'
import StatsCards from '@/components/StatsCards'
import StarBackground from '@/components/StarBackground'
import Footer from '@/components/Footer'
import JsonLd from '@/components/JsonLd'
import AvailabilityInquirySync from '@/components/AvailabilityInquirySync'
import { propertyConfig } from '@/config/property'
import { getSiteUrl } from '@/lib/site'

export default function Home() {
  const siteUrl = getSiteUrl()
  const reviewCount = propertyConfig.testimonials.length
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
      streetAddress: propertyConfig.location,
      addressLocality: 'Tootgarook',
      addressRegion: 'VIC',
      postalCode: '3941',
      addressCountry: 'AU',
    },
    email: propertyConfig.contact.email,
    petsAllowed: propertyConfig.amenities.some((a) => /pet/i.test(a)),
    checkinTime: '15:00',
    checkoutTime: '10:00',
    numberOfRooms: propertyConfig.bedrooms,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: propertyConfig.maxGuests,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: String(reviewCount),
      bestRating: '5',
      worstRating: '1',
    },
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

  return (
    <main className="min-h-screen">
      <JsonLd data={jsonLd} />
      <Navigation />
      <Hero />
      {/* Star-background wrapper: all sections inside will float above the star canvas */}
      <div className="star-wrapper">
        <StarBackground />
        <StatsCards />
        <ImageGallery />
        <SleepArrangements />
        <PropertyDetails />
        <Amenities />
        <Testimonials />
        <LocalArea />
        <AvailabilityInquirySync />
      </div>
      <Footer />
    </main>
  )
}

