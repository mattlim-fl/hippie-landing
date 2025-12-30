/* eslint-disable @typescript-eslint/no-explicit-any */
import getSupabase from '../lib/supabaseClient'

export type Venue = 'manor' | 'hippie'

export interface TicketGroup {
  organiserName: string
  venue: Venue
  bookingDate: string
  parentBookingId: string
}

export async function fetchTicketGroup(token: string): Promise<TicketGroup | null> {
  const supabase = getSupabase()
  
  const { data, error } = await supabase
    .from('bookings')
    .select('id, customer_name, venue, booking_date')
    .eq('share_token', token)
    .single()

  if (error || !data) {
    console.error('Failed to fetch ticket group:', error)
    return null
  }

  return {
    organiserName: data.customer_name,
    venue: data.venue as Venue,
    bookingDate: data.booking_date,
    parentBookingId: data.id,
  }
}

export interface CreatePaidTicketBookingInput {
  customerName: string
  customerEmail?: string
  customerPhone?: string
  venue: Venue
  bookingDate: string // YYYY-MM-DD (ignored if groupToken is provided)
  ticketQuantity: number
  ticketType?: 'priority_25_plus' | 'general_admission'
  paymentToken: string // Square payment token
  groupToken?: string // Optional: for guest purchases via shared link
}

export interface PaidTicketBookingResult {
  bookingId: string
  referenceCode: string
  guestListToken: string
  paymentId: string
  shareToken?: string // Only for organiser purchases
  shareUrl?: string // Only for organiser purchases
}

export async function createPaidTicketBooking(input: CreatePaidTicketBookingInput): Promise<PaidTicketBookingResult> {
  const supabase = getSupabase()

  if (!input.customerEmail && !input.customerPhone) {
    throw new Error('Either email or phone is required')
  }

  if (!input.paymentToken) {
    throw new Error('Payment token is required')
  }

  const { data, error } = await supabase.functions.invoke('ticket-pay-and-book', {
    body: {
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail?.trim(),
      customerPhone: input.customerPhone?.trim(),
      venue: input.venue,
      bookingDate: input.bookingDate,
      ticketQuantity: input.ticketQuantity,
      ticketType: input.ticketType || 'priority_25_plus',
      paymentToken: input.paymentToken,
      groupToken: input.groupToken,
    }
  })

  if (error) {
    const details = (error as any)?.context?.body || (error as any)?.context || undefined
    throw new Error(`Ticket booking error: ${error.message}${details ? ` | ${JSON.stringify(details)}` : ''}`)
  }

  const raw: any = data?.data ?? data

  if (!raw?.success) {
    throw new Error(String(raw?.error || 'Payment failed'))
  }

  return {
    bookingId: String(raw.bookingId),
    referenceCode: String(raw.referenceCode || ''),
    guestListToken: String(raw.guestListToken || ''),
    paymentId: String(raw.paymentId || ''),
    shareToken: raw.shareToken ? String(raw.shareToken) : undefined,
    shareUrl: raw.shareUrl ? String(raw.shareUrl) : undefined,
  }
}

