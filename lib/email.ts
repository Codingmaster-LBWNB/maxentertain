import { Resend } from 'resend'
import { propertyConfig } from '@/config/property'
import type { BookingRecord, GuestRecord } from '@/types/booking'

const PRE_STAY_SUBJECTS: Record<number, string> = {
  14: 'Your MAX Entertain stay is in two weeks',
  7: 'One week to go: MAX Entertain check-in prep',
  3: '3 days to check-in: final details',
  1: 'Tomorrow is check-in day at MAX Entertain',
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured')
  return new Resend(apiKey)
}

function getFromEmail() {
  return process.env.BOOKING_FROM_EMAIL ?? `MAX Entertain <bookings@maxentertain.com>`
}

function getOwnerEmail() {
  return process.env.OWNER_NOTIFICATION_EMAIL ?? propertyConfig.contact.email
}

function money(amount: number) {
  return `$${amount.toLocaleString()}`
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function dateRangeLine(booking: BookingRecord) {
  return `${booking.checkIn} to ${booking.checkOut} (${booking.nights} nights)`
}

async function sendEmail(params: {
  to: string | string[]
  subject: string
  html: string
  text: string
}) {
  const resend = getResendClient()
  return resend.emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  })
}

export async function sendBookingConfirmedEmail(booking: BookingRecord) {
  const cancellationUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? process.env.SITE_URL ?? 'https://maxentertain.com'}/manage-booking/${booking.cancellationToken}`
  const guestName = escapeHtml(booking.guest.name)
  const dateRange = escapeHtml(dateRangeLine(booking))
  const propertyName = escapeHtml(propertyConfig.name)
  const invoiceUrl = escapeHtml(booking.payment.stripeInvoiceUrl)
  const receiptUrl = escapeHtml(booking.payment.stripeReceiptUrl)
  const cancellationHref = escapeHtml(cancellationUrl)
  const invoiceLine = booking.payment.stripeInvoiceUrl
    ? `<p><a href="${invoiceUrl}">View invoice</a></p>`
    : ''
  const receiptLine = booking.payment.stripeReceiptUrl
    ? `<p><a href="${receiptUrl}">View payment receipt</a></p>`
    : ''

  return sendEmail({
    to: booking.guest.email,
    subject: `Booking confirmed: ${dateRangeLine(booking)}`,
    html: `
      <h2>Your booking is confirmed</h2>
      <p>Hi ${guestName},</p>
      <p>Thank you for booking ${propertyName}. Your stay is confirmed.</p>
      <p><strong>Dates:</strong> ${dateRange}</p>
      <p><strong>Total paid:</strong> ${money(booking.pricing.totalAud)}</p>
      <p><strong>Guests:</strong> ${booking.guest.guests}</p>
      <p><strong>Check-in:</strong> ${escapeHtml(propertyConfig.policies.checkIn)}</p>
      <p><strong>Check-out:</strong> ${escapeHtml(propertyConfig.policies.checkOut)}</p>
      ${invoiceLine}
      ${receiptLine}
      <p><a href="${cancellationHref}">Manage or cancel this booking</a></p>
      <p>We will send pre-stay details as your check-in date approaches.</p>
    `,
    text: [
      'Your booking is confirmed.',
      `Dates: ${dateRangeLine(booking)}`,
      `Total paid: ${money(booking.pricing.totalAud)}`,
      `Guests: ${booking.guest.guests}`,
      `Check-in: ${propertyConfig.policies.checkIn}`,
      `Check-out: ${propertyConfig.policies.checkOut}`,
      booking.payment.stripeInvoiceUrl ? `Invoice: ${booking.payment.stripeInvoiceUrl}` : '',
      booking.payment.stripeReceiptUrl ? `Receipt: ${booking.payment.stripeReceiptUrl}` : '',
      `Manage booking: ${cancellationUrl}`,
    ]
      .filter(Boolean)
      .join('\n'),
  })
}

export async function sendOwnerBookingAlert(booking: BookingRecord) {
  const guestName = escapeHtml(booking.guest.name)
  const guestEmail = escapeHtml(booking.guest.email)
  const guestPhone = escapeHtml(booking.guest.phone)
  const groupType = escapeHtml(booking.guest.groupType)
  const pets = escapeHtml(booking.guest.pets || 'None declared')
  const guestMessage = escapeHtml(booking.guest.message)
  const dateRange = escapeHtml(dateRangeLine(booking))
  const invoiceUrl = escapeHtml(booking.payment.stripeInvoiceUrl)
  const receiptUrl = escapeHtml(booking.payment.stripeReceiptUrl)

  return sendEmail({
    to: getOwnerEmail(),
    subject: `New direct booking: ${booking.guest.name} (${booking.checkIn} to ${booking.checkOut})`,
    html: `
      <h2>New direct booking confirmed</h2>
      <p><strong>Guest:</strong> ${guestName} (${guestEmail}, ${guestPhone})</p>
      <p><strong>Group type:</strong> ${groupType}</p>
      <p><strong>Pets:</strong> ${pets}</p>
      <p><strong>Guests:</strong> ${booking.guest.guests}</p>
      <p><strong>Dates:</strong> ${dateRange}</p>
      <p><strong>Total:</strong> ${money(booking.pricing.totalAud)}</p>
      <p><strong>Guest message:</strong> ${guestMessage}</p>
      ${
        booking.payment.stripeInvoiceUrl
          ? `<p><a href="${invoiceUrl}">Open Stripe invoice</a></p>`
          : ''
      }
      ${
        booking.payment.stripeReceiptUrl
          ? `<p><a href="${receiptUrl}">Open Stripe receipt</a></p>`
          : ''
      }
    `,
    text: [
      'New direct booking confirmed',
      `Guest: ${booking.guest.name} (${booking.guest.email}, ${booking.guest.phone})`,
      `Group type: ${booking.guest.groupType}`,
      `Pets: ${booking.guest.pets || 'None declared'}`,
      `Guests: ${booking.guest.guests}`,
      `Dates: ${dateRangeLine(booking)}`,
      `Total: ${money(booking.pricing.totalAud)}`,
      `Message: ${booking.guest.message}`,
      booking.payment.stripeInvoiceUrl ? `Invoice: ${booking.payment.stripeInvoiceUrl}` : '',
      booking.payment.stripeReceiptUrl ? `Receipt: ${booking.payment.stripeReceiptUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  })
}

