# Hippie Club Website - Product Requirements Document

## 1. Project Overview

### 1.1 Product Summary
The Hippie Club website is a promotional and booking platform for Hip-E Club, a nightclub located in Leederville, Perth, Western Australia. The site showcases the venue's retro/70s disco aesthetic and provides key functionality for patrons to view event photos, book venue hire, join guest lists, and access priority entry.

### 1.2 Goals
- Create an engaging, visually striking website that reflects the club's unique retro/disco brand identity
- Provide easy access to event photos for patrons ("Have you been snapped?")
- Enable venue hire inquiries for birthdays, occasions, and corporate events
- Facilitate guest list sign-ups and 25+ priority entry bookings
- Promote the karaoke booth hire service

### 1.3 Target Audience
- Primary: Nightclub patrons aged 25+ in Perth, Western Australia
- Secondary: Event planners looking for unique venue hire options
- Tertiary: Corporate clients for functions and celebrations

---

## 2. Pages & Features

### 2.1 Home Page
**Route:** `/`

**Purpose:** Landing page that serves as the main navigation hub with a bold, collage-style design.

**Features:**
- Hero section with "HIPPIE CLUB" branding and operating hours (Saturdays 9pm - 5am)
- Navigation buttons: Photos, Guest List, Venue Hire, 25+ Priority, Karaoke
- "Have you been snapped?" section with recent party photos
- Footer with logo, contact info, and social links

**Design Notes:**
- Collage-style background with vintage imagery, disco balls, vinyl records
- Yellow star element with pixelated eyes as brand element

---

### 2.2 Photos Page
**Route:** `/photos`

**Purpose:** Display a list of event dates that patrons can click to view photos from that night.

**Features:**
- List of dates (e.g., "22 NOVEMBER 2025") as clickable buttons
- Most recent date highlighted in gold/yellow
- Tagline: "Have you been snapped at Hippie Club?"
- Large venue photo with spinning text overlay

**Design Notes:**
- Dark charcoal background with swirling pattern
- Gold/yellow pill for most recent, white pills for others

---

### 2.3 Photo Gallery Page
**Route:** `/photos/:date`

**Purpose:** Display photo grid for a specific event date.

**Features:**
- Date displayed prominently
- Grid layout of photos (5 columns on desktop)
- Portrait-oriented photos in tilted/varied layout

**Design Notes:**
- Same dark swirling background as Photos page

---

### 2.4 Guest List Page
**Route:** `/guest-list`

**Purpose:** Information about birthday/occasion bookings and guest list sign-up.

**Features:**
- Image carousel with venue/party photos
- "Birthdays & Occasions" section
- "Enquire" CTA button
- Accordion sections:
  - Package Options
  - Customisation
  - Advance Bookings
- "Celebrate at Hip-E Club" starburst graphic

**Design Notes:**
- Teal/green background with swirling pattern
- Gold/yellow accent buttons

---

### 2.5 Venue Hire Page
**Route:** `/venue-hire`

**Purpose:** Showcase three venue hire options with details and pricing.

**Features:**
- Three venue cards:
  1. **Downstairs** - Main bar, dance floor, courtyard (50-150 guests)
  2. **Upstairs** - Karaoke booth, lounge bar (20-70 guests)
  3. **Full Venue** - Exclusive hire (150-250 guests)
- Each card includes:
  - Photo with overlay label
  - Description
  - Guest capacity
  - Accordion sections: Features, Capacity, Availability & Pricing, Access

**Design Notes:**
- Coral/red background with swirling pattern
- Gold/yellow accents for labels and expand icons

---

### 2.6 25+ Priority Page
**Route:** `/priority`

**Purpose:** Promote priority entry for 25+ crowd.

**Features:**
- Headline: "25+ PRIORITY"
- Description: "Disco from 11 'til late. Skip the queue with Priority Entry and head straight inside. Curated for a 25+ crowd."
- "Book Now" CTA button
- Large venue photo
- "Curated for a 25+ crowd" starburst graphic

**Design Notes:**
- Teal/green background with swirling pattern

---

### 2.7 Karaoke Page
**Route:** `/karaoke`

