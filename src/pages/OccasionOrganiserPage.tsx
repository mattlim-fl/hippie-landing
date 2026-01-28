import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Loader2, AlertCircle, Calendar, Users, Ticket, Share2, Copy, Check } from 'lucide-react'
import { Button } from '../components/ui/button'
import { getSupabase } from '../lib/supabaseClient'

interface OccasionDetails {
  id: string
  occasion_name: string
  booking_date: string
  venue: 'manor' | 'hippie'
  capacity: number
  ticket_price_cents: number
  share_token: string
  organiser_token: string
  customer_name: string | null
  total_bookings: number
  total_guests: number
  remaining_capacity: number
}

export default function OccasionOrganiserPage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [occasion, setOccasion] = useState<OccasionDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid link')
      setLoading(false)
      return
    }

    const loadOccasion = async () => {
      try {
        const supabase = getSupabase()

        // Fetch the occasion by organiser token
        const { data: occasion, error: occasionError } = await supabase
          .from('bookings')
          .select('*')
          .eq('organiser_token', token)
          .eq('booking_type', 'occasion')
          .eq('is_occasion_organiser', true)
          .single()

        if (occasionError || !occasion) {
          setError('This link is invalid or has expired')
          setLoading(false)
          return
        }

        // Get child booking stats
        const { data: childBookings } = await supabase
          .from('bookings')
          .select('ticket_quantity')
          .eq('parent_booking_id', occasion.id)
          .neq('status', 'cancelled')

        const total_bookings = childBookings?.length || 0
        const total_guests = childBookings?.reduce((sum, b) => sum + (b.ticket_quantity || 0), 0) || 0
        const remaining_capacity = (occasion.capacity || 0) - total_guests

        setOccasion({
          id: occasion.id,
          occasion_name: occasion.occasion_name || '',
          booking_date: occasion.booking_date,
          venue: occasion.venue,
          capacity: occasion.capacity || 0,
          ticket_price_cents: occasion.ticket_price_cents || 1000,
          share_token: occasion.share_token,
          organiser_token: occasion.organiser_token,
          customer_name: occasion.customer_name,
          total_bookings,
          total_guests,
          remaining_capacity,
        })
      } catch (err) {
        console.error('Error loading occasion:', err)
        setError('Failed to load occasion details')
      } finally {
        setLoading(false)
      }
    }

    loadOccasion()
  }, [token])

  const shareUrl = occasion?.share_token 
    ? `${window.location.origin}/occasion/buy/${occasion.share_token}`
    : ''

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formattedDate = occasion?.booking_date
    ? format(parseISO(occasion.booking_date), 'EEEE, MMMM d, yyyy')
    : ''

  const ticketPriceDisplay = occasion?.ticket_price_cents
    ? (occasion.ticket_price_cents / 100).toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })
    : '$0.00'

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#271308', color: '#FFFFFF' }}>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !occasion) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#271308', color: '#FFFFFF' }}>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h1 className="text-xl font-medium">{error || 'Something went wrong'}</h1>
            <p className="text-gray-400">This link may be invalid or expired.</p>
            <Link to="/">
              <Button variant="outline" className="mt-4">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Main organiser view
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#271308', color: '#FFFFFF' }}>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="bg-white text-gray-900 rounded-xl p-6 space-y-4">
            <h1 className="text-3xl font-semibold" style={{ color: '#CD3E28' }}>
              {occasion.occasion_name}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Ticket className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Ticket Price</p>
                  <p className="font-medium">{ticketPriceDisplay}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white text-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Attendance</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <p className="text-2xl font-bold" style={{ color: '#CD3E28' }}>
                  {occasion.total_guests}
                </p>
                <p className="text-sm text-gray-600">Guests</p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Ticket className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <p className="text-2xl font-bold" style={{ color: '#CD3E28' }}>
                  {occasion.total_bookings}
                </p>
                <p className="text-sm text-gray-600">Bookings</p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <p className="text-2xl font-bold" style={{ color: '#CD3E28' }}>
                  {occasion.remaining_capacity}
                </p>
                <p className="text-sm text-gray-600">Remaining</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 text-center">
                <strong>{occasion.total_guests}</strong> of <strong>{occasion.capacity}</strong> capacity filled
              </p>
            </div>
          </div>

          {/* Share Link */}
          <div className="bg-white text-gray-900 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold">Share with Friends</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Send this link to your friends so they can purchase tickets for your occasion.
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
              />
              <Button onClick={copyShareLink} className="flex items-center gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Back to home */}
          <div className="text-center">
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

