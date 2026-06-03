import type { Metadata } from 'next'
import SegmentLandingPage from '@/components/SegmentLandingPage'
import { segmentPages } from '@/lib/segmentPages'

const data = segmentPages['golf-accommodation-mornington-peninsula']

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.description,
  alternates: { canonical: '/golf-accommodation-mornington-peninsula' },
}

export default function Page() {
  return <SegmentLandingPage data={data} />
}
