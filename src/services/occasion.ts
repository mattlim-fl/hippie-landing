import { getSupabase } from '../lib/supabaseClient'

export interface OccasionDetails {
  id: string
  occasion_name: string
  booking_date: string
  venue: 'manor' | 'hippie'
  capacity: number
  ticket_price_cents: number
  share_token: string
  customer_name: string | null // organiser name
  total_guests?: number
  remaining_capacity?: number
}

/**
 * Fetches occasion/birthday package details by share token.
 * Calculates remaining capacity based on child ticket bookings.
 * Used for both organizer dashboard and guest ticket purchase pages.
 */
export async function fetchOccasionByShareToken(shareToken: string): Promise<OccasionDetails | null> {
  const supabase = getSupabase()

  // Fetch the occasion (parent booking)
  const { data: occasion, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('share_token', shareToken)
    .eq('booking_type', 'occasion')
    .eq('is_occasion_organiser', true)
    .single()

  if (error || !occasion) {
    console.error('Failed to fetch occasion:', error)
    return null
  }

  // Get child booking stats to calculate remaining capacity
  const { data: childBookings } = await supabase
    .from('bookings')
    .select('ticket_quantity')
    .eq('parent_booking_id', occasion.id)
    .neq('status', 'cancelled')

  const total_guests = childBookings?.reduce((sum, b) => sum + (b.ticket_quantity || 0), 0) || 0
  const remaining_capacity = (occasion.capacity || 0) - total_guests

  return {
    id: occasion.id,
    occasion_name: occasion.occasion_name || '',
    booking_date: occasion.booking_date,
    venue: occasion.venue,
    capacity: occasion.capacity || 0,
    ticket_price_cents: occasion.ticket_price_cents || 1000,
    share_token: occasion.share_token,
    customer_name: occasion.customer_name,
    total_guests,
    remaining_capacity,
  }
}

