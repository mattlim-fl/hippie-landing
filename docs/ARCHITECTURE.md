# Architecture Overview

## Database Schema (Supabase)

### Core Tables

**`bookings`** - Central table for all booking types
- `id` (uuid, PK)
- `venue` (text) - 'manor' | 'hippie'
- `booking_type` (text) - 'karaoke' | 'priority_25_plus' | 'occasion' | 'venue_hire'
- `booking_date` (date)
- `start_time` (time) - For karaoke bookings
- `end_time` (time) - For karaoke bookings
- `customer_name` (text)
- `customer_email` (text)
- `customer_phone` (text)
- `guest_count` (integer)
- `ticket_quantity` (integer) - For ticket purchases
- `status` (text) - 'pending' | 'confirmed' | 'cancelled'
- `reference_code` (text) - Unique booking reference
- `share_token` (text) - For sharing group/occasion bookings
- `guest_list_token` (text) - For entry verification
- `karaoke_booth_id` (uuid, FK) - References karaoke_booths.id
- `parent_booking_id` (uuid, FK) - For child bookings (occasion guests)
- `is_occasion_organiser` (boolean) - True for occasion package creator
- `occasion_name` (text) - Name of the occasion/event
- `capacity` (integer) - For occasion packages
- `ticket_price_cents` (integer) - Price per ticket for occasion
- `created_at` (timestamp)

**`karaoke_booths`** - Booth definitions
- `id` (uuid, PK)
- `venue` (text) - 'manor' | 'hippie'
- `name` (text) - Display name
- `capacity` (integer) - Max guests
- `hourly_rate` (integer) - Price in cents per hour
- `is_active` (boolean)

**`karaoke_holds`** - Temporary slot reservations
- `id` (uuid, PK)
- `booth_id` (uuid, FK) - References karaoke_booths.id
- `venue` (text)
- `booking_date` (date)
- `start_time` (time)
- `end_time` (time)
- `session_id` (text) - Browser session identifier
- `expires_at` (timestamp) - Auto-expires after 5 minutes
- `created_at` (timestamp)

**`payments`** - Payment records
- `id` (uuid, PK)
- `booking_id` (uuid, FK) - References bookings.id
- `amount_cents` (integer)
- `payment_provider` (text) - 'square'
- `payment_id` (text) - External payment ID
- `status` (text) - 'pending' | 'completed' | 'failed'
- `created_at` (timestamp)

### Key Relationships

```
bookings
├── karaoke_booth_id → karaoke_booths.id (for karaoke bookings)
├── parent_booking_id → bookings.id (for occasion guest tickets)
└── id ← payments.booking_id (payment records)

karaoke_booths
└── id ← karaoke_holds.booth_id (active holds)
```

---

## Service Layer Architecture

### Service Pattern

All service functions follow this pattern:
1. Accept typed input parameters
2. Call Supabase Edge Function or direct DB query
3. Normalize response into consistent TypeScript interface
4. Throw descriptive errors on failure
5. Return typed result

### Service Files

**`src/services/karaoke.ts`**
- `fetchKaraokeAvailability()` - Get available time slots
- `fetchBoothsForSlot()` - Get booths for specific time
- `createKaraokeHold()` - Reserve slot temporarily (5min)
- `releaseKaraokeHold()` - Cancel reservation
- `payAndBookKaraoke()` - Process payment + create booking
- `getSessionId()` - Get/create localStorage session ID

**`src/services/occasion.ts`**
- `fetchOccasionByShareToken()` - Get occasion package details

**`src/services/ticketBooking.ts`**
- `fetchTicketGroup()` - Get group ticket details
- `createPaidTicketBooking()` - Purchase tickets with payment

---

## Edge Functions (Supabase)

### `karaoke-availability`
**Purpose:** Fetch available time slots for karaoke booths

**Input:**
```typescript
{
  venue: 'manor' | 'hippie'
  date: string // YYYY-MM-DD format
  partySize?: number
}
```

**Output:**
```typescript
{
  date: string
  venue: string
  booths: Array<{
    booth: { id: string; name: string; capacity: number }
    slots: Array<{ start_time: string; end_time: string; status: SlotStatus }>
  }>
}
```

**Logic:**
- Queries karaoke_booths for venue
- Generates time slots based on venue hours
- Checks existing bookings and holds
- Marks slots as 'available', 'held', or 'booked'

---

### `karaoke-holds`
**Purpose:** Create or release temporary slot reservations

**Actions:**
- `create` - Create 5-minute hold
- `release` - Cancel hold

**Input (create):**
```typescript
{
  boothId: string
  venue: string
  bookingDate: string
  startTime: string
  endTime: string
  sessionId: string
}
```

**Output:**
```typescript
{
  holdId: string,
  expires_at: string // ISO timestamp
}
```

**Logic:**
- Validates slot is available
- Creates hold record with 5-minute expiry
- Ties hold to session ID to prevent conflicts

---

### `karaoke-pay-and-book`
**Purpose:** Process payment and create confirmed booking

**Input:**
```typescript
{
  holdId: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  guestCount: number
  bookingDate: string
  venue: string
  startTime: string
  endTime: string
  boothId: string
  paymentToken: string // Square token
  ticketQuantity?: number
  sessionId: string
}
```

