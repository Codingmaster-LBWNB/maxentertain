import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { propertyConfig } from '@/config/property'

export const metadata: Metadata = {
  title: 'Privacy Policy | MAX Entertain Beachside Retreat',
  description:
    'How MAX Entertain Beachside Retreat collects, uses, and protects your personal information in accordance with the Australian Privacy Principles.',
  alternates: { canonical: '/privacy-policy' },
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '11 June 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-4">{title}</h2>
      <div className="space-y-3 text-white/75 leading-relaxed">{children}</div>
    </section>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0f0f0d]">
      <Navigation />
      <div className="container-custom px-6 md:px-8 lg:px-16 pt-[calc(7rem+env(safe-area-inset-top))] pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-luxury-gold" />
            <span className="text-luxury-gold text-sm font-sans font-semibold tracking-[0.22em] uppercase">
              Privacy
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-white/50 text-sm mb-10">Last updated: {LAST_UPDATED}</p>

          <Section title="Who we are">
            <p>
              MAX Entertain Beachside Retreat is a family-owned holiday rental at 1975 Point Nepean
              Road, Tootgarook VIC 3941, Australia. This policy explains how we handle personal
              information collected through this website, in line with the Australian Privacy Act
              1988 (Cth) and the Australian Privacy Principles (APPs).
            </p>
          </Section>

          <Section title="What we collect">
            <p>We collect only what we need to manage your enquiry and stay:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white/90">Enquiry and booking details</strong> — name, email
                address, phone number, stay dates, guest count, and any message you send us.
              </li>
              <li>
                <strong className="text-white/90">Payment information</strong> — payments are
                processed by Stripe. We never see or store your full card details; we receive only
                booking confirmation, amount, and a payment reference.
              </li>
              <li>
                <strong className="text-white/90">Chat messages</strong> — if you use the website
                chat assistant, your messages are processed to generate responses and may be
                retained to improve guest service.
              </li>
              <li>
                <strong className="text-white/90">Usage data</strong> — anonymous analytics
                (pages visited, approximate location, device type) via Vercel Analytics and Google
                advertising tags.
              </li>
            </ul>
          </Section>

          <Section title="How we use it">
            <ul className="list-disc pl-6 space-y-2">
              <li>Responding to enquiries and managing bookings, payments, and refunds</li>
              <li>Sending booking lifecycle emails (confirmation, pre-arrival details, follow-up)</li>
              <li>Meeting our obligations under Victorian short-stay accommodation rules</li>
              <li>Understanding how the website is used so we can improve it</li>
            </ul>
            <p>We do not sell or rent your personal information to anyone.</p>
          </Section>

          <Section title="Who we share it with">
            <p>
              We use a small number of service providers to run this website, each receiving only
              what they need: Stripe (payments), Resend (transactional email), MongoDB Atlas
              (secure data storage), Vercel (website hosting and analytics), Google (advertising
              measurement), and Google Gemini (chat assistant responses). Some providers store
              data outside Australia (typically the United States) under their own privacy
              safeguards.
            </p>
          </Section>

          <Section title="How long we keep it">
            <p>
              Booking and enquiry records are kept for as long as needed for guest service, tax,
              and legal purposes, then deleted. You may request deletion of your personal
              information at any time (subject to records we are legally required to keep).
            </p>
          </Section>

          <Section title="Cookies and analytics">
            <p>
              The site uses essential cookies (for example, to keep the owner admin area secure)
              and analytics/advertising tags from Vercel and Google. You can block or clear
              cookies in your browser settings without affecting your ability to browse the site
              or make an enquiry.
            </p>
          </Section>

          <Section title="Access, correction, and complaints">
            <p>
              You can request access to, correction of, or deletion of your personal information
              by emailing{' '}
              <a
                href={`mailto:${propertyConfig.contact.email}`}
                className="text-luxury-gold underline underline-offset-4 hover:text-white transition-colors"
              >
                {propertyConfig.contact.email}
              </a>
              . If you are not satisfied with our response, you may complain to the Office of the
              Australian Information Commissioner (oaic.gov.au).
            </p>
          </Section>

          <div className="mt-12 pt-8 border-t border-white/10 text-sm text-white/50">
            See also our{' '}
            <Link href="/terms" className="text-luxury-gold underline underline-offset-4 hover:text-white transition-colors">
              Booking Terms
            </Link>
            .
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
