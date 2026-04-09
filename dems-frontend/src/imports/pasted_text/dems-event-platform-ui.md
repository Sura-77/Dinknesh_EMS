Create a complete, high-fidelity UI design for a premium Ethiopian event platform called DEMS. The UI must follow the full product flow below and must be built so that frontend integration will be easy later. Use mock data for now, but every screen must already be structured around the expected API endpoints and database fields we discussed, so the developers can replace the mock values with real backend data without changing the UI structure. The platform flow and pages must follow the product flow document exactly.

Core product rules
The user must log in before saving any event and before buying any ticket.
Events are not cart products. Do not use “add to cart.” Use Save Event, Save Ticket, or Reserved Tickets.
The saved ticket must behave like a reservation with a checkout timer.
The UI must support the full flow from discovery to purchase to digital ticket storage.
Use a modern, elegant, enterprise-grade visual style with a subtle Ethiopian cultural identity.
Make the UI responsive: desktop-first, then tablet, then mobile.
Use polished spacing, soft shadows, rounded corners, clean typography, visible focus states, and accessible contrast.
Keep the cultural styling minimal and premium: a refined Ethiopian tricolor accent, a small woven pattern detail, or a subtle coffee-ceremony-inspired brand motif.
Global design direction
Clean white or dark base theme.
Thin Ethiopian tricolor accent line in the navbar.
Minimal geometric pattern or woven divider at key navigation edges.
Premium, polished, enterprise feel.
Balanced whitespace, strong hierarchy, no clutter.
Consistent buttons, chips, cards, inputs, and panels across all screens.
Pages to design
1) Landing page
Brand-focused intro to the platform.
Short explanation of what the platform does.
Clear CTA buttons:
Discover Events
Create Event
Elegant hero section.
Minimal cultural brand identity.
2) Discovery homepage

Must include:

Sticky navbar on every page.
Brand logo on the left.
Main links: Discover Events, My Tickets, Saved Events, Create Event.
Search field or search icon in the center.
Login/Signup button that becomes Profile after login.
Top hero/banner carousel for featured events.
Category filter chips.
Trending events section.
Optional Near You / Recommended section if location is available.
Event grid with event cards.
Footer with About Us, Contact, Terms, Privacy, and social links.
Clicking the logo returns to the landing page.
Event cards must show the same fields the backend will provide.
3) Search and discovery layout

Design a clean discovery view with:

Left filter panel.
Middle event result cards.
Bottom interactive discovery map.
Filters:
Category
Rating
Location by city only
Event format: online or in person
Price
Search must match event tags.
4) Interactive discovery map
Label: “Interactive Event Map”
Map markers as small circular event pins.
Right-side results panel titled “Events Near You”.
Each result card includes:
event image placeholder
event title
event date
event location
normal ticket price
Clicking a marker opens a preview popup card.
Include map controls:
Zoom In
Zoom Out
Locate Me
5) Authentication pages

Design clean screens for:

Login
Registration
OTP verification
Password reset
Profile state after login

Signup fields for attendee:

Email
Password
First name
Last name
Phone number if needed
OTP input
Reset password flow
Validation states
Error messages
Success states

Profile options after login:

Theme selector: White/Dark
Language selector: English/Amharic
Logout
6) Organizer signup

Design a detailed but elegant organizer onboarding form with:
Account Credentials

Full name
Work email
Password

Organization Details

Organization name
Organization type
Website URL
Short bio/description
Logo upload

Verification & Security

Phone number
Tax ID / Business Registration Number
Social media links

Payout Information

Bank account details

The form must feel secure, trustworthy, centered, and easy to use.

7) Approved organizer dashboard

After admin approval, the organizer dashboard navbar must show:

DEMS logo on the left
Create Event
Add Staff Member
Logout

Dashboard must include:

Live event data
Progress bar showing sold tickets vs check-ins
Total ticket sales by type:
Normal
VIP
VVIP
All planned events
Past events with reviews
Total tickets sold overall
Total revenue generated
8) Event creation form

