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
  message: string
}

export interface BookingPricing {
  accommodationAud: number
  shortStayLevyRate: number
  shortStayLevyAud: number
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

export interface BookingComms {
  commsEventsSent?: string[]
  lastEmailError?: string
  preStaySent?: number[]
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