export async function sendBookingCancelledEmail(
  booking: BookingRecord,
  refund: { refundAud: number; refundPercent: number; policyApplied: string }
) {
  const guestName = escapeHtml(booking.guest.name)
  const dateRange = escapeHtml(dateRangeLine(booking))
  const policyApplied = escapeHtml(refund.policyApplied)

  return sendEmail({
    to: booking.guest.email,
    subject: `Booking cancelled: ${booking.checkIn} to ${booking.checkOut}`,
    html: `
      <h2>Your booking has been cancelled</h2>
      <p>Hi ${guestName},</p>
      <p>Your booking for ${dateRange} has been cancelled.</p>
      <p><strong>Refund:</strong> ${money(refund.refundAud)} (${refund.refundPercent}%)</p>
      <p><strong>Policy applied:</strong> ${policyApplied}</p>
      <p>If you need help, reply to this email and we will assist.</p>
    `,
    text: [
      `Your booking (${dateRangeLine(booking)}) has been cancelled.`,
      `Refund: ${money(refund.refundAud)} (${refund.refundPercent}%)`,
      `Policy: ${refund.policyApplied}`,
    ].join('\n'),
  })
}

export async function sendOwnerCancellationAlert(
  booking: BookingRecord,
  refund: { refundAud: number; refundPercent: number; policyApplied: string }
) {
  const guestName = escapeHtml(booking.guest.name)
  const guestEmail = escapeHtml(booking.guest.email)
  const dateRange = escapeHtml(dateRangeLine(booking))
  const policyApplied = escapeHtml(refund.policyApplied)

  return sendEmail({
    to: getOwnerEmail(),
    subject: `Booking cancelled: ${booking.guest.name} (${booking.checkIn} to ${booking.checkOut})`,
    html: `
      <h2>Direct booking cancelled</h2>
      <p><strong>Guest:</strong> ${guestName} (${guestEmail})</p>
      <p><strong>Dates:</strong> ${dateRange}</p>
      <p><strong>Refund:</strong> ${money(refund.refundAud)} (${refund.refundPercent}%)</p>
      <p><strong>Policy applied:</strong> ${policyApplied}</p>
    `,
    text: [
      'Direct booking cancelled',
      `Guest: ${booking.guest.name} (${booking.guest.email})`,
      `Dates: ${dateRangeLine(booking)}`,
      `Refund: ${money(refund.refundAud)} (${refund.refundPercent}%)`,
      `Policy: ${refund.policyApplied}`,
    ].join('\n'),
  })
}

