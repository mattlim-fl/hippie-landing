import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID, SQUARE_SCRIPT_SRC } from "@/lib/config";
import {
  type Venue,
  type AvailabilityResponse,
  type SlotBooth,
  fetchKaraokeAvailability,
  fetchBoothsForSlot,
  createKaraokeHold,
  releaseKaraokeHold,
  payAndBookKaraoke
} from "@/services/karaoke";
import GuestListEditor from "./GuestListEditor";

interface KaraokeBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultVenue?: Venue;
}

export const KaraokeBookingModal = ({ isOpen, onClose, defaultVenue = 'manor' }: KaraokeBookingModalProps) => {
  const { toast } = useToast();
  
  // Form state
  const [venue] = useState<Venue>(defaultVenue);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [groupSize, setGroupSize] = useState<number>(2);
  const [sessionLengthHours, setSessionLengthHours] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Availability state
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [selectedBoothId, setSelectedBoothId] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [slotBooths, setSlotBooths] = useState<SlotBooth[]>([]);
  const [loadingBooths, setLoadingBooths] = useState(false);
  
  // Hold state
  const [hold, setHold] = useState<{ id: string; expiresAt: string } | null>(null);
  
  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [squarePayments, setSquarePayments] = useState<{ card: () => Promise<{ attach: (sel: string) => Promise<void>; tokenize: () => Promise<{ status: string; token: string; errors?: Array<{ message?: string }> }> }> } | null>(null);
  const [squareCard, setSquareCard] = useState<{ attach: (sel: string) => Promise<void>; tokenize: () => Promise<{ status: string; token: string; errors?: Array<{ message?: string }> }> } | null>(null);
  const [cardMounted, setCardMounted] = useState(false);
  
  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; ref: string; karaokeRef?: string; ticketRef?: string; guestListToken?: string } | null>(null);
  
  // Computed values
  const dateStr = useMemo(() => (date ? format(date, 'yyyy-MM-dd') : ''), [date]);
  const selectedBooth = useMemo(() => slotBooths.find(b => b.id === selectedBoothId) || null, [slotBooths, selectedBoothId]);
  const boothUnitPrice = selectedBooth?.hourly_rate ?? undefined;
  const ticketUnitPrice = 10;
  const ticketsQty = groupSize;
  const ticketsTotal = useMemo(() => ticketsQty * ticketUnitPrice, [ticketsQty]);
  const boothTotal = useMemo(() => {
    if (!boothUnitPrice) return 0;
    const durationMultiplier = sessionLengthHours === 2 ? 2 : 1;
    return Number(boothUnitPrice) * durationMultiplier;
  }, [boothUnitPrice, sessionLengthHours]);
  const grandTotal = useMemo(() => boothTotal + ticketsTotal, [boothTotal, ticketsTotal]);
  const formatAUD = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

  // Release hold when modal closes
  useEffect(() => {
    if (!isOpen && hold) {
      releaseKaraokeHold(hold.id).catch(() => {});
      setHold(null);
      setSelectedBoothId('');
      setSelectedSlot(null);
    }
  }, [isOpen, hold]);

  // Fetch availability when date changes
  useEffect(() => {
    if (!isOpen) return;
    if (!dateStr) return;
    setSelectedBoothId('');
    setSelectedSlot(null);
    setHold(null);
    setLoadingAvail(true);
    fetchKaraokeAvailability({ venue, date: dateStr, partySize: groupSize })
      .then(setAvailability)
      .catch((e) => {
        console.error(e);
        setError(e.message || 'Failed to load availability');
      })
      .finally(() => setLoadingAvail(false));
  }, [isOpen, venue, dateStr, groupSize]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDate(undefined);
      setGroupSize(2);
      setSessionLengthHours(1);
      setName('');
      setEmail('');
      setPhone('');
      setAvailability(null);
      setSelectedBoothId('');
      setSelectedSlot(null);
      setSlotBooths([]);
      setHold(null);
      setShowPayment(false);
      setSquareCard(null);
      setCardMounted(false);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const createHoldForBooth = async (boothId: string, start: string, end: string) => {
    setError(null);
    // Release any existing hold first
    if (hold) {
      try {
        await releaseKaraokeHold(hold.id);
      } catch (err) {
        console.debug('Failed to release existing hold before creating a new one', err);
      }
      setHold(null);
    }
    try {
      const res = await createKaraokeHold({ venue, booth_id: boothId, booking_date: dateStr, start_time: start, end_time: end });
      setHold({ id: res.hold_id, expiresAt: res.expires_at });
      setSelectedBoothId(boothId);
      setSelectedSlot({ start, end });
      // Auto-open payment step once a hold is successfully created
      setShowPayment(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || 'Failed to create hold');
    }
  };

  const cancelHold = async () => {
    if (!hold) return;
    try { await releaseKaraokeHold(hold.id); } catch (err) { console.debug('Failed to release hold', err); }
    setHold(null);
    setSelectedSlot(null);
    setSelectedBoothId('');
    setShowPayment(false);
  };

  // Load Square SDK when needed
  useEffect(() => {
    if (!showPayment || squareLoaded) return;
    const existing = document.querySelector(`script[src="${SQUARE_SCRIPT_SRC}"]`) as HTMLScriptElement | null;
    if (existing) { setSquareLoaded(true); return; }
    const script = document.createElement('script');
    script.src = SQUARE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => setSquareLoaded(true);
    script.onerror = () => setError('Failed to load payment SDK');
    document.body.appendChild(script);
  }, [showPayment, squareLoaded]);

  // Initialize payments instance when SDK is loaded
  useEffect(() => {
    if (!showPayment || !squareLoaded || squarePayments) return;
    const squareObj = (window as unknown as { Square?: { payments: (appId: string, locationId: string) => { card: () => Promise<{ attach: (sel: string) => Promise<void>; tokenize: () => Promise<{ status: string; token: string; errors?: Array<{ message?: string }> }> }> } } }).Square;
    if (!squareObj) return;
    try {
      const p = squareObj.payments(SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID);
      setSquarePayments(p);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to initialize payment SDK');
    }
  }, [showPayment, squareLoaded, squarePayments]);

  // Create and mount the card when payments is ready and payment view is visible
  useEffect(() => {
    let canceled = false;
    const mount = async () => {
      if (!showPayment || !squarePayments || squareCard || cardMounted) return;
      try {
        const card = await squarePayments.card();
        await card.attach('#hippie-card-container');
        if (!canceled) {
          setSquareCard(card);
          setCardMounted(true);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || 'Failed to mount payment form');
      }
    };
    mount();
    return () => { canceled = true; };
  }, [showPayment, squarePayments, squareCard, cardMounted]);

  // Cleanup card when closing payment step
  useEffect(() => {
    if (!showPayment) {
      setSquareCard(null);
      setCardMounted(false);
      const el = document.getElementById('hippie-card-container');
      if (el) el.innerHTML = '';
    }
  }, [showPayment]);

  const handlePayAndBook = async () => {
    if (!hold || !selectedSlot || !selectedBoothId || !dateStr) { setError('Missing selection details'); return; }
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!email.trim()) { setError('Please provide your email'); return; }
    if (!phone.trim()) { setError('Please provide your phone number'); return; }
    if (!groupSize || groupSize < 1) { setError('Please select group size'); return; }
    if (!squareCard) { setError('Payment form not ready'); return; }
    setSubmitting(true);
    setError(null);
    try {
      // Tokenize the mounted card
      const result = await squareCard.tokenize();
      if (result.status !== 'OK') throw new Error(result?.errors?.[0]?.message || 'Failed to tokenize card');

      const res = await payAndBookKaraoke({
        holdId: hold.id,
        customer_name: name,
        customer_email: email || undefined,
        customer_phone: phone || undefined,
        party_size: groupSize,
        venue,
        booking_date: dateStr,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        booth_id: selectedBoothId,
        ticket_quantity: groupSize,
        payment_token: result.token
      });
      
      const karaokeRef = res.karaoke_booking?.referenceCode || res.reference_code || '';
      const ticketRef = res.ticket_booking?.referenceCode || '';
      const primaryRef = karaokeRef || ticketRef;
      
      setSuccess({ 
        id: res.booking_id, 
        ref: primaryRef,
        karaokeRef: karaokeRef,
        ticketRef: ticketRef,
        guestListToken: res.guest_list_token
      });
      setShowPayment(false);
      
      toast({
        title: "Booking Confirmed!",
        description: "Your karaoke booth has been reserved. Check your email for confirmation.",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const canPay = useMemo(() => {
    const hasContact = Boolean(name.trim() && email.trim() && phone.trim());
    const ticketsOk = groupSize >= 1;
    const selectionOk = Boolean(hold && selectedSlot && selectedBoothId && dateStr);
    const paymentReady = Boolean(squareCard);
    // Extra safeguard: ensure client-side duration does not exceed 2 hours
    let durationOk = true;
    if (selectedSlot) {
      const toMinutes = (t: string) => {
        const [h, m] = t.slice(0, 5).split(':').map((v) => Number(v) || 0);
        return h * 60 + m;
      };
      const minutes = Math.max(0, toMinutes(selectedSlot.end) - toMinutes(selectedSlot.start));
      const hours = minutes / 60;
      durationOk = hours > 0 && hours <= 2;
    }
    return hasContact && ticketsOk && selectionOk && paymentReady && durationOk && !submitting;
  }, [name, email, phone, groupSize, hold, selectedSlot, selectedBoothId, dateStr, squareCard, submitting]);

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) onClose(); }} modal={true}>
      <DialogContent 
        className="max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto bg-hippie-charcoal border-hippie-gold"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking on calendar or other interactive elements
          const target = e.target as HTMLElement;
          if (target.closest('.rdp, [role="dialog"]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent closing when interacting with calendar
          const target = e.target as HTMLElement;
          if (target.closest('.rdp, [role="dialog"]')) {
            e.preventDefault();
          }
        }}
      >
        {!success && (
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-hippie-gold uppercase tracking-wide">
              Book Karaoke Booth at Manor
            </DialogTitle>
            <p className="text-sm text-hippie-white/70">
              50-minute sessions • Bookings available on the hour
            </p>
          </DialogHeader>
        )}

        {success ? (
          <div className="space-y-6">
            {/* Compact success header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <svg className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-hippie-white">Booking Confirmed!</h3>
              </div>
              <p className="text-sm text-hippie-white/70">
                Reference: <span className="font-mono font-medium text-hippie-gold">{success.karaokeRef || success.ref}</span>
              </p>
              <p className="text-sm text-hippie-white/60">
                Arrive 5 mins early. Full details have been sent to your email.
              </p>
            </div>

            {/* Guest list editor - prominent */}
            {success.id && success.guestListToken && (
              <GuestListEditor
                bookingId={success.id}
                token={success.guestListToken}
                heading="Add your guests to the door list"
                subheading="Enter the names of everyone in your group so they're on the door when they arrive."
              />
            )}

            <div className="flex justify-center">
              <Button onClick={onClose} className="hippie-btn-primary">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top section: Contact info and date picker in two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Contact information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-hippie-white">Full Name *</label>
                  <input
                    className="w-full border border-hippie-white/20 rounded-lg p-3 bg-hippie-charcoal-light text-hippie-white placeholder:text-hippie-white/40"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-hippie-white">Email *</label>
                  <input
                    type="email"
                    className="w-full border border-hippie-white/20 rounded-lg p-3 bg-hippie-charcoal-light text-hippie-white placeholder:text-hippie-white/40"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-hippie-white">Phone *</label>
                  <input
                    type="tel"
                    className="w-full border border-hippie-white/20 rounded-lg p-3 bg-hippie-charcoal-light text-hippie-white placeholder:text-hippie-white/40"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="Enter your phone"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-hippie-white">Group Size</label>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                      disabled={groupSize <= 1}
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-hippie-charcoal-light text-hippie-white border border-hippie-white/20 hover:bg-hippie-gold hover:text-hippie-charcoal"
                    >
                      -
                    </button>
                    <div className="min-w-[60px] text-center">
                      <span className="text-xl font-bold text-hippie-white">{groupSize}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setGroupSize(Math.min(10, groupSize + 1))}
                      disabled={groupSize >= 10}
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-hippie-charcoal-light text-hippie-white border border-hippie-white/20 hover:bg-hippie-gold hover:text-hippie-charcoal"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Right column: Date picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-hippie-white">Date *</label>
                <div className="bg-hippie-charcoal-light rounded-lg p-2 border border-hippie-white/20">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                    disabled={(d) => {
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      const dd = new Date(d);
                      dd.setHours(0,0,0,0);
                      const dayOfWeek = dd.getDay();
                      // Only allow Saturdays (day 6) and dates not in the past
                      return dd < today || dayOfWeek !== 6;
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Booth and slots */}
            {loadingAvail && (
              <div className="text-sm text-hippie-gold">Loading availability…</div>
            )}
            {availability && !loadingAvail && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <label className="text-sm font-medium text-hippie-gold">Select Time</label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs md:text-sm text-hippie-white/70">Session length</span>
                    <div className="inline-flex rounded-full border border-hippie-gold/50">
                      <button
                        type="button"
                        onClick={() => setSessionLengthHours(1)}
                        className={`px-3 py-1 text-xs md:text-sm font-medium rounded-full transition-colors ${
                          sessionLengthHours === 1 
                            ? 'bg-hippie-gold text-hippie-charcoal' 
                            : 'bg-transparent text-hippie-gold hover:bg-hippie-gold/20'
                        }`}
                      >
                        1 hour
                      </button>
                      <button
                        type="button"
                        onClick={() => setSessionLengthHours(2)}
                        className={`px-3 py-1 text-xs md:text-sm font-medium rounded-full transition-colors ${
                          sessionLengthHours === 2 
                            ? 'bg-hippie-gold text-hippie-charcoal' 
                            : 'bg-transparent text-hippie-gold hover:bg-hippie-gold/20'
                        }`}
                      >
                        2 hours
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  {availability.booths.map((b) => (
                    <div key={b.booth.id} className="space-y-3">
                      <p className="font-medium text-hippie-white">Time Slots</p>
                      <div className="flex flex-wrap gap-2">
                        {b.slots.map((s, idx) => {
                          const isTwoHour = sessionLengthHours === 2;
                          const nextSlot = isTwoHour ? b.slots[idx + 1] : undefined;
                          const canStartTwoHour =
                            isTwoHour &&
                            nextSlot &&
                            s.status === 'available' &&
                            nextSlot.status === 'available';
                          const slotStart = s.start_time;
                          const slotEnd = isTwoHour && canStartTwoHour ? nextSlot!.end_time : s.end_time;
                          const isSelected =
                            selectedSlot &&
                            selectedSlot.start === slotStart &&
                            selectedSlot.end === slotEnd;
                          const baseDisabled = s.status !== 'available' || !!hold;
                          const disabled = baseDisabled || (isTwoHour && !canStartTwoHour);
                          
                          return (
                            <button
                              key={idx}
                              disabled={disabled}
                              onClick={async () => {
                                const combinedStart = slotStart;
                                const combinedEnd = slotEnd;
                                setSelectedSlot({ start: combinedStart, end: combinedEnd });
                                setSelectedBoothId('');
                                setHold(null);
                                setLoadingBooths(true);
                                try {
                                  const booths = await fetchBoothsForSlot({
                                    venue,
                                    bookingDate: dateStr,
                                    startTime: combinedStart,
                                    endTime: combinedEnd,
                                    minCapacity: groupSize
                                  });
                                  setSlotBooths(booths);
                                } catch (e) {
                                  const msg = e instanceof Error ? e.message : String(e);
                                  setError(msg || 'Failed to load booths for slot');
                                } finally {
                                  setLoadingBooths(false);
                                }
                              }}
                              className={`px-3 py-2 rounded-md text-sm border font-medium transition-colors ${
                                isSelected
                                  ? 'bg-hippie-gold text-hippie-charcoal border-hippie-gold'
                                  : disabled
                                  ? 'bg-hippie-charcoal-light/50 text-hippie-white/40 border-hippie-white/10 cursor-not-allowed'
                                  : 'bg-hippie-teal text-hippie-white border-hippie-teal hover:bg-hippie-teal/80'
                              }`}
                            >
                              {s.start_time}–{s.end_time}
                              {isTwoHour && canStartTwoHour ? ' (2 hours)' : ''}
                              {s.status !== 'available' ? ` · ${s.status}` : ''}
                            </button>
                          );
                        })}
                      </div>

                      {/* Booth selector appears after slot selection */}
                      {selectedSlot && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-hippie-gold">Select Booth</label>
                          {loadingBooths ? (
                            <div className="flex items-center space-x-2 text-sm text-hippie-gold">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-hippie-gold"></div>
                              <span>Loading booths...</span>
                            </div>
                          ) : slotBooths.length === 0 ? (
                            <div className="text-sm text-hippie-white/50">No booths available for this slot</div>
                          ) : (
                            <Select value={selectedBoothId} onValueChange={(v) => {
                              setSelectedBoothId(v);
                              if (v) {
                                createHoldForBooth(v, selectedSlot.start, selectedSlot.end);
                              }
                            }}>
                              <SelectTrigger className="bg-hippie-charcoal-light border-hippie-white/20 text-hippie-white">
                                <SelectValue placeholder="Choose a booth" />
                              </SelectTrigger>
                              <SelectContent className="bg-hippie-charcoal border-hippie-white/20">
                                {slotBooths.map((booth) => (
                                  <SelectItem 
                                    key={booth.id} 
                                    value={booth.id}
                                    className="text-hippie-white hover:bg-hippie-gold/20"
                                  >
                                    {booth.name} · up to {booth.capacity} · ${booth.hourly_rate}/hr
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hold && (
              <div className="flex items-center justify-between rounded-md border border-hippie-gold/50 bg-hippie-gold/10 p-3">
                <p className="text-sm text-hippie-white">Slot reserved until {new Date(hold.expiresAt).toLocaleTimeString()}</p>
                <Button 
                  variant="outline" 
                  onClick={cancelHold}
                  className="bg-transparent border-hippie-white text-hippie-white hover:bg-hippie-white hover:text-hippie-charcoal"
                >
                  Release hold
                </Button>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-md bg-hippie-coral/20 border border-hippie-coral">
                <p className="text-sm text-hippie-coral">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Show invoice + card only after a hold is created */}
              {showPayment && (
                <>
                  <div className="rounded-md border border-hippie-gold/50 bg-hippie-gold/10 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-hippie-gold">Order Summary</h4>
                    </div>
                    <div className="divide-y divide-hippie-white/10">
                      <div className="py-2 flex text-sm">
                        <div className="flex-1">
                          <div className="font-medium text-hippie-white">Karaoke Booth</div>
                          <div className="text-hippie-white/60">Qty 1</div>
                        </div>
                        <div className="w-28 text-right text-hippie-white">{boothUnitPrice ? formatAUD(boothUnitPrice) : '—'}</div>
                        <div className="w-32 text-right font-medium text-hippie-white">{boothUnitPrice ? formatAUD(boothTotal) : '—'}</div>
                      </div>
                      <div className="py-2 flex text-sm">
                        <div className="flex-1">
                          <div className="font-medium text-hippie-white">Venue Tickets</div>
                          <div className="text-hippie-white/60">Qty {ticketsQty}</div>
                        </div>
                        <div className="w-28 text-right text-hippie-white">{formatAUD(ticketUnitPrice)}</div>
                        <div className="w-32 text-right font-medium text-hippie-white">{formatAUD(ticketsTotal)}</div>
                      </div>
                      <div className="py-2 flex text-sm">
                        <div className="flex-1" />
                        <div className="w-28 text-right font-medium text-hippie-gold">Total</div>
                        <div className="w-32 text-right font-medium text-hippie-gold">{formatAUD(grandTotal)}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-hippie-gold">Payment</label>
                    <div id="hippie-card-container" className="border border-hippie-white/20 rounded-md p-3 bg-white mt-2" />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md font-medium border-2 border-hippie-white bg-transparent text-hippie-white hover:bg-hippie-white hover:text-hippie-charcoal transition-colors"
                >
                  Cancel
                </button>
                <Button 
                  onClick={handlePayAndBook} 
                  disabled={!canPay}
                  className="hippie-btn-primary"
                >
                  {submitting ? 'Processing...' : 'PAY & BOOK'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
