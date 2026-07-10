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
  replyTo?: string
}) {
  const resend = getResendClient()
  const result = await resend.emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    ...(params.replyTo ? { replyTo: params.replyTo } : {}),
  })
  // Resend returns { data, error } and does NOT throw on API errors
  // (e.g. unverified sender domain). Surface those as real errors.
  if (result.error) {
    throw new Error(`Resend error: ${result.error.message ?? 'unknown'} (to: ${Array.isArray(params.to) ? params.to.join(', ') : params.to})`)
  }
  return result
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
      ${booking.pricing.petFeeAud > 0 ? `<p><strong>Includes pet cleaning fee:</strong> ${money(booking.pricing.petFeeAud)}</p>` : ''}
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
      booking.pricing.petFeeAud > 0 ? `Includes pet cleaning fee: ${money(booking.pricing.petFeeAud)}` : '',
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

export async function sendBookingRecoveryEmail(booking: BookingRecord) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? process.env.SITE_URL ?? 'https://maxentertain.com'
  const resumeUrl = `${baseUrl}/book?checkIn=${encodeURIComponent(booking.checkIn)}&checkOut=${encodeURIComponent(booking.checkOut)}`
  const guestName = escapeHtml(booking.guest.name || 'there')
  const dateRange = escapeHtml(dateRangeLine(booking))
  const propertyName = escapeHtml(propertyConfig.name)
  const resumeHref = escapeHtml(resumeUrl)

  return sendEmail({
    to: booking.guest.email,
    subject: `Still keen? Finish your ${propertyConfig.name} booking`,
    html: `
      <h2>You were almost there</h2>
      <p>Hi ${guestName},</p>
      <p>It looks like your booking for ${propertyName} didn't get finished. The dates you chose may still be available — you can pick up right where you left off.</p>
      <p><strong>Your dates:</strong> ${dateRange}</p>
      <p><strong>Total:</strong> ${money(booking.pricing.totalAud)} — booked direct, all fees included, no platform service charge.</p>
      <p style="margin:24px 0">
        <a href="${resumeHref}" style="background:#D4AF37;color:#111;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600">Finish my booking</a>
      </p>
      <p style="color:#666;font-size:13px">Dates are held only while you're checking out, so they may book up — securing them now is the safest bet. Just reply to this email if you have any questions before booking.</p>
    `,
    text: [
      `Hi ${booking.guest.name || 'there'},`,
      `It looks like your booking for ${propertyConfig.name} didn't get finished.`,
      `Your dates: ${dateRangeLine(booking)}`,
      `Total: ${money(booking.pricing.totalAud)} (booked direct, all fees included).`,
      '',
      `Finish your booking: ${resumeUrl}`,
      '',
      'Dates may book up, so securing them now is the safest bet. Reply to this email with any questions.',
    ].join('\n'),
  })
}

