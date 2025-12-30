import getSupabase from '../lib/supabaseClient'

export type Venue = 'manor' | 'hippie'

export interface Occasion {
  id: string
  venue: Venue
  occasion_name: string
  booking_date: string
  capacity: number
  ticket_price_cents: number
  customer_name: string | null // organiser name
  customer_email: string | null
  customer_phone: string | null
  guest_list_token: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}

export interface OccasionWithStats extends Occasion {
  total_guests: number
  remaining_capacity: number
}

export interface OccasionTicketBookingInput {
  shareToken: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  ticketQuantity: number
  paymentToken: string
}

export interface OccasionTicketBookingResult {
  bookingId: string
  referenceCode: string
  guestListToken: string
  paymentId: string
}

/**
 * Fetch occasion by organiser token (for organiser view)
 */
export async function fetchOccasionByOrganiserToken(token: string): Promise<OccasionWithStats | null> {
  const supabase = getSupabase()
  
  const { data: occasion, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('organiser_token', token)
    .eq('booking_type', 'occasion')
    .eq('is_occasion_organiser', true)
    .single()

  if (error || !occasion) {
    console.error('Failed to fetch occasion by organiser token:', error)
    return null
  }

  // Get child booking stats
  const { data: childBookings } = await supabase
    .from('bookings')
    .select('ticket_quantity')
    .eq('parent_booking_id', occasion.id)
    .neq('status', 'cancelled')

  const total_guests = childBookings?.reduce((sum, b) => sum + (b.ticket_quantity || 0), 0) || 0

  return {
    ...occasion,
    total_guests,
    remaining_capacity: occasion.capacity - total_guests,
  } as OccasionWithStats
}

/**
 * Fetch occasion by share token (for friend purchase view)
 */
export async function fetchOccasionByShareToken(token: string): Promise<OccasionWithStats | null> {
  const supabase = getSupabase()
  
  const { data: occasion, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('share_token', token)
    .eq('booking_type', 'occasion')
    .eq('is_occasion_organiser', true)
    .eq('status', 'confirmed')
    .single()

  if (error || !occasion) {
    console.error('Failed to fetch occasion by share token:', error)
    return null
  }

  // Get child booking stats
  const { data: childBookings } = await supabase
    .from('bookings')
    .select('ticket_quantity')
    .eq('parent_booking_id', occasion.id)
    .neq('status', 'cancelled')

  const total_guests = childBookings?.reduce((sum, b) => sum + (b.ticket_quantity || 0), 0) || 0

  return {
    ...occasion,
    total_guests,
    remaining_capacity: occasion.capacity - total_guests,
  } as OccasionWithStats
}

/**
 * Get organiser's booking for an occasion (if exists)
 * This returns a child booking if the organiser also purchased tickets
 */
export async function fetchOrganiserBooking(occasionId: string, organiserEmail: string) {
  const supabase = getSupabase()
  
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, booking_guests(*)')
    .eq('parent_booking_id', occasionId)
    .eq('customer_email', organiserEmail)
    .neq('status', 'cancelled')
    .single()

  if (error) {
    return null
  }

  return booking
}

/**
 * Create paid ticket booking for an occasion
 */
export async function createOccasionTicketBooking(input: OccasionTicketBookingInput): Promise<OccasionTicketBookingResult> {
  const supabase = getSupabase()

  if (!input.customerEmail && !input.customerPhone) {
    throw new Error('Either email or phone is required')
  }

  if (!input.paymentToken) {
    throw new Error('Payment token is required')
  }

  const { data, error } = await supabase.functions.invoke('occasion-pay-and-book', {
    body: {
      shareToken: input.shareToken,
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail?.trim(),
      customerPhone: input.customerPhone?.trim(),
      ticketQuantity: input.ticketQuantity,
      paymentToken: input.paymentToken,
    }
  })

  if (error) {
    const details = (error as any)?.context?.body || (error as any)?.context || undefined
    throw new Error(`Occasion booking error: ${error.message}${details ? ` | ${JSON.stringify(details)}` : ''}`)
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
  }
}
