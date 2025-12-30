import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Loader2, AlertCircle, Calendar, Info } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import GuestListEditor from '../components/GuestListEditor'
import { fetchOccasionByShareToken, createOccasionTicketBooking, OccasionWithStats, OccasionTicketBookingResult } from '../services/occasion'
import { SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID, SQUARE_SCRIPT_SRC } from '../lib/config'
import PageLayout from '../components/layout/PageLayout'
import PageTitle from '../components/layout/PageTitle'

export default function OccasionTicketPage() {
  const { token } = useParams<{ token: string }>()

  // Occasion data
  const [loading, setLoading] = useState(true)
  const [occasion, setOccasion] = useState<OccasionWithStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [ticketQuantity, setTicketQuantity] = useState<number>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successBooking, setSuccessBooking] = useState<OccasionTicketBookingResult | null>(null)

  // Square payment state
  const [squareLoaded, setSquareLoaded] = useState(false)
  const [squarePayments, setSquarePayments] = useState<any>(null)
  const [squareCard, setSquareCard] = useState<any>(null)
  const [cardMounted, setCardMounted] = useState(false)

  const quantityOptions = Array.from({ length: Math.min(10, occasion?.remaining_capacity || 10)}, (_, i) => i + 1)

  const totalPriceCents = useMemo(() => {
    if (!occasion) return 0
    return ticketQuantity * occasion.ticket_price_cents
  }, [ticketQuantity, occasion])
  
  const totalPriceDisplay = useMemo(() => (totalPriceCents / 100).toLocaleString('en-AU', { style: 'currency', currency: 'AUD' }), [totalPriceCents])

  const formattedDate = useMemo(() => {
    if (!occasion?.booking_date) return ''
    try {
      return format(parseISO(occasion.booking_date), 'EEEE, MMMM d, yyyy')
    } catch {
      return occasion.booking_date
    }
  }, [occasion?.booking_date])

  // Fetch occasion details on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid link')
      setLoading(false)
      return
    }

    const loadOccasion = async () => {
      try {
        const data = await fetchOccasionByShareToken(token)
        if (!data) {
          setError('This link is invalid or has expired')
        } else {
          setOccasion(data)
        }
      } catch (err) {
        setError('Failed to load occasion details')
      } finally {
        setLoading(false)
      }
    }

    loadOccasion()
  }, [token])

  // Load Square SDK
  useEffect(() => {
    if (squareLoaded || !occasion) return
    const existing = document.querySelector(`script[src="${SQUARE_SCRIPT_SRC}"]`) as HTMLScriptElement | null
    if (existing) { setSquareLoaded(true); return }
    const script = document.createElement('script')
    script.src = SQUARE_SCRIPT_SRC
    script.async = true
    script.onload = () => setSquareLoaded(true)
    script.onerror = () => setFormError('Failed to load payment SDK')
    document.body.appendChild(script)
  }, [occasion, squareLoaded])

  // Initialize payments instance when SDK is loaded
  useEffect(() => {
    if (!squareLoaded || squarePayments || !occasion) return
    const squareObj = (window as any).Square
    if (!squareObj) return
    try {
      const p = squareObj.payments(SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID)
      setSquarePayments(p)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setFormError(msg || 'Failed to initialize payment SDK')
    }
  }, [squareLoaded, squarePayments, occasion])

  // Create and mount the card when payments is ready
  useEffect(() => {
    let canceled = false
    const mount = async () => {
      if (!squarePayments || squareCard || cardMounted || !occasion) return
      try {
        const card = await squarePayments.card()
        await card.attach('#occasion-ticket-card-container')
        if (!canceled) {
          setSquareCard(card)
          setCardMounted(true)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setFormError(msg || 'Failed to mount payment form')
      }
    }
    mount()
    return () => { canceled = true }
  }, [squarePayments, squareCard, cardMounted, occasion])

  const isFormValid = () => {
    return (email || phone) && 
           name.trim() && 
           ticketQuantity > 0 &&
           squareCard !== null
  }

  const submit = async () => {
    if (!token || !occasion) return
    
    setFormError(null)
    if (!email && !phone) { setFormError('Provide an email or phone'); return }
    if (!name.trim()) { setFormError('Please provide your name'); return }
    if (ticketQuantity > occasion.remaining_capacity) {
      setFormError(`Only ${occasion.remaining_capacity} spots remaining`)
      return
    }
    if (!squareCard) { setFormError('Payment form not ready'); return }
    
    setSubmitting(true)
    try {
      // Tokenize the card
      const result = await squareCard.tokenize()
      if (result.status !== 'OK') {
        throw new Error(result?.errors?.[0]?.message || 'Failed to process card')
      }

      const res = await createOccasionTicketBooking({
        shareToken: token,
        customerName: name,
        customerEmail: email || undefined,
        customerPhone: phone || undefined,
        ticketQuantity,
        paymentToken: result.token,
      })
      setSuccessBooking(res)
    } catch (e: any) {
      setFormError(e.message || 'Failed to process payment')
    } finally {
      setSubmitting(false)
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

  // Success state
  if (successBooking) {
    return (
      <PageLayout variant="dark">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-hippie-charcoal/80 backdrop-blur-sm border border-hippie-gold/30 rounded-2xl p-8 space-y-6">
            {/* Success header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <svg className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-xl font-display text-hippie-white">You're in!</h3>
              </div>
              <p className="text-sm text-hippie-cream/70 font-body">
                Reference: <span className="font-mono font-medium text-hippie-gold">{successBooking.referenceCode}</span>
              </p>
            </div>

            <div className="bg-hippie-gold/20 border border-hippie-gold/30 rounded-lg p-4">
              <p className="text-sm text-hippie-cream text-center font-body">
                You're joining <strong>{occasion.customer_name || 'the group'}</strong> for <strong>{occasion.occasion_name}</strong> on <strong>{formattedDate}</strong>
              </p>
            </div>

            {/* Guest list editor */}
            {successBooking.bookingId && successBooking.guestListToken && (
              <GuestListEditor
                bookingId={successBooking.bookingId}
                token={successBooking.guestListToken}
                heading="Add your guests to the door list"
                subheading="Enter the names of everyone in your group so they're on the door when they arrive."
              />
            )}

            <p className="text-sm text-hippie-cream/70 text-center font-body">
              Make sure all guests bring valid ID. Full details have been sent to your email.
            </p>

            <div className="flex justify-center">
              <Link to="/">
                <Button className="hippie-btn-primary">Done</Button>
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Form state
  return (
    <PageLayout variant="dark">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <PageTitle>{occasion.occasion_name}</PageTitle>

        <div className="mt-8 bg-hippie-charcoal/80 backdrop-blur-sm border border-hippie-gold/30 rounded-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <p className="text-hippie-cream/80 font-body">
              Invited by <strong className="text-hippie-gold">{occasion.customer_name || 'a friend'}</strong>
            </p>
          </div>

          {/* Date display */}
          <div className="bg-hippie-charcoal border border-hippie-gold/30 rounded-lg p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-hippie-gold" />
            <div>
              <p className="text-sm text-hippie-cream/60 font-body">Date</p>
              <p className="font-medium text-hippie-white font-body">{formattedDate}</p>
            </div>
          </div>

          {/* Capacity warning */}
          {occasion.remaining_capacity <= 5 && (
            <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-md p-3 flex items-start gap-2">
              <Info className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200 font-body">
                Only <strong>{occasion.remaining_capacity}</strong> {occasion.remaining_capacity === 1 ? 'spot' : 'spots'} remaining!
              </p>
            </div>
          )}

          {formError && (
            <div className="text-sm text-red-200 bg-red-900/30 border border-red-600/30 rounded-md p-3 font-body">{formError}</div>
          )}

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-hippie-cream font-body">Your Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="bg-hippie-charcoal border-hippie-gold/30 text-hippie-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-hippie-cream font-body">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" className="bg-hippie-charcoal border-hippie-gold/30 text-hippie-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-hippie-cream font-body">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+61 ..." className="bg-hippie-charcoal border-hippie-gold/30 text-hippie-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-hippie-cream font-body">Number of Tickets</label>
              <Select value={String(ticketQuantity)} onValueChange={(v) => setTicketQuantity(Number(v))}>
                <SelectTrigger className="bg-hippie-charcoal border-hippie-gold/30 text-hippie-white">
                  <SelectValue placeholder="Select quantity" />
                </SelectTrigger>
                <SelectContent>
                  {quantityOptions.map((quantity) => (
                    <SelectItem key={quantity} value={String(quantity)}>
                      {quantity} {quantity === 1 ? 'ticket' : 'tickets'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-hippie-charcoal/50 border border-hippie-gold/30 rounded-md p-4 space-y-3">
            <h4 className="text-sm font-medium text-hippie-white font-body">Order Summary</h4>
            <div className="flex justify-between text-sm text-hippie-cream font-body">
              <span>{ticketQuantity} × Ticket (${(occasion.ticket_price_cents / 100).toFixed(2)} each)</span>
              <span className="font-medium text-hippie-gold">{totalPriceDisplay}</span>
            </div>
            <div className="border-t border-hippie-gold/20 pt-2 flex justify-between">
              <span className="font-medium text-hippie-white font-body">Total</span>
              <span className="font-medium text-lg text-hippie-gold font-display">{totalPriceDisplay}</span>
            </div>
          </div>

          {/* Payment Card */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-hippie-cream font-body">Payment</label>
            <div id="occasion-ticket-card-container" className="border border-hippie-gold/30 rounded-md p-3 bg-hippie-charcoal min-h-[50px]" />
            {!squareCard && squareLoaded && (
              <p className="text-xs text-hippie-cream/60 font-body">Loading payment form...</p>
            )}
          </div>

          <Button onClick={submit} disabled={submitting || !isFormValid()} className="hippie-btn-primary w-full">
            {submitting ? 'Processing...' : `Pay ${totalPriceDisplay}`}
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}