export async function sendOwnerBookingAlert(booking: BookingRecord) {
  const guestName = escapeHtml(booking.guest.name)
  const guestEmail = escapeHtml(booking.guest.email)
  const guestPhone = escapeHtml(booking.guest.phone)
  const groupType = escapeHtml(booking.guest.groupType)
  const petsDetail = booking.guest.pets ? ` — ${escapeHtml(booking.guest.pets)}` : ''
  const petLine = booking.guest.withPet
    ? `Yes (+${money(booking.pricing.petFeeAud)} pet fee)${petsDetail}`
    : `No${petsDetail}`
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
      <p><strong>Travelling with pet:</strong> ${petLine}</p>
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
      `Travelling with pet: ${petLine}`,
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

export async function sendOwnerPaymentIssueAlert(booking: BookingRecord, reason: string) {
  const guestName = escapeHtml(booking.guest.name)
  const guestEmail = escapeHtml(booking.guest.email)
  const dateRange = escapeHtml(dateRangeLine(booking))
  const issue = escapeHtml(reason)

  return sendEmail({
    to: getOwnerEmail(),
    subject: `Payment issue needs review: ${booking.checkIn} to ${booking.checkOut}`,
    html: `
      <h2>Payment issue needs review</h2>
      <p><strong>Reason:</strong> ${issue}</p>
      <p><strong>Guest:</strong> ${guestName} (${guestEmail})</p>
      <p><strong>Dates:</strong> ${dateRange}</p>
      <p><strong>Booking ID:</strong> ${escapeHtml(booking._id)}</p>
      <p>Please check Stripe and the owner dashboard before releasing or rebooking these dates.</p>
    `,
    text: [
      'Payment issue needs review',
      `Reason: ${reason}`,
      `Guest: ${booking.guest.name} (${booking.guest.email})`,
      `Dates: ${dateRangeLine(booking)}`,
      `Booking ID: ${booking._id}`,
    ].join('\n'),
  })
}

export async function sendPreStayEmail(booking: BookingRecord, daysBeforeCheckIn: number) {
  const subject = PRE_STAY_SUBJECTS[daysBeforeCheckIn] ?? `Your stay is coming up at ${propertyConfig.name}`
  const propertyName = escapeHtml(propertyConfig.name)
  const guestName = escapeHtml(booking.guest.name)
  const dateRange = escapeHtml(dateRangeLine(booking))

  // Arrival details + access code go out from the 3-day reminder onward (this
  // also covers last-minute bookings, where the 3-day email never fires and the
  // 1-day reminder is the first one the guest receives). Only included if the
  // owner has filled them in for this booking via the dashboard.
  const includeArrival = daysBeforeCheckIn <= 3
  const arrivalDetails = booking.arrival?.details?.trim()
  // The door code is a fixed property code stored server-side (DOOR_PASSCODE);
  // a per-booking value overrides it only if one is ever set. Either way it goes
  // out automatically from the 3-day reminder onward — no owner action needed.
  const arrivalPasscode = booking.arrival?.passcode?.trim() || process.env.DOOR_PASSCODE?.trim()
  const showArrival = includeArrival && (arrivalDetails || arrivalPasscode)

  const detailsHtml = arrivalDetails
    ? `<p>${escapeHtml(arrivalDetails).replace(/\n/g, '<br>')}</p>`
    : ''
  const passcodeHtml = arrivalPasscode
    ? `<p><strong>Door access code:</strong> ${escapeHtml(arrivalPasscode)}</p>` +
      `<p style="color:#888;font-size:13px">This code is active for your stay dates.</p>`
    : ''
  const arrivalHtml = showArrival
    ? `<h3>Arrival &amp; check-in details</h3>${detailsHtml}${passcodeHtml}`
    : ''

  const arrivalText = showArrival
    ? [
        '',
        'Arrival & check-in details:',
        arrivalDetails ?? '',
        arrivalPasscode ? `Door access code: ${arrivalPasscode} (active for your stay dates)` : '',
      ].filter(Boolean).join('\n')
    : ''

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
      ${arrivalHtml}
      <p>If your plans changed, please let us know as soon as possible.</p>
    `,
    text: [
      `Your stay is in ${daysBeforeCheckIn} day${daysBeforeCheckIn === 1 ? '' : 's'}.`,
      `Dates: ${dateRangeLine(booking)}`,
      `Check-in: ${propertyConfig.policies.checkIn}`,
      `Check-out: ${propertyConfig.policies.checkOut}`,
      arrivalText,
    ].filter(Boolean).join('\n'),
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

export async function sendUnansweredQuestionAlert(input: {
  guestName?: string
  guestEmail: string
  question: string
  transcript?: Array<{ role: string; content: string }>
  sessionId?: string
}) {
  const guestName = escapeHtml(input.guestName || 'A guest')
  const guestEmail = escapeHtml(input.guestEmail)
  const question = escapeHtml(input.question)
  const propertyName = escapeHtml(propertyConfig.name)

  const transcriptLines = (input.transcript ?? [])
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'Guest' : 'MAX'}: ${m.content}`)
  const transcriptHtml = transcriptLines.length
    ? `<h3>Recent conversation</h3><pre style="white-space:pre-wrap;font-family:inherit;background:#f5f5f5;padding:12px;border-radius:8px">${escapeHtml(transcriptLines.join('\n'))}</pre>`
    : ''

  await sendEmail({
    to: getOwnerEmail(),
    replyTo: input.guestEmail,
    subject: `MAX couldn't answer: "${input.question.slice(0, 60)}"`,
    html: `
      <h2>A guest question needs your reply</h2>
      <p>MAX (the chat assistant) could not answer this from the property info, so the guest asked to hear from you directly.</p>
      <p><strong>Guest:</strong> ${guestName}</p>
      <p><strong>Email:</strong> ${guestEmail} (just reply to this email to respond)</p>
      <p><strong>Question:</strong> ${question}</p>
      ${transcriptHtml}
      <p style="color:#888;font-size:12px">${propertyName}${input.sessionId ? ` · session ${escapeHtml(input.sessionId)}` : ''}</p>
    `,
    text: [
      'A guest question needs your reply.',
      `Guest: ${input.guestName || 'A guest'}`,
      `Email: ${input.guestEmail} (reply to this email to respond)`,
      `Question: ${input.question}`,
      transcriptLines.length ? `\nRecent conversation:\n${transcriptLines.join('\n')}` : '',
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
