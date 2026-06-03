import type { Metadata } from 'next'
import SegmentLandingPage from '@/components/SegmentLandingPage'
import { segmentPages } from '@/lib/segmentPages'

const data = segmentPages['corporate-retreat-mornington-peninsula']

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.description,
  alternates: { canonical: '/corporate-retreat-mornington-peninsula' },
}

export default function Page() {
  return <SegmentLandingPage data={data} />
}
