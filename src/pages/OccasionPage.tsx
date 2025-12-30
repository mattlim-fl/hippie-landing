import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Loader2, AlertCircle, Calendar, Users, Copy, Check, Share2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import GuestListEditor from '../components/GuestListEditor'
import { fetchOccasionByOrganiserToken, fetchOrganiserBooking, OccasionWithStats } from '../services/occasion'
import PageLayout from '../components/layout/PageLayout'
import PageTitle from '../components/layout/PageTitle'

export default function OccasionPage() {
  const { token } = useParams<{ token: string }>()

  const [loading, setLoading] = useState(true)
  const [occasion, setOccasion] = useState<OccasionWithStats | null>(null)
  const [organiserBooking, setOrganiserBooking] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedShare, setCopiedShare] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid link')
      setLoading(false)
      return
    }

    loadOccasion()
  }, [token])

  const loadOccasion = async () => {
    if (!token) return

    try {
      const occasionData = await fetchOccasionByOrganiserToken(token)
      if (!occasionData) {
        setError('This link is invalid or has expired')
      } else {
        setOccasion(occasionData)
        
        // Try to fetch organiser's booking if they have an email
        if (occasionData.customer_email) {
          const booking = await fetchOrganiserBooking(occasionData.id, occasionData.customer_email)
          setOrganiserBooking(booking)
        }
      }
    } catch (err) {
      setError('Failed to load occasion details')
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = async () => {
    if (!occasion) return
    
    const shareUrl = `${window.location.origin}/occasion/buy/${occasion.share_token}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Loading state
  if (loading) {
    return (
      <PageLayout variant="dark">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-hippie-gold" />
        </div>
      </PageLayout>
    )
  }

  // Error state
  if (error || !occasion) {
    return (
      <PageLayout variant="dark">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h1 className="text-xl font-medium text-hippie-white">{error || 'Something went wrong'}</h1>
            <p className="text-hippie-cream/70">This link may be invalid or expired.</p>
            <Link to="/">
              <Button className="hippie-btn-primary mt-4">
                Go to Home
              </Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }

  const formattedDate = format(parseISO(occasion.booking_date), 'EEEE, MMMM d, yyyy')
  const ticketPrice = (occasion.ticket_price_cents / 100).toFixed(2)
  const capacityPercent = (occasion.total_guests / occasion.capacity) * 100
  const shareUrl = `${window.location.origin}/occasion/buy/${occasion.share_token}`

  return (
    <PageLayout variant="dark">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageTitle>{occasion.name}</PageTitle>

        <div className="space-y-6 mt-8">
          {/* Info Card */}
          <div className="bg-hippie-charcoal/50 backdrop-blur-sm border border-hippie-gold/20 rounded-2xl p-6">
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-6 text-hippie-cream">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-hippie-gold" />
                  <span className="font-body">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-hippie-gold" />
                  <span className="font-body">${ticketPrice} per ticket</span>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-hippie-cream">
                  <span className="font-medium">Capacity</span>
                  <span className="font-bold text-hippie-gold">{occasion.total_guests}/{occasion.capacity}</span>
                </div>
                <div className="bg-hippie-charcoal rounded-full h-3 border border-hippie-gold/30">
                  <div
                    className={`h-full rounded-full transition-all ${
                      capacityPercent >= 100
                        ? 'bg-hippie-coral'
                        : capacityPercent >= 80
                        ? 'bg-yellow-500'
                        : 'bg-hippie-teal'
                    }`}
                    style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-hippie-cream/70">
                  {occasion.remaining_capacity} {occasion.remaining_capacity === 1 ? 'spot' : 'spots'} remaining
                </p>
              </div>
            </div>
          </div>

          {/* Share Link Card */}
          <div className="bg-gradient-to-r from-hippie-gold/20 to-hippie-coral/20 border border-hippie-gold/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-hippie-gold" />
              <h2 className="font-display text-lg text-hippie-white">Invite Your Friends</h2>
            </div>
            <p className="text-sm text-hippie-cream/80 font-body">
              Share this link so your friends can buy their own tickets for this occasion:
            </p>
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="flex-1 bg-hippie-charcoal border-hippie-gold/30 text-hippie-cream text-sm font-mono"
              />
              <Button 
                onClick={copyShareLink}
                className="hippie-btn-secondary shrink-0"
              >
                {copiedShare ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Guest List Editor */}
          {organiserBooking && organiserBooking.guest_list_token && (
            <div className="bg-hippie-charcoal/50 backdrop-blur-sm border border-hippie-gold/20 rounded-2xl p-6">
              <GuestListEditor
                bookingId={organiserBooking.id}
                token={organiserBooking.guest_list_token}
                heading="Your Guest List"
                subheading="Add the names of your guests so they're on the door when they arrive."
                showLinkedBookings={true}
              />
            </div>
          )}

          {/* Info */}
          <div className="bg-hippie-charcoal/50 backdrop-blur-sm border border-hippie-gold/20 rounded-2xl p-6">
            <h3 className="font-display text-lg text-hippie-white mb-4">Important Information</h3>
            <ul className="space-y-2 text-sm text-hippie-cream/80 font-body">
              <li>• All guests must bring valid ID</li>
              <li>• Tickets are non-refundable</li>
              <li>• Capacity is limited to {occasion.capacity} guests total</li>
              <li>• Share the link above so friends can purchase their own tickets</li>
            </ul>
          </div>

          <div className="text-center">
            <Link to="/">
              <Button className="hippie-btn-secondary">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

