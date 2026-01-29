# Hippie Club Website - Development Guidelines

## Project Context

This is the Hippie Club (Hip-E Club) nightclub website - a promotional and booking platform for a Perth, WA nightclub with a retro/70s disco aesthetic.

**Venue:** `hippie`

## Tech Stack

- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui for base components
- React Router v6 for navigation
- TanStack Query for data fetching
- Supabase for backend (PostgreSQL + Edge Functions)
- Square Web Payments SDK for payment processing

## Brand Colors

Use the `hippie` color tokens defined in `tailwind.config.ts`:

```
hippie.charcoal   - #1a1a1a (dark backgrounds)
hippie.teal       - #1b6b5a (green backgrounds)
hippie.coral      - #e85a4f (red backgrounds)
hippie.gold       - #f5b642 (accents, buttons)
hippie.greenDark  - #2d5a4a (header pills, page titles)
hippie.white      - #ffffff (text on dark)
hippie.cream      - #f5f0e6 (light text alternative)
```

## Typography

- **Headings/Display:** `font-display` (Blur Web Bold)
- **Body:** `font-body` (Acumin Variable)

## File Structure

```
src/
├── components/
│   ├── layout/      # Header, Footer, PageLayout, PageTitle
│   └── ui/          # shadcn/ui components
├── pages/           # Route page components
├── services/        # API client functions (Supabase Edge Functions)
├── hooks/           # Custom React hooks (useSquarePayment, useDateOfBirth)
└── lib/             # Utilities (config, supabaseClient, utils)
```

## Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | Home | Landing page with navigation |
| `/photos` | Photos | Event photo gallery dates |
| `/photos/:albumId` | PhotoGallery | Individual album gallery |
| `/venue-hire` | VenueHire | Venue hire information |
| `/guest-list` | GuestList | Birthday/occasion packages |
| `/manage-guest-list/:token` | ManageGuestList | Manage guest list |
| `/group/:token` | GroupTicketPage | Group ticket purchase |
| `/occasion/buy/:token` | OccasionBuyPage | Guest ticket purchase |
| `/occasion/:token` | OccasionOrganiserPage | Organizer guest list |

## Background Variants

Pages use one of three background patterns:
- `bg-pattern-dark` - Charcoal with swirls (Photos)
- `bg-pattern-teal` - Green with swirls (Guest List, Priority)
- `bg-pattern-coral` - Red with swirls (Venue Hire)

## Component Patterns

**Page Structure:**
```tsx
<PageLayout background="teal">
  <PageTitle>Title</PageTitle>
  {/* content */}
</PageLayout>
```

**Button Styles:**
- Primary: `hippie-btn-primary` (gold filled)
- Secondary: `hippie-btn-secondary` (outlined)
- Pill: `hippie-btn-pill` (rounded)

## Custom Hooks

- `useSquarePayment` - Manages Square SDK loading and card tokenization
- `useDateOfBirth` - Handles date input and age validation (18+)

## Environment Variables

Required in `.env.local`:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

## Coding Conventions

1. Use TypeScript for all components
2. Prefer Tailwind classes over inline styles
3. Use the `hippie.*` color tokens, not hex codes
4. Follow mobile-first responsive design
5. Keep components small and focused
6. Extract reusable logic into custom hooks in `/src/hooks/`

## Data Models

**Karaoke Booking Flow:**
1. Fetch availability → 2. Create hold (5min) → 3. Process payment → 4. Booking confirmed

**Occasion Flow:**
1. Organizer creates occasion → 2. Share link with guests → 3. Guests purchase tickets
