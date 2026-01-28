import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Check, X, Loader2, AlertCircle, Calendar, Info } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'
import GuestListEditor from '../components/GuestListEditor'
import { fetchOccasionByShareToken, type OccasionDetails } from '../services/occasion'
import { createPaidTicketBooking, type PaidTicketBookingResult } from '../services/ticketBooking'
import { SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID, SQUARE_SCRIPT_SRC } from '../lib/config'

export default function OccasionBuyPage() {
  const { token } = useParams<{ token: string }>()

  // Occasion data
  const [loading, setLoading] = useState(true)
  const [occasion, setOccasion] = useState<OccasionDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined)
  const [dateOfBirthString, setDateOfBirthString] = useState('')
  const [ticketQuantity, setTicketQuantity] = useState<number>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successBooking, setSuccessBooking] = useState<PaidTicketBookingResult | null>(null)

  // Square payment state
  const [squareLoaded, setSquareLoaded] = useState(false)
  const [squarePayments, setSquarePayments] = useState<{ 
    card: () => Promise<{ 
      attach: (sel: string) => Promise<void>
      tokenize: () => Promise<{ status: string; token: string; errors?: Array<{ message?: string }> }> 
    }> 
  } | null>(null)
  const [squareCard, setSquareCard] = useState<{ 
    attach: (sel: string) => Promise<void>
    tokenize: () => Promise<{ status: string; token: string; errors?: Array<{ message?: string }> }> 
  } | null>(null)
  const [cardMounted, setCardMounted] = useState(false)

  const quantityOptions = Array.from({ length: 10 }, (_, i) => i + 1)

  const ticketPriceCents = occasion?.ticket_price_cents || 1000
  const totalPriceCents = useMemo(() => ticketQuantity * ticketPriceCents, [ticketQuantity, ticketPriceCents])
  const totalPriceDisplay = useMemo(() => (totalPriceCents / 100).toLocaleString('en-AU', { style: 'currency', currency: 'AUD' }), [totalPriceCents])
  const ticketPriceDisplay = useMemo(() => (ticketPriceCents / 100).toLocaleString('en-AU', { style: 'currency', currency: 'AUD' }), [ticketPriceCents])

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
        } else if (data.remaining_capacity !== undefined && data.remaining_capacity <= 0) {
          setError('This occasion is at full capacity')
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
    const squareObj = (window as unknown as { Square?: { payments: (appId: string, locationId: string) => { card: () => Promise<{ attach: (sel: string) => Promise<void>; tokenize: () => Promise<{ status: string; token: string; errors?: Array<{ message?: string }> }> }> } } }).Square
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
        await card.attach('#occasion-card-container')
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

  const isAgeValid = () => {
    if (!dateOfBirth) return false
    const today = new Date()
    const age = today.getFullYear() - dateOfBirth.getFullYear()
    const monthDiff = today.getMonth() - dateOfBirth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      return age - 1 >= 18
    }
    return age >= 18
  }

  const calculateAge = () => {
    if (!dateOfBirth) return null
    const today = new Date()
    const age = today.getFullYear() - dateOfBirth.getFullYear()
    const monthDiff = today.getMonth() - dateOfBirth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      return age - 1
    }
    return age
  }

  const handleDateOfBirthChange = (value: string) => {
    setDateOfBirthString(value)
    if (value && value.length === 10) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setDateOfBirth(date)
      }
    } else {
      setDateOfBirth(undefined)
    }
  }

  const isFormValid = () => {
    return (email || phone) && 
           name.trim() && 
           ticketQuantity > 0 &&
           isAgeValid() &&
           squareCard !== null
  }

  const submit = async () => {
    if (!token || !occasion) return
    
    setFormError(null)
    if (!email && !phone) { setFormError('Provide an email or phone'); return }
    if (!name.trim()) { setFormError('Please provide your name'); return }
    if (!dateOfBirth) { setFormError('Please provide your date of birth'); return }
    if (!isAgeValid()) { setFormError('You must be 18 or older to purchase tickets'); return }
    if (!squareCard) { setFormError('Payment form not ready'); return }
    
    // Check capacity
    if (occasion.remaining_capacity !== undefined && ticketQuantity > occasion.remaining_capacity) {
      setFormError(`Only ${occasion.remaining_capacity} tickets remaining`);
      return;
    }
    
    setSubmitting(true)
    try {
      // Tokenize the card
      const result = await squareCard.tokenize()
      if (result.status !== 'OK') {
        throw new Error(result?.errors?.[0]?.message || 'Failed to process card')
      }

      // Create booking with parent_booking_id set to the occasion ID
      const res = await createPaidTicketBooking({
        customerName: name,
        customerEmail: email || undefined,
        customerPhone: phone || undefined,
        venue: occasion.venue,
        bookingDate: occasion.booking_date,
        ticketQuantity,
        paymentToken: result.token,
        ticketType: 'occasion',
        parentBookingId: occasion.id, // Link to the occasion
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
            <p className="text-gray-400">This link may be invalid or expired. Please ask the organiser for a new link.</p>
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

  // Success state
  if (successBooking) {
    return (
      <TooltipProvider>
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#271308', color: '#FFFFFF' }}>
          <div className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-lg bg-white text-gray-900 rounded-xl p-6 space-y-6">
              {/* Success header */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h3 className="text-xl font-medium">You're in!</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Reference: <span className="font-mono font-medium">{successBooking.referenceCode}</span>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 text-center">
                  You're attending <strong>{occasion.occasion_name}</strong> on <strong>{formattedDate}</strong>
                  {occasion.customer_name && <> hosted by <strong>{occasion.customer_name}</strong></>}
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

              <p className="text-sm text-gray-500 text-center">
                Make sure all guests bring valid ID. Full details have been sent to your email.
              </p>

              <div className="flex justify-center">
                <Link to="/">
                  <Button>Done</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Form state
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#271308', color: '#FFFFFF' }}>
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg bg-white text-gray-900 rounded-xl p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold" style={{ color: '#CD3E28' }}>{occasion.occasion_name}</h1>
              {occasion.customer_name && (
                <p className="text-gray-600">
                  Hosted by <strong>{occasion.customer_name}</strong>
                </p>
              )}
            </div>

            {/* Date display - locked */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formattedDate}</p>
              </div>
            </div>

            {/* Capacity warning */}
            {occasion.remaining_capacity !== undefined && occasion.remaining_capacity <= 10 && occasion.remaining_capacity > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800 text-center">
                  Only <strong>{occasion.remaining_capacity}</strong> {occasion.remaining_capacity === 1 ? 'spot' : 'spots'} remaining!
                </p>
              </div>
            )}

            {formError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{formError}</div>
            )}

            {/* Form fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex items-center">
                        <Info className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start" sideOffset={8} className="z-[100] max-w-xs">
                      <p>We don't store this information, but we use it to validate your age for booking purposes. We'll check your ID on the day to verify this information.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex gap-2">
                  <Input 
                    type="date" 
                    value={dateOfBirthString} 
                    onChange={(e) => handleDateOfBirthChange(e.target.value)}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="flex-1"
                  />
                  {calculateAge() !== null && (
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600 flex items-center gap-2">
                      <span>{calculateAge()} y.o.</span>
                      {isAgeValid() ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+61 ..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Tickets</label>
                <Select value={String(ticketQuantity)} onValueChange={(v) => setTicketQuantity(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    {quantityOptions.map((quantity) => {
                      const isAvailable = !occasion.remaining_capacity || quantity <= occasion.remaining_capacity
                      return (
                        <SelectItem key={quantity} value={String(quantity)} disabled={!isAvailable}>
                          {quantity} {quantity === 1 ? 'ticket' : 'tickets'}
                          {!isAvailable && ' (unavailable)'}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isAgeValid() && dateOfBirth && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">
                  You must be 18 years of age or older to purchase tickets.
                </p>
              </div>
            )}

            {isAgeValid() && ticketQuantity > 1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  All guests will need to be 18 years of age or older to use these tickets. Please make sure all of your guests have valid ID when you arrive.
                </p>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-3">
              <h4 className="text-sm font-medium">Order Summary</h4>
              <div className="flex justify-between text-sm">
                <span>{ticketQuantity} × Ticket ({ticketPriceDisplay} each)</span>
                <span className="font-medium">{totalPriceDisplay}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-medium text-lg">{totalPriceDisplay}</span>
              </div>
            </div>

            {/* Payment Card */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment</label>
              <div id="occasion-card-container" className="border border-gray-300 rounded-md p-3 bg-white min-h-[50px]" />
              {!squareCard && squareLoaded && (
                <p className="text-xs text-gray-500">Loading payment form...</p>
              )}
            </div>

            <Button onClick={submit} disabled={submitting || !isFormValid()} className="w-full">
              {submitting ? 'Processing...' : `Pay ${totalPriceDisplay}`}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