**Output:**
```typescript
{
  success: boolean
  bookingId: string
  referenceCode: string
  paymentId: string
  guestListToken?: string
  karaokeBooking: { id: string; referenceCode: string }
  ticketBooking?: { id: string; referenceCode: string }
}
```

**Logic:**
1. Validates hold exists and belongs to session
2. Processes payment via Square API
3. Creates booking record with 'confirmed' status
4. Deletes hold record
5. Generates reference code and guest list token
6. Invokes `send-email` function (fire-and-forget)

---

### `ticket-pay-and-book`
**Purpose:** Process ticket purchases (priority, group, occasion)

**Input:**
```typescript
{
  customerName: string
  customerEmail?: string
  customerPhone?: string
  venue: string
  bookingDate: string
  ticketQuantity: number
  ticketType: 'priority_25_plus' | 'general_admission' | 'occasion'
  paymentToken: string
  groupToken?: string
  parentBookingId?: string
}
```

**Output:**
```typescript
{
  success: boolean
  bookingId: string
  referenceCode: string
  guestListToken: string
  paymentId: string
  shareToken?: string
  shareUrl?: string
}
```

**Logic:**
1. Validates input and pricing
2. Processes payment via Square API
3. Creates booking record
4. Links to parent booking if group/occasion ticket
5. Generates share token for organizers
6. Sends confirmation email

---

### `send-email`
**Purpose:** Send transactional emails (confirmations, reminders)

**Templates:**
- `karaoke-confirmation` - Karaoke booking confirmation
- `ticket-confirmation` - Ticket purchase confirmation
- `occasion-invitation` - Occasion guest invitation

**Input:**
```typescript
{
  template: string
  data: {
    customerName: string
    customerEmail: string
    referenceCode: string
    // ... template-specific fields
  }
}
```

**Provider:** Resend (or configured email service)

---

## State Management

### TanStack Query

Used for all server state:
- Automatic caching
- Background refetching
- Loading/error states
- Optimistic updates

**Example:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['karaoke-availability', venue, date],
  queryFn: () => fetchKaraokeAvailability({ venue, date }),
})
```

### Form State

**react-hook-form** + **zod** for validation:
```typescript
const form = useForm<FormSchema>({
  resolver: zodResolver(schema),
  defaultValues: { /* ... */ },
})
```

### Local Storage

**Session ID:** Persisted for hold tracking
```typescript
localStorage.getItem('karaoke_session_id')
```

---

## Payment Flow

### Square Web Payments SDK

**Initialization:**
```typescript
const payments = Square.payments(SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID)
const card = await payments.card()
await card.attach('#card-container')
```

**Tokenization:**
```typescript
const result = await card.tokenize()
const token = result.token // Send to server
```

**Server Processing:**
- Edge function receives token
- Calls Square Payments API
- Creates payment record
- Returns payment ID

**Sandbox vs Production:**
- Sandbox: App ID starts with `sandbox-`
- Production: Regular app ID
- Configured in `src/lib/config.ts`

---

## Component Patterns

### Page Structure
```tsx
<PageLayout background="teal">
  <PageTitle>Page Title</PageTitle>
  <div className="container mx-auto px-4">
    {/* content */}
  </div>
</PageLayout>
```

### Modal Booking Flow
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* form fields */}
        <div id="card-container" /> {/* Square widget */}
        <Button type="submit">Book Now</Button>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

### Error Handling
```typescript
try {
  await payAndBookKaraoke(input)
  toast.success('Booking confirmed!')
} catch (error) {
  toast.error(error.message)
}
```

---

## Deployment

### Frontend (Netlify/Vercel)
- Build: `npm run build`
- Output: `dist/` directory
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Backend (Supabase)
- Database: PostgreSQL (hosted)
- Edge Functions: Deno runtime
- Environment variables:
  - `SQUARE_APPLICATION_ID`
  - `SQUARE_ACCESS_TOKEN`
  - `SQUARE_LOCATION_ID`
  - `RESEND_API_KEY`

---

## Security

### Row Level Security (RLS)

**Public read access:**
- `karaoke_booths` (active booths only)
- `bookings` (via share_token or guest_list_token)

**Restricted write access:**
- All writes via Edge Functions with service role key
- Client uses anon key (read-only)

### Payment Security

- Card details never touch frontend server
- Square tokenizes card data client-side
- Token sent to Edge Function
- Edge Function processes with Square API

### Hold Expiry

- Automatic cleanup via PostgreSQL triggers
- Expired holds (>5 minutes) deleted
- Prevents slot hoarding

---

## Performance Optimizations

### Image Optimization
- WebP format preferred
- Lazy loading for galleries
- Responsive image sizes

### Code Splitting
- React Router lazy loading
- Dynamic imports for heavy components

### Caching
- TanStack Query cache (5 minutes default)
- Stale-while-revalidate pattern
- Background refetching

---

## Future Enhancements

### Planned Features
- Photo tagging/search
- Event calendar integration
- Email newsletter signup
- Advanced reporting for venue owner
- SMS notifications

### Technical Debt
- Add comprehensive error logging (Sentry)
- Implement rate limiting on Edge Functions
- Add automated testing (Vitest + Playwright)
- Set up CI/CD pipeline