When the organizer clicks Create Event, show a complete form with:

Basic Information

Event title
Event category/type
Organizer name/organization
Description with rich text support
Event image/thumbnail

Date and Time

Start date/time
End date/time

Location

Venue name
Physical address
City
Region
Google Maps integration
Online/virtual link optional

Ticketing and Capacity

Ticket types:
Early Bird
General Admission
VIP
VVIP
Price per type
Total capacity
Sales start/end date

Metadata for Discovery

Tags/keywords
9) Add staff member flow

Create either a modal or a dedicated Team page with fields:

Full name
Email address
Phone number
Assigned role: Staff or Security
Staff ID / Badge
10) Security staff interface

Design a mobile-first page for QR scanning with:

DEMS logo left
Logout button right
Large active camera feed/scanner area
Feedback overlay:
Green check for valid ticket
Red X for invalid or already scanned
Footer live stats:
Expected tickets sold
Checked-in count
Progress bar for current capacity
11) Event detail page

Create a premium, immersive event page with these sections in order:

Hero section

Large event image placeholder on the left
Event title, category, date, time, location, organizer, price range on the right
Primary button: Buy Ticket
Secondary button: Save Event

About This Event

Long description text area

Event Location

Venue details panel
Map area

Select Ticket Type

Horizontal ticket cards
Ticket tier name
Ticket price
Availability indicator
Quantity selector with plus/minus
Buy button

Attendee Reviews

Average rating display
Review cards with name, stars, and short text
12) Saved tickets page

This is not a cart page. It is a reserved tickets / saved tickets page.

Each saved item card should show:

Event image placeholder
Event title
Event date
Event location
Ticket price
Quantity selector
Remove button

Right-side summary panel:

Subtotal
Service fee
Total
Checkout timer
Proceed to Checkout button

Empty state:

Friendly icon or illustration
Short message
CTA back to homepage or discovery
13) Checkout timer component

Design a dedicated countdown component with:

Title: Checkout Time Remaining
Large countdown display
Warning message that reserved tickets expire if not completed
Buttons:
Continue Checkout
Cancel Purchase
Optional progress bar for remaining time
14) Digital ticket page

Create a secure and polished digital ticket wallet:

Navbar identical to the rest of the system
Page title: My Digital Tickets
Stacked ticket cards
Each ticket card includes:
Event image placeholder
Event title
Event date
Event location
Seat or ticket tier
Purchase date
QR code placeholder
Label: Scan this code at the event entrance
Buttons:
View Ticket Details
Download Ticket
Interaction and UX rules
Strong hover, active, focus, loading, and empty states.
Cards should feel clickable and premium.
Use tabs, chips, cards, and side panels in balanced layouts.
Keep the UI visually consistent across all pages.
Preserve the same logo, navbar behavior, and style language everywhere.
Responsive behavior
Desktop: two-column layouts where needed.
Tablet: stacked panels.
Mobile: simplified navigation, stacked cards, compact controls.
Security scanner must be optimized for mobile.
Accessibility
Good contrast.
Readable typography.
Visible focus states.
Clear labels and button text.
Usable for all users.
Data and integration requirement

Structure the UI using placeholder data that matches the backend objects and endpoints expected for the system, including:

users
organizer profiles
events
event schedules
venues
categories
tags
ticket types
saved events
ticket reservations
orders
payments
digital tickets
ticket scans
reviews
dashboard stats

Also make the screens compatible with the expected API groups:

auth
public discovery
event details
saved tickets / reservation
checkout / payment
digital tickets
reviews
organizer dashboard
staff management
security scanner
user profile settings
Final output expectation

Generate a complete UI design system and full page layouts for:

Landing page
Discovery homepage
Login / Signup / Profile
Event detail page
Saved tickets page
Checkout timer
Digital ticket wallet
Organizer dashboard
Event creation form
Add staff member flow
Security scanner page

The final result should feel like a professional, culturally inspired Ethiopian event platform with a premium enterprise feel, strong consistency, and a clear path from discovery to ticket purchase and ticket scanning.