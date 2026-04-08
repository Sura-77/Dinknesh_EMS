// Type definitions matching the database schema and API responses

export type UserRole = 'attendee' | 'organizer' | 'staff' | 'security' | 'admin';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'deleted';
export type ThemePreference = 'light' | 'dark';
export type Language = 'en' | 'am';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  phone_verified: boolean;
  default_language: Language;
  theme_preference: ThemePreference;
  created_at: string;
  last_login_at?: string;
}

export interface OrganizerProfile {
  id: string;
  user_id: string;
  organization_name: string;
  organization_type: 'non_profit' | 'corporate' | 'individual' | 'government';
  website_url?: string;
  bio?: string;
  logo_url?: string;
  tax_id_number?: string;
  business_registration_number?: string;
  social_linkedin?: string;
  social_instagram?: string;
  social_x?: string;
  work_email: string;
  phone_number: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  created_at: string;
}

export interface Event {
  id: string;
  organizer_profile_id: string;
  organizer_name?: string;
  title: string;
  category_id: string;
  category_name?: string;
  event_type: string;
  description: string;
  rich_description_html?: string;
  image_url?: string;
  thumbnail_url?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  visibility: 'public' | 'private';
  is_featured: boolean;
  is_trending: boolean;
  rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface EventSchedule {
  id: string;
  event_id: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  sales_start_datetime: string;
  sales_end_datetime: string;
}

export interface EventVenue {
  id: string;
  event_id: string;
  venue_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  online_meeting_url?: string;
  location_type: 'physical' | 'online' | 'hybrid';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
  is_active: boolean;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface TicketType {
  id: string;
  event_id: string;
  tier_name: string;
  price: number;
  currency: string;
  capacity: number;
  remaining_quantity: number;
  sales_start_datetime: string;
  sales_end_datetime: string;
  is_active: boolean;
}

export interface TicketReservation {
  id: string;
  user_id: string;
  event_id: string;
  event?: Event;
  venue?: EventVenue;
  schedule?: EventSchedule;
  ticket_type_id: string;
  ticket_type?: TicketType;
  quantity: number;
  unit_price: number;
  subtotal: number;
  service_fee: number;
  total_price: number;
  status: 'active' | 'expired' | 'paid' | 'cancelled';
  reserved_at: string;
  expires_at: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  reservation_id: string;
  order_number: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  subtotal: number;
  service_fee: number;
  total_amount: number;
  payment_method: string;
  paid_at?: string;
  created_at: string;
}

export interface DigitalTicket {
  id: string;
  ticket_wallet_id: string;
  event_id: string;
  event?: Event;
  venue?: EventVenue;
  schedule?: EventSchedule;
  ticket_type_id: string;
  ticket_type?: TicketType;
  ticket_code: string;
  qr_payload: string;
  qr_image_url: string;
  purchase_date: string;
  seat_number?: string;
  status: 'active' | 'used' | 'cancelled' | 'refunded';
}

export interface EventReview {
  id: string;
  event_id: string;
  user_id: string;
  user_name?: string;
  rating: number;
  review_text: string;
  status: 'visible' | 'hidden' | 'pending';
  created_at: string;
}

export interface SavedEvent {
  id: string;
  user_id: string;
  event_id: string;
  event?: Event;
  saved_at: string;
}

export interface StaffMember {
  id: string;
  organizer_profile_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  assigned_role: 'staff' | 'security';
  staff_badge_id: string;
  user_id?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface TicketScan {
  id: string;
  digital_ticket_id: string;
  event_id: string;
  staff_member_id: string;
  scan_time: string;
  scan_result: 'valid' | 'already_scanned' | 'invalid';
  device_id?: string;
}

export interface EventStats {
  id: string;
  event_id: string;
  tickets_sold_total: number;
  checked_in_total: number;
  normal_sold: number;
  vip_sold: number;
  vvip_sold: number;
  updated_at: string;
}

export interface OrganizerDashboard {
  total_events: number;
  live_events: Event[];
  past_events: Event[];
  total_tickets_sold: number;
  total_revenue: number;
  revenue_by_event: { event_id: string; event_title: string; revenue: number }[];
}

export interface FeaturedBanner {
  id: string;
  event_id: string;
  event?: Event;
  title_override?: string;
  subtitle_override?: string;
  banner_image_url: string;
  sort_order: number;
  is_active: boolean;
}

// API Response types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface EventDetailResponse extends Event {
  schedule: EventSchedule;
  venue: EventVenue;
  ticket_types: TicketType[];
  reviews: EventReview[];
  tags: Tag[];
}
