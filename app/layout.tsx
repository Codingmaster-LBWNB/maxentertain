import type { Metadata } from 'next'
import { Josefin_Sans, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { propertyConfig } from '@/config/property'
import { getSiteUrl } from '@/lib/site'
import GuestChatWidget from '@/components/GuestChatWidget'
import ThemeProvider from '@/components/ThemeProvider'
import { Analytics } from '@vercel/analytics/react'
import StickyMobileCTA from '@/components/StickyMobileCTA'

const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  weight: ['300', '400', '600', '700'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const SEO_TITLE = 'Mornington Peninsula Beachfront Retreat | MAX Entertain'
const SEO_DESCRIPTION =
  'Award-winning beachfront retreat on the Mornington Peninsula. 6 bedrooms, heated pool & spa, home theatre, 10 m from beach. Book direct & save.'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: 'Mornington Peninsula beachfront retreat, luxury vacation rental, family holiday house, heated pool spa, Tootgarook accommodation',
  authors: [{ name: propertyConfig.name }],
  alternates: {
    canonical: '/',
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    type: 'website',
    url: '/',
    images: [{ url: '/opengraph-image', alt: 'MAX Entertain beachfront retreat exterior — Mornington Peninsula' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: ['/twitter-image'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const iconHref = encodeURI('/Airbnb picture/icons_files/Icon.png')
  const chatEnabled = process.env.NEXT_PUBLIC_CHAT_ENABLED === 'true'

  return (
    <html lang="en" className={`${josefin.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Anti-flash: reads localStorage before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.classList.add('dark');localStorage.setItem('theme','dark')}catch(e){}})()`,
          }}
        />
        <link rel="icon" href={iconHref} type="image/png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-17899499107"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17899499107');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <div className="relative z-[1]">
            {children}
            {chatEnabled ? <GuestChatWidget /> : null}
            <StickyMobileCTA />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
