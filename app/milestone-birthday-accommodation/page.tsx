import type { Metadata } from 'next'
import SegmentLandingPage from '@/components/SegmentLandingPage'
import { segmentPages } from '@/lib/segmentPages'

const data = segmentPages['milestone-birthday-accommodation']

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.description,
  alternates: { canonical: '/milestone-birthday-accommodation' },
}

export default function Page() {
  return <SegmentLandingPage data={data} />
}
