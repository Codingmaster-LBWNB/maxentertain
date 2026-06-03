import type { Metadata } from 'next'
import SegmentLandingPage from '@/components/SegmentLandingPage'
import { segmentPages } from '@/lib/segmentPages'

const data = segmentPages['tootgarook-holiday-house']

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.description,
  alternates: { canonical: '/tootgarook-holiday-house' },
}

export default function Page() {
  return <SegmentLandingPage data={data} />
}
