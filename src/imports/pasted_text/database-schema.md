Below is the complete data model the database team should create.

1) User and Authentication Objects
users

Stores every account type in one place.

Fields

id
first_name
last_name
full_name
email unique
phone_number nullable
password_hash
role
attendee
organizer
staff
security
admin
status
active
pending
suspended
deleted
email_verified
phone_verified
default_language (en, am)
theme_preference (light, dark)
created_at
updated_at
last_login_at
otp_verifications

For login, registration, reset password, and phone/email verification.

Fields

id
user_id
purpose (signup, login, reset_password, verify_email, verify_phone)
code_hash
expires_at
attempt_count
verified_at
created_at
password_reset_tokens

Fields

id
user_id
token_hash
expires_at
used_at
created_at
2) Organizer Registration and Approval
organizer_profiles

Stores organizer-specific company/identity data.

Fields

id
user_id
organization_name
organization_type
non_profit
corporate
individual
government
website_url
bio
logo_url
tax_id_number
business_registration_number
social_linkedin
social_instagram
social_x
work_email
phone_number
bank_account_name
bank_account_number
iban
swift_code
routing_number
payout_currency
verification_status
pending
approved
rejected
approved_by_admin_id
approved_at
created_at
updated_at
organizer_documents optional but recommended

For business verification files.

Fields

id
organizer_profile_id
document_type
file_url
status
uploaded_at
3) Staff and Security Management
staff_members

For organizer-added staff/security users.

Fields

id
organizer_profile_id
full_name
email
phone_number
assigned_role (staff, security)
staff_badge_id
user_id nullable if they have login
status (active, inactive)
created_at
updated_at
security_sessions

For event-day check-in devices/scanner sessions.

Fields

id
event_id
staff_member_id
device_name
started_at
ended_at
status
4) Event Core Objects
events

Main event record used by discovery, details page, dashboard, and tickets.

Fields

id
organizer_profile_id
title
category_id
event_type (tech, music, workshop, gala, etc.)
description
rich_description_html optional
image_url
thumbnail_url
status
draft
published
cancelled
completed
visibility (public, private)
is_featured
is_trending
is_nearby_enabled
created_at
updated_at
event_schedule

Stores start and end datetime.

Fields

id
event_id
start_datetime
end_datetime
timezone
sales_start_datetime
sales_end_datetime
event_venues

Physical or online event location.

Fields

id
event_id
venue_name
address_line1
address_line2
city
region
country
latitude
longitude
google_place_id optional
online_meeting_url nullable
location_type (physical, online, hybrid)
event_categories

For filtering and discovery.

Fields

id
name
Examples: technology, sport, art, educational, music, cultural
slug
icon_url optional
is_active
event_tags

For search matching and keyword discovery.

Fields

id
name
slug
event_tag_map

Many-to-many between events and tags.

Fields

event_id
tag_id
event_media

For gallery/hero images.

Fields

id
event_id
media_type (image, video)
file_url
is_primary
sort_order
5) Ticketing and Reservation Objects
ticket_types

Each event can have multiple tiers.

Fields

id
event_id
tier_name (normal, vip, vvip, early_bird)
price
currency
capacity
remaining_quantity
sales_start_datetime
sales_end_datetime
promo_code_required
promo_code nullable
is_active
ticket_reservations

This is the correct replacement for a cart.

Fields

id
user_id
event_id
ticket_type_id
quantity
unit_price
subtotal
service_fee
total_price
status
active
expired
paid
cancelled
reserved_at
expires_at
created_at
updated_at

This supports the “save ticket then checkout before timer expires” flow from your document.

reservation_items optional if you want multiple ticket tiers in one reservation

Fields

id
reservation_id
ticket_type_id
quantity
unit_price
line_total
orders

Created after successful payment.

Fields

id
user_id
reservation_id
order_number
status (pending, paid, failed, refunded)
subtotal
service_fee
total_amount
payment_method
paid_at
created_at
payments

Stores gateway/payment records.

Fields

id
order_id
provider_name
provider_transaction_id
amount
currency
status
paid_at
raw_response_json
ticket_wallet

Digital ticket storage after purchase.

Fields

id
user_id
order_id
created_at
digital_tickets

The actual ticket shown on the digital ticket page.

Fields

id
ticket_wallet_id
event_id
ticket_type_id
ticket_code unique
qr_payload
qr_image_url
purchase_date
seat_number nullable
status
active
used
cancelled
refunded
6) Check-In and Security Scanning
ticket_scans

Stores every scan attempt.

Fields

id
digital_ticket_id
event_id
staff_member_id
scan_time
scan_result
valid
already_scanned
invalid
device_id nullable
location_note nullable
event_attendance_stats

For live organizer/security stats.

Fields

id
event_id
tickets_sold_total
checked_in_total
normal_sold
vip_sold
vvip_sold
updated_at
7) Saved Items / Bookmarks
saved_events

For users who save events before buying.

Fields

id
user_id
event_id
saved_at
saved_ticket_reservations

If you want to separate “saved event” from “reserved ticket.”

Fields

id
user_id
reservation_id
status
saved_at
8) Reviews and Ratings
event_reviews

Used on the event details page after the event is completed.

Fields

id
event_id
user_id
rating 1–5
review_text
status (visible, hidden, pending)
created_at
review_replies optional

For organizer responses.

Fields

id
review_id
organizer_profile_id
reply_text
created_at
9) Discovery, Homepage, and Search Support
featured_event_banners

For the hero carousel/banner.

Fields

id
event_id
title_override optional
subtitle_override optional
banner_image_url
sort_order
is_active
location_cache optional

If you want precomputed “near you” results.

Fields

id
event_id
city
lat
lng
distance_bucket
search_logs optional

Useful for analytics and improving discovery.

Fields

id
user_id nullable
search_query
filters_json
searched_at
10) Notifications and System Messages
notifications

For OTP, purchase confirmation, approval status, and reminders.

Fields

id
user_id
type
title
message
read_at
created_at
system_settings

For fees and site-wide behavior.

Fields

id
key
value
updated_at

Examples:

service fee percentage
reservation timer duration
minimum password length
supported languages
currency
11) What Each Frontend Page Must Receive
Landing Page
featured events
platform intro content
hero banner data
primary CTA links
logo/branding data
Discovery Homepage
categories
filters
event cards
trending events
near-you events
map markers
login/profile state
Event Detail Page
event info
venue info
ticket types
remaining quantities
reviews
related events
save state
Saved Tickets Page
saved ticket reservations
expiration timer
subtotal, service fee, total
checkout action
Checkout Page
reservation summary
payment amount
user details
payment status
Digital Ticket Wallet
purchased tickets
QR code data
event details
download/view actions
Organizer Dashboard
own events
ticket sales
revenue
live attendance
past events
reviews
staff list
Security Scanner Page
event selected
scanner status
scan result
total sold
checked-in count
capacity progress
12) Minimum Relations the DB Team Must Enforce
one user can have one organizer_profile
one organizer_profile can create many events
one event can have many ticket_types
one user can have many saved_events
one user can have many ticket_reservations
one reservation becomes one order
one order can create many digital_tickets
one digital_ticket can have many ticket_scans
one event can have many reviews
one event can have many staff_members