**Purpose:** Promote private karaoke booth hire.

**Features:**
- Image carousel with karaoke/party photos
- Headline: "Private karaoke booth now available for hire!"
- Description: "Perfect for birthdays, special occasions or just a fun night out with friends."
- "Book Now" CTA button

**Design Notes:**
- Dark charcoal background with swirling pattern

---

### 2.8 Group Ticket Page
**Route:** `/group/:token`

**Purpose:** Allow group members to purchase tickets for an occasion package.

**Features:**
- Display occasion details (organizer name, date, venue)
- Ticket purchase form with quantity selector
- Square payment integration
- Confirmation with booking reference

**Design Notes:**
- Teal/green background with swirling pattern
- Follows standard booking modal patterns

---

### 2.9 Occasion Buy Page
**Route:** `/occasion/buy/:token`

**Purpose:** Guest ticket purchase flow for birthday/occasion packages.

**Features:**
- Occasion package details
- Guest information form
- Payment processing
- Email confirmation

**Design Notes:**
- Consistent with other booking flows
- Mobile-responsive design

---

### 2.10 Occasion Organiser Page
**Route:** `/occasion/:token`

**Purpose:** Organizer dashboard to manage guest list and view bookings.

**Features:**
- Guest list management (add/remove guests)
- Share link generation for group tickets
- Booking summary and details
- Guest RSVP status tracking

**Design Notes:**
- Admin-style interface
- Table/list view for guest management

---

## 3. Design Specifications

### 3.1 Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| Charcoal | `#1a1a1a` | Dark page backgrounds |
| Charcoal Light | `#2a2a2a` | Swirl pattern accent |
| Teal | `#1b6b5a` | Green page backgrounds |
| Teal Dark | `#155a4a` | Swirl pattern accent |
| Coral | `#e85a4f` | Red page backgrounds |
| Coral Dark | `#c94a40` | Swirl pattern accent |
| Gold | `#f5b642` | Primary accent, buttons, highlights |
| Green Dark | `#2d5a4a` | Header pill backgrounds, page title badges |
| White | `#ffffff` | Text on dark backgrounds |
| Cream | `#f5f0e6` | Light text alternative |

### 3.2 Typography

| Font | Usage | Source |
|------|-------|--------|
| Blur Web Bold | Headings, logo, display text | `docs/hippie-assets/Fonts/BlurWeb-Bold W03 Regular.ttf` |
| Acumin Variable | Body text, descriptions | `docs/hippie-assets/Fonts/AcuminVariableConcept.otf` |

### 3.3 Visual Elements

- **Swirling Background Pattern:** Concentric oval/spiral shapes in slightly darker shade of page background color
- **Starburst Graphics:** Spiky circular badges with text (gold fill)
- **Rounded Pill Buttons:** Full rounded corners, gold fill or outline
- **Page Title Badges:** Dark green rounded pill with white text and rounded border

### 3.4 Iconography
- Social icons: Instagram, Facebook
- Accordion expand/collapse: Plus/minus symbols
- Navigation arrows: Chevron left/right in gold circles

---

## 4. Technical Requirements

### 4.1 Tech Stack
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Routing:** React Router v6
- **State Management:** TanStack Query (for data fetching)

### 4.2 Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- All pages must be fully functional on mobile devices

### 4.3 Performance
- Images optimized for web (WebP format preferred)
- Lazy loading for photo galleries
- Smooth page transitions and animations

### 4.4 Accessibility
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for all images
- Keyboard navigation support
- Sufficient color contrast

---

## 5. Contact Information

**Venue Details:**
- **Address:** 663 Newcastle St, Leederville WA 6060
- **Phone:** (08) 9227 8349
- **Email:** afterdark@themanorleederville.com.au
- **Hours:** Saturdays 9pm - 5am

**Social Media:**
- Instagram: @hippieclub (placeholder)
- Facebook: /hippieclub (placeholder)

---

## 6. Future Considerations

- Online booking integration for venue hire
- Photo tagging/search functionality
- Event calendar
- Email newsletter signup
- Integration with ticketing system




