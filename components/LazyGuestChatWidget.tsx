'use client'

import dynamic from 'next/dynamic'

// Defer the chat widget bundle — it is below-the-fold UI and should never
// compete with hero content for bandwidth or hydration time.
const GuestChatWidget = dynamic(() => import('./GuestChatWidget'), { ssr: false })

export default function LazyGuestChatWidget() {
  return <GuestChatWidget />
}
