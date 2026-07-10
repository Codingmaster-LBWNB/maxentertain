import type { NightBreakdown } from '@/lib/pricing'

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelling'
  | 'refund_pending'
  | 'expired'
  | 'cancelled'
  | 'refunded'
  | 'payment_orphaned'
  | 'completed'

export type BookingGroupType =
  | 'family'
  | 'corporate'
  | 'golf'
  | 'milestone'
  | 'other'

export interface BookingGuest {
  name: string
  email: string
  phone: string
  guests: number
  groupType: BookingGroupType
  pets: string
  /** Guest is travelling with a pet — triggers the pet cleaning fee. */
  withPet: boolean
  message: string
}

export interface BookingPricing {
  accommodationAud: number
  shortStayLevyRate: number
  shortStayLevyAud: number
  /** Flat pet cleaning fee added to the total when the guest travels with a pet. */
  petFeeAud: number
  totalAud: number
  totalCents: number
  nights: NightBreakdown[]
}

export interface BookingPayment {
  stripeSessionId?: string
  stripePaymentIntentId?: string
  stripeChargeId?: string
  stripeInvoiceId?: string
  stripeInvoiceUrl?: string
  stripeReceiptUrl?: string
  paidAt?: Date
}

export interface BookingArrival {
  /** Free-text arrival/check-in instructions: directions, parking, WiFi, etc. */
  details?: string
  /** Door/lockbox access code. Owner-only + guest pre-stay email; never public. */
  passcode?: string
  updatedAt?: Date
}

export interface BookingComms {
  commsEventsSent?: string[]
  lastEmailError?: string
  preStaySent?: number[]
  /** Exact send time per pre-stay offset, keyed by the day count (e.g. "3"). */
  preStaySentAt?: Record<string, Date>
  checkoutCompletedSent?: boolean
  reviewRequestedAt?: Date
  reviewSource?: 'google' | 'direct'
  reviewReceivedAt?: Date
}

export interface BookingRecord {
  _id: string
  propertyId: string
  status: BookingStatus
  guest: BookingGuest
  checkIn: string
  checkOut: string
  nights: number
  pricing: BookingPricing
  payment: BookingPayment
  stripeSessionId?: string
  source: 'direct'
  rulesAccepted: boolean
  cancellationToken: string
  cancelReason?: string
  refundAmountAud?: number
  refundStripeId?: string
  expiresAt?: Date
  confirmedAt?: Date
  cancelledAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  comms?: BookingComms
  arrival?: BookingArrival
}

export interface PublicBookingSummary {
  id: string
  status: BookingStatus
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  nights: number
  guestCount: number
  groupType: BookingGroupType
  pets: string
  pricing: BookingPricing
  invoiceUrl?: string
  receiptUrl?: string
  cancellationToken?: string
  cancellationUrl?: string
  confirmedAt?: string
}

export interface GuestRecord {
  _id: string
  propertyId: string
  name: string
  email: string
  phone: string
  tags: BookingGroupType[]
  totalBookings: number
  totalSpendAud: number
  marketingOptOut?: boolean
  lastBookingId: string
  lastCheckIn: string
  lastCheckOut: string
  lastStayedAt?: Date
  offerCampaignsSent?: string[]
  createdAt: Date
  updatedAt: Date
}

