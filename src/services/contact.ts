/**
 * Contact Form Service
 * Submits contact inquiries via Supabase Edge Function
 */
import getSupabase from '../lib/supabaseClient'

export type ContactCategory =
  | 'lost_property'
  | 'skantech'
  | 'function_inquiry'
  | 'business_hours'
  | 'something_else'

export type Venue = 'manor' | 'hippie' | 'daisys'

export interface ContactInquiryInput {
  venue: Venue
  category: ContactCategory
  name: string
  email: string
  phone?: string
  inquiryData: Record<string, unknown>
}

export interface ContactInquiryResult {
  success: boolean
  referenceCode?: string
  error?: string
}

/**
 * Submit a contact inquiry
 */
export async function submitContactInquiry(
  input: ContactInquiryInput
): Promise<ContactInquiryResult> {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase.functions.invoke('contact-inquiry', {
      body: input
    })

    if (error) {
      console.error('Contact inquiry error:', error)
      return {
        success: false,
        error: error.message || 'Failed to submit inquiry'
      }
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || 'Failed to submit inquiry'
      }
    }

    return {
      success: true,
      referenceCode: data.referenceCode
    }
  } catch (err) {
    console.error('Contact inquiry exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred'
    }
  }
}
