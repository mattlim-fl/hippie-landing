import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import GuestListEditor from '@/components/GuestListEditor'
import { fetchTicketGroup, createPaidTicketBooking, type TicketGroup, type PaidTicketBookingResult } from '@/services/ticketBooking'
import { useSquarePayment, useDateOfBirth } from '@/hooks'

const TICKET_PRICE_CENTS = 1000 // $10 per ticket

export default function GroupTicketPage() {
  const { token } = useParams<{ token: string }>()

  // Group data
  const [loading, setLoading] = useState(true)
  const [group, setGroup] = useState<TicketGroup | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [ticketQuantity, setTicketQuantity] = useState<number>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successBooking, setSuccessBooking] = useState<PaidTicketBookingResult | null>(null)

  // Use custom hooks for shared logic
  const { dateOfBirth, dateOfBirthString, handleChange: handleDateOfBirthChange, age, isAgeValid } = useDateOfBirth({
    minimumAge: 25, // 25+ for group tickets
  })

  const handleSquareError = useCallback((msg: string) => setFormError(msg), [])

  const { isReady: isPaymentReady, tokenize } = useSquarePayment({
    enabled: !!group,
    cardContainerId: '#hippie-group-ticket-card-container',
    onError: handleSquareError,
  })

  const quantityOptions = Array.from({ length: 10 }, (_, i) => i + 1)

  const totalPriceCents = useMemo(() => ticketQuantity * TICKET_PRICE_CENTS, [ticketQuantity])
  const totalPriceDisplay = useMemo(() => (totalPriceCents / 100).toLocaleString('en-AU', { style: 'currency', currency: 'AUD' }), [totalPriceCents])

  const formattedDate = useMemo(() => {
    if (!group?.bookingDate) return ''
    try {
      return format(parseISO(group.bookingDate), 'EEEE, MMMM d, yyyy')
    } catch {
      return group.bookingDate
    }
  }, [group?.bookingDate])

  // Fetch group details on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid link')
      setLoading(false)
      return
    }

    const loadGroup = async () => {
      try {
        const data = await fetchTicketGroup(token)
        if (!data) {
          setError('This link is invalid or has expired')
        } else {
          setGroup(data)
        }
      } catch {
        setError('Failed to load group details')
      } finally {
        setLoading(false)
      }
    }

    loadGroup()
  }, [token])

  const isFormValid = () => {
    return (email || phone) &&
           name.trim() &&
           ticketQuantity > 0 &&
           isAgeValid &&
           isPaymentReady
  }

  const submit = async () => {
    if (!token || !group) return

    setFormError(null)
    if (!email && !phone) { setFormError('Provide an email or phone'); return }
    if (!name.trim()) { setFormError('Please provide your name'); return }
    if (!dateOfBirth) { setFormError('Please provide your date of birth'); return }
    if (!isAgeValid) { setFormError('This ticket type is only for guests who are 25 or older'); return }
    if (!isPaymentReady) { setFormError('Payment form not ready'); return }

    setSubmitting(true)
    try {
      const paymentToken = await tokenize()

      const res = await createPaidTicketBooking({
        customerName: name,
        customerEmail: email || undefined,
        customerPhone: phone || undefined,
        venue: group.venue,
        bookingDate: group.bookingDate,
        ticketQuantity,
        paymentToken,
        groupToken: token,
      })
      setSuccessBooking(res)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to process payment'
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-hippie-charcoal text-hippie-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hippie-gold"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !group) {
    return (
      <div className="min-h-screen flex flex-col bg-hippie-charcoal text-hippie-white">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-md">
            <svg className="h-12 w-12 text-hippie-coral mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h1 className="text-xl font-medium">{error || 'Something went wrong'}</h1>
            <p className="text-hippie-white/60">This link may be invalid or expired. Please ask the organiser for a new link.</p>
            <Link to="/25-priority">
              <Button className="mt-4 hippie-btn-primary">
                Book your own tickets
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
        <div className="min-h-screen flex flex-col bg-hippie-charcoal text-hippie-white">
          <div className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-lg bg-hippie-charcoal-light text-hippie-white rounded-xl p-6 space-y-6 border border-hippie-gold/30">
              {/* Success header */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-medium">You're in!</h3>
                </div>
                <p className="text-sm text-hippie-white/70">
                  Reference: <span className="font-mono font-medium text-hippie-gold">{successBooking.referenceCode}</span>
                </p>
              </div>

              <div className="bg-hippie-gold/10 border border-hippie-gold/30 rounded-lg p-4">
                <p className="text-sm text-hippie-gold text-center">
                  You're joining <strong>{group.organiserName}'s</strong> group for <strong>{formattedDate}</strong>
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

              <p className="text-sm text-hippie-white/50 text-center">
                Make sure all guests bring valid ID. Full details have been sent to your email.
              </p>

              <div className="flex justify-center">
                <Link to="/">
                  <Button className="hippie-btn-primary">Done</Button>
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
      <div className="min-h-screen flex flex-col bg-hippie-charcoal text-hippie-white">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg bg-hippie-charcoal-light text-hippie-white rounded-xl p-6 space-y-6 border border-hippie-gold/30">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display uppercase tracking-wide text-hippie-gold">25+ Priority Entry</h1>
              <p className="text-hippie-white/70">
                You've been invited by <strong className="text-hippie-white">{group.organiserName}</strong>
              </p>
            </div>

            {/* Date display - locked */}
            <div className="bg-hippie-charcoal border border-hippie-white/20 rounded-lg p-4 flex items-center gap-3">
              <svg className="h-5 w-5 text-hippie-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <div>
                <p className="text-sm text-hippie-white/60">Date</p>
                <p className="font-medium text-hippie-white">{formattedDate}</p>
              </div>
            </div>

            {formError && (
              <div className="text-sm text-hippie-coral bg-hippie-coral/10 border border-hippie-coral/30 rounded-md p-3">{formError}</div>
            )}

            {/* Form fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-hippie-white">Your Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="bg-hippie-charcoal border-hippie-white/20 text-hippie-white placeholder:text-hippie-white/40"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-hippie-white">Date of Birth</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex items-center">
                        <svg className="h-4 w-4 text-hippie-white/40 cursor-help hover:text-hippie-white/60 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="16" x2="12" y2="12"/>
                          <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
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
                    className="flex-1 bg-hippie-charcoal border-hippie-white/20 text-hippie-white"
                  />
                  {age !== null && (
                    <div className="px-3 py-2 bg-hippie-charcoal border border-hippie-white/20 rounded-md text-sm text-hippie-white/70 flex items-center gap-2">
                      <span>{age} y.o.</span>
                      {isAgeValid ? (
                        <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-hippie-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-hippie-white">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="bg-hippie-charcoal border-hippie-white/20 text-hippie-white placeholder:text-hippie-white/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-hippie-white">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+61 ..."
                  className="bg-hippie-charcoal border-hippie-white/20 text-hippie-white placeholder:text-hippie-white/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-hippie-white">Number of Tickets</label>
                <Select value={String(ticketQuantity)} onValueChange={(v) => setTicketQuantity(Number(v))}>
                  <SelectTrigger className="bg-hippie-charcoal border-hippie-white/20 text-hippie-white">
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent className="bg-hippie-charcoal border-hippie-white/20">
                    {quantityOptions.map((quantity) => (
                      <SelectItem key={quantity} value={String(quantity)} className="text-hippie-white hover:bg-hippie-gold/20">
                        {quantity} {quantity === 1 ? 'ticket' : 'tickets'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isAgeValid && dateOfBirth && (
              <div className="bg-hippie-coral/10 border border-hippie-coral/30 rounded-md p-4">
                <p className="text-sm text-hippie-coral">
                  This ticket type is reserved only for guests who are 25 years of age or older.
                </p>
              </div>
            )}

            {isAgeValid && ticketQuantity > 1 && (
              <div className="bg-hippie-gold/10 border border-hippie-gold/30 rounded-md p-4">
                <p className="text-sm text-hippie-gold">
                  All guests will need to be 25 years of age or older to use these tickets. Please make sure all of your guests have valid ID when you arrive.
                </p>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-hippie-charcoal border border-hippie-white/20 rounded-md p-4 space-y-3">
              <h4 className="text-sm font-medium text-hippie-gold">Order Summary</h4>
              <div className="flex justify-between text-sm text-hippie-white">
                <span>{ticketQuantity} × 25+ Priority Entry ($10.00 each)</span>
                <span className="font-medium">{totalPriceDisplay}</span>
              </div>
              <div className="border-t border-hippie-white/10 pt-2 flex justify-between">
                <span className="font-medium text-hippie-white">Total</span>
                <span className="font-medium text-lg text-hippie-gold">{totalPriceDisplay}</span>
              </div>
            </div>

            {/* Payment Card */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-hippie-gold">Payment</label>
              <div id="hippie-group-ticket-card-container" className="border border-hippie-white/20 rounded-md p-3 bg-white min-h-[50px]" />
              {!isPaymentReady && group && (
                <p className="text-xs text-hippie-white/50">Loading payment form...</p>
              )}
            </div>

            <Button onClick={submit} disabled={submitting || !isFormValid()} className="w-full hippie-btn-primary">
              {submitting ? 'Processing...' : `Pay ${totalPriceDisplay}`}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