export async function sendPreStayEmail(booking: BookingRecord, daysBeforeCheckIn: number) {
  const subject = PRE_STAY_SUBJECTS[daysBeforeCheckIn] ?? `Your stay is coming up at ${propertyConfig.name}`
  const propertyName = escapeHtml(propertyConfig.name)
  const guestName = escapeHtml(booking.guest.name)
  const dateRange = escapeHtml(dateRangeLine(booking))

  return sendEmail({
    to: booking.guest.email,
    subject,
    html: `
      <h2>${propertyName}</h2>
      <p>Hi ${guestName},</p>
      <p>Your stay is coming up in ${daysBeforeCheckIn} day${daysBeforeCheckIn === 1 ? '' : 's'}.</p>
      <p><strong>Dates:</strong> ${dateRange}</p>
      <p><strong>Check-in:</strong> ${escapeHtml(propertyConfig.policies.checkIn)}</p>
      <p><strong>Check-out:</strong> ${escapeHtml(propertyConfig.policies.checkOut)}</p>
      <p>If your plans changed, please let us know as soon as possible.</p>
    `,
    text: [
      `Your stay is in ${daysBeforeCheckIn} day${daysBeforeCheckIn === 1 ? '' : 's'}.`,
      `Dates: ${dateRangeLine(booking)}`,
      `Check-in: ${propertyConfig.policies.checkIn}`,
      `Check-out: ${propertyConfig.policies.checkOut}`,
    ].join('\n'),
  })
}

export async function sendCheckoutFollowupEmail(booking: BookingRecord) {
  const propertyName = escapeHtml(propertyConfig.name)
  const guestName = escapeHtml(booking.guest.name)

  return sendEmail({
    to: booking.guest.email,
    subject: `Thank you for staying at ${propertyConfig.name}`,
    html: `
      <h2>Thank you for your stay</h2>
      <p>Hi ${guestName},</p>
      <p>Thank you for staying with us at ${propertyName}.</p>
      <p>We would love your honest review and feedback.</p>
      <p>If you would like to return, reply to this email and we can share a returning-guest direct-booking offer.</p>
    `,
    text: [
      `Thank you for staying at ${propertyConfig.name}.`,
      'We would love your honest review and feedback.',
      'Reply for a returning-guest direct-booking offer.',
    ].join('\n'),
  })
}

export async function sendInquiryReceivedEmails(input: {
  name: string
  email: string
  phone: string
  checkIn: string
  checkOut: string
  guests: string
  message: string
}) {
  const name = escapeHtml(input.name)
  const email = escapeHtml(input.email)
  const phone = escapeHtml(input.phone)
  const checkIn = escapeHtml(input.checkIn)
  const checkOut = escapeHtml(input.checkOut)
  const guests = escapeHtml(input.guests)
  const message = escapeHtml(input.message)
  const propertyName = escapeHtml(propertyConfig.name)

  const ownerText = [
    'New inquiry received',
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Dates: ${input.checkIn} to ${input.checkOut}`,
    `Guests: ${input.guests}`,
    `Message: ${input.message}`,
  ].join('\n')

  await sendEmail({
    to: getOwnerEmail(),
    subject: `New inquiry: ${input.name} (${input.checkIn} to ${input.checkOut})`,
    html: `
      <h2>New inquiry received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Dates:</strong> ${checkIn} to ${checkOut}</p>
      <p><strong>Guests:</strong> ${guests}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
    text: ownerText,
  })

  await sendEmail({
    to: input.email,
    subject: `Thanks for your enquiry: ${propertyConfig.name}`,
    html: `
      <h2>Thanks for reaching out</h2>
      <p>Hi ${name},</p>
      <p>Thanks for your enquiry about ${propertyName}. We have received your details and will get back to you within 24 hours.</p>
      <p><strong>Requested dates:</strong> ${checkIn} to ${checkOut}</p>
      <p><strong>Guests:</strong> ${guests}</p>
    `,
    text: [
      `Hi ${input.name},`,
      `Thanks for your enquiry about ${propertyConfig.name}.`,
      'We will get back to you within 24 hours.',
      `Requested dates: ${input.checkIn} to ${input.checkOut}`,
      `Guests: ${input.guests}`,
    ].join('\n'),
  })
}

export async function sendReturningGuestOfferEmail(guest: GuestRecord, campaign: { id: string; label: string }) {
  const name = escapeHtml(guest.name)
  const propertyName = escapeHtml(propertyConfig.name)

  return sendEmail({
    to: guest.email,
    subject: `${campaign.label}: returning guest direct-booking offer`,
    html: `
      <h2>${campaign.label}</h2>
      <p>Hi ${name},</p>
      <p>We would love to welcome you back to ${propertyName} for the next school holiday window.</p>
      <p>As a returning guest, reply to this email before booking and Jason can confirm the best direct-booking option for your dates.</p>
      <p>Book direct at maxentertain.com to avoid OTA service fees and deal with us personally.</p>
    `,
    text: [
      `Hi ${guest.name},`,
      `We would love to welcome you back to ${propertyConfig.name} for ${campaign.label}.`,
      'Reply to this email before booking and Jason can confirm the best direct-booking option for your dates.',
      'Book direct at maxentertain.com to avoid OTA service fees.',
    ].join('\n'),
  })
}
