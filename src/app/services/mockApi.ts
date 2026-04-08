// Mock API service matching the provided API endpoints
import type {
  User,
  Event,
  EventDetailResponse,
  Category,
  TicketReservation,
  DigitalTicket,
  EventReview,
  SavedEvent,
  OrganizerDashboard,
  StaffMember,
  EventStats,
  FeaturedBanner,
  TicketType,
  EventSchedule,
  EventVenue,
  OrganizerProfile,
} from '../types';

// Mock data
export const mockCategories: Category[] = [
  { id: '1', name: 'Technology', slug: 'technology', is_active: true },
  { id: '2', name: 'Music', slug: 'music', is_active: true },
  { id: '3', name: 'Art & Culture', slug: 'art-culture', is_active: true },
  { id: '4', name: 'Sports', slug: 'sports', is_active: true },
  { id: '5', name: 'Education', slug: 'education', is_active: true },
  { id: '6', name: 'Business', slug: 'business', is_active: true },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    organizer_profile_id: 'org1',
    organizer_name: 'TechHub Ethiopia',
    title: 'Innovation Summit 2026',
    category_id: '1',
    category_name: 'Technology',
    event_type: 'conference',
    description: 'Join us for the largest technology conference in East Africa. Network with industry leaders, attend workshops, and discover the latest innovations.',
    image_url: 'https://images.unsplash.com/photo-1773828746476-7ca780cdcb82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NzU0NjQ4MjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1773828746476-7ca780cdcb82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NzU0NjQ4MjV8MA&ixlib=rb-4.1.0&q=80&w=400',
    status: 'published',
    visibility: 'public',
    is_featured: true,
    is_trending: true,
    rating: 4.8,
    review_count: 156,
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-04-01T10:00:00Z',
  },
  {
    id: '2',
    organizer_profile_id: 'org2',
    organizer_name: 'Addis Live Productions',
    title: 'Ethio Jazz Festival 2026',
    category_id: '2',
    category_name: 'Music',
    event_type: 'festival',
    description: 'Experience the rich heritage of Ethiopian jazz with world-renowned artists and emerging talents. A celebration of music and culture.',
    image_url: 'https://images.unsplash.com/photo-1571900267799-debdb80d1617?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBjcm93ZCUyMG5pZ2h0fGVufDF8fHx8MTc3NTQ5MDY5OHww&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1571900267799-debdb80d1617?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBjcm93ZCUyMG5pZ2h0fGVufDF8fHx8MTc3NTQ5MDY5OHww&ixlib=rb-4.1.0&q=80&w=400',
    status: 'published',
    visibility: 'public',
    is_featured: true,
    is_trending: true,
    rating: 4.9,
    review_count: 243,
    created_at: '2026-03-10T10:00:00Z',
    updated_at: '2026-04-02T10:00:00Z',
  },
  {
    id: '3',
    organizer_profile_id: 'org3',
    organizer_name: 'Ethiopian Heritage Foundation',
    title: 'Coffee Culture Experience',
    category_id: '3',
    category_name: 'Art & Culture',
    event_type: 'workshop',
    description: 'Immerse yourself in the traditional Ethiopian coffee ceremony. Learn the history, preparation, and cultural significance of Ethiopian coffee.',
    image_url: 'https://images.unsplash.com/photo-1576685880864-50b3b35f1c55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhpb3BpYW4lMjBjb2ZmZWUlMjBjZXJlbW9ueSUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc3NTUwMzcxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1576685880864-50b3b35f1c55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhpb3BpYW4lMjBjb2ZmZWUlMjBjZXJlbW9ueSUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc3NTUwMzcxNHww&ixlib=rb-4.1.0&q=80&w=400',
    status: 'published',
    visibility: 'public',
    is_featured: false,
    is_trending: true,
    rating: 5.0,
    review_count: 89,
    created_at: '2026-03-20T10:00:00Z',
    updated_at: '2026-04-03T10:00:00Z',
  },
  {
    id: '4',
    organizer_profile_id: 'org4',
    organizer_name: 'National Gallery Ethiopia',
    title: 'Contemporary African Art Exhibition',
    category_id: '3',
    category_name: 'Art & Culture',
    event_type: 'exhibition',
    description: 'Explore groundbreaking works from emerging and established African artists. A showcase of contemporary art that challenges and inspires.',
    image_url: 'https://images.unsplash.com/photo-1719398026703-0d3f3d162e51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwZ2FsbGVyeSUyMHBlb3BsZXxlbnwxfHx8fDE3NzU0MzE0MTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1719398026703-0d3f3d162e51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwZ2FsbGVyeSUyMHBlb3BsZXxlbnwxfHx8fDE3NzU0MzE0MTF8MA&ixlib=rb-4.1.0&q=80&w=400',
    status: 'published',
    visibility: 'public',
    is_featured: false,
    is_trending: false,
    rating: 4.7,
    review_count: 67,
    created_at: '2026-03-12T10:00:00Z',
    updated_at: '2026-04-01T10:00:00Z',
  },
  {
    id: '5',
    organizer_profile_id: 'org5',
    organizer_name: 'Ethiopian Athletics Federation',
    title: 'Great Ethiopian Run 2026',
    category_id: '4',
    category_name: 'Sports',
    event_type: 'sports',
    description: 'Join thousands in Africa\'s biggest road race. 10K fun run through the heart of Addis Ababa. All fitness levels welcome.',
    image_url: 'https://images.unsplash.com/photo-1565483276060-e6730c0cc6a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzdGFkaXVtJTIwZ2FtZSUyMGNyb3dkfGVufDF8fHx8MTc3NTUwMzcxNnww&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1565483276060-e6730c0cc6a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzdGFkaXVtJTIwZ2FtZSUyMGNyb3dkfGVufDF8fHx8MTc3NTUwMzcxNnww&ixlib=rb-4.1.0&q=80&w=400',
    status: 'published',
    visibility: 'public',
    is_featured: true,
    is_trending: false,
    rating: 4.6,
    review_count: 312,
    created_at: '2026-02-28T10:00:00Z',
    updated_at: '2026-03-30T10:00:00Z',
  },
  {
    id: '6',
    organizer_profile_id: 'org6',
    organizer_name: 'Startup Ethiopia',
    title: 'Entrepreneurship Bootcamp',
    category_id: '6',
    category_name: 'Business',
    event_type: 'workshop',
    description: 'Intensive 3-day bootcamp for aspiring entrepreneurs. Learn from successful founders, pitch to investors, and build your network.',
    image_url: 'https://images.unsplash.com/photo-1765438863717-49fca900f861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHRyYWluaW5nJTIwc2VtaW5hcnxlbnwxfHx8fDE3NzU1MDM3MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1765438863717-49fca900f861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHRyYWluaW5nJTIwc2VtaW5hcnxlbnwxfHx8fDE3NzU1MDM3MTZ8MA&ixlib=rb-4.1.0&q=80&w=400',
    status: 'published',
    visibility: 'public',
    is_featured: false,
    is_trending: true,
    rating: 4.5,
    review_count: 45,
    created_at: '2026-03-18T10:00:00Z',
    updated_at: '2026-04-04T10:00:00Z',
  },
  {
    id: '7',
    organizer_profile_id: 'org7',
    organizer_name: 'Ethiopian Cultural Society',
    title: 'Timkat Festival Celebration',
    category_id: '3',
    category_name: 'Art & Culture',
    event_type: 'festival',
    description: 'Celebrate the Ethiopian Orthodox celebration of Epiphany with traditional ceremonies, music, and cultural performances.',
    image_url: 'https://images.unsplash.com/photo-1761124739443-ef1a8947fcae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdWx0dXJhbCUyMGZlc3RpdmFsJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzc1NTAzNzE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1761124739443-ef1a8947fcae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdWx0dXJhbCUyMGZlc3RpdmFsJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzc1NTAzNzE3fDA&ixlib=rb-4.1.0&q=80&w=400',
    status: 'published',
    visibility: 'public',
    is_featured: false,
    is_trending: false,
    rating: 4.8,
    review_count: 128,
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-03-25T10:00:00Z',
  },
  {
    id: '8',
    organizer_profile_id: 'org8',
    organizer_name: 'Business Leaders Forum',
    title: 'African Business Network Summit',
    category_id: '6',
    category_name: 'Business',
    event_type: 'conference',
    description: 'Connect with business leaders across Africa. Explore partnerships, investment opportunities, and regional trade initiatives.',
    image_url: 'https://images.unsplash.com/photo-1675716921224-e087a0cca69a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ldHdvcmtpbmclMjBldmVudHxlbnwxfHx8fDE3NzU0MjEwNTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    thumbnail_url: 'https://images.unsplash.com/photo-1675716921224-e087a0cca69a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ldHdvcmtpbmclMjBldmVudHxlbnwxfHx8fDE3NzU0MjEwNTV8MA&ixlib=rb-4.1.0&q=80&w=400',
    status: 'published',
    visibility: 'public',
    is_featured: false,
    is_trending: false,
    rating: 4.4,
    review_count: 92,
    created_at: '2026-03-22T10:00:00Z',
    updated_at: '2026-04-05T10:00:00Z',
  },
];

// Mock API functions
class MockAPI {
  private authToken: string | null = null;
  private currentUser: User | null = null;

  // Auth endpoints
  async register(data: { email: string; password: string; first_name: string; last_name: string; phone_number?: string; otp_code?: string }) {
    await this.delay(500);
    
    // In real implementation, verify OTP here
    if (data.otp_code && data.otp_code !== '123456') {
      throw new Error('Invalid OTP code');
    }
    
    const user: User = {
      id: 'user-' + Date.now(),
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: `${data.first_name} ${data.last_name}`,
      email: data.email,
      phone_number: data.phone_number,
      role: 'attendee',
      status: 'active',
      email_verified: false,
      phone_verified: false,
      default_language: 'en',
      theme_preference: 'light',
      created_at: new Date().toISOString(),
    };
    this.currentUser = user;
    this.authToken = 'mock-token-' + Date.now();
    return { user, token: this.authToken };
  }

  async login(email: string, password: string) {
    await this.delay(500);
    const user: User = {
      id: 'user-123',
      first_name: 'Abebe',
      last_name: 'Bekele',
      full_name: 'Abebe Bekele',
      email: email,
      phone_number: '+251911234567',
      role: 'attendee',
      status: 'active',
      email_verified: true,
      phone_verified: true,
      default_language: 'en',
      theme_preference: 'light',
      created_at: '2026-01-15T10:00:00Z',
      last_login_at: new Date().toISOString(),
    };
    this.currentUser = user;
    this.authToken = 'mock-token-' + Date.now();
    return { user, token: this.authToken };
  }

  async logout() {
    await this.delay(300);
    this.authToken = null;
    this.currentUser = null;
  }

  async verifyOTP(code: string) {
    await this.delay(500);
    return { success: true };
  }

  async requestPasswordReset(email: string) {
    await this.delay(500);
    return { success: true, message: 'Password reset link sent to email' };
  }

  async confirmPasswordReset(token: string, new_password: string) {
    await this.delay(500);
    return { success: true };
  }

  async getMe() {
    await this.delay(200);
    return this.currentUser;
  }

  // Public/Discovery endpoints
  async getFeaturedEvents() {
    await this.delay(300);
    return mockEvents.filter(e => e.is_featured);
  }

  async getTrendingEvents() {
    await this.delay(300);
    return mockEvents.filter(e => e.is_trending);
  }

  async getNearbyEvents(city: string) {
    await this.delay(300);
    return mockEvents.slice(0, 4);
  }

  async searchEvents(query: string, category?: string) {
    await this.delay(400);
    let filtered = [...mockEvents];
    if (query) {
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (category) {
      filtered = filtered.filter(e => e.category_id === category || e.category_name?.toLowerCase() === category.toLowerCase());
    }
    return filtered;
  }

  async getEvents() {
    await this.delay(300);
    return mockEvents;
  }

  async getEventById(eventId: string): Promise<EventDetailResponse> {
    await this.delay(300);
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const schedule: EventSchedule = {
      id: 'schedule-' + eventId,
      event_id: eventId,
      start_datetime: '2026-05-20T09:00:00Z',
      end_datetime: '2026-05-22T18:00:00Z',
      timezone: 'Africa/Addis_Ababa',
      sales_start_datetime: '2026-04-01T00:00:00Z',
      sales_end_datetime: '2026-05-19T23:59:59Z',
    };

    const venue: EventVenue = {
      id: 'venue-' + eventId,
      event_id: eventId,
      venue_name: 'Millennium Hall',
      address_line1: 'Bole Road',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      country: 'Ethiopia',
      latitude: 9.0192,
      longitude: 38.7525,
      location_type: 'physical',
    };

    const ticket_types: TicketType[] = [
      {
        id: 'ticket-1-' + eventId,
        event_id: eventId,
        tier_name: 'Normal',
        price: 500,
        currency: 'ETB',
        capacity: 500,
        remaining_quantity: 234,
        sales_start_datetime: '2026-04-01T00:00:00Z',
        sales_end_datetime: '2026-05-19T23:59:59Z',
        is_active: true,
      },
      {
        id: 'ticket-2-' + eventId,
        event_id: eventId,
        tier_name: 'VIP',
        price: 1200,
        currency: 'ETB',
        capacity: 200,
        remaining_quantity: 87,
        sales_start_datetime: '2026-04-01T00:00:00Z',
        sales_end_datetime: '2026-05-19T23:59:59Z',
        is_active: true,
      },
      {
        id: 'ticket-3-' + eventId,
        event_id: eventId,
        tier_name: 'VVIP',
        price: 2500,
        currency: 'ETB',
        capacity: 50,
        remaining_quantity: 12,
        sales_start_datetime: '2026-04-01T00:00:00Z',
        sales_end_datetime: '2026-05-19T23:59:59Z',
        is_active: true,
      },
    ];

    const reviews: EventReview[] = [
      {
        id: 'review-1',
        event_id: eventId,
        user_id: 'user-1',
        user_name: 'Sara Tadesse',
        rating: 5,
        review_text: 'Amazing experience! The organization was flawless and the content was incredibly valuable.',
        status: 'visible',
        created_at: '2026-03-25T14:30:00Z',
      },
      {
        id: 'review-2',
        event_id: eventId,
        user_id: 'user-2',
        user_name: 'Daniel Alemu',
        rating: 4,
        review_text: 'Great event overall. The venue was perfect and networking opportunities were excellent.',
        status: 'visible',
        created_at: '2026-03-26T10:15:00Z',
      },
    ];

    return {
      ...event,
      schedule,
      venue,
      ticket_types,
      reviews,
      tags: [],
    };
  }

  async getCategories() {
    await this.delay(200);
    return mockCategories;
  }

  async getTags() {
    await this.delay(200);
    return [];
  }

  // Saved tickets
  async saveTicket(eventId: string, ticketTypeId: string, quantity: number): Promise<TicketReservation> {
    await this.delay(400);
    const event = mockEvents.find(e => e.id === eventId);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return {
      id: 'reservation-' + Date.now(),
      user_id: this.currentUser?.id || 'user-123',
      event_id: eventId,
      event: event,
      ticket_type_id: ticketTypeId,
      quantity: quantity,
      unit_price: 500,
      subtotal: 500 * quantity,
      service_fee: 50 * quantity,
      total_price: 550 * quantity,
      status: 'active',
      reserved_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    };
  }

  async getSavedTickets(): Promise<TicketReservation[]> {
    await this.delay(300);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 12);

    return [
      {
        id: 'reservation-1',
        user_id: this.currentUser?.id || 'user-123',
        event_id: '1',
        event: mockEvents[0],
        ticket_type_id: 'ticket-1-1',
        ticket_type: {
          id: 'ticket-1-1',
          event_id: '1',
          tier_name: 'Normal',
          price: 500,
          currency: 'ETB',
          capacity: 500,
          remaining_quantity: 234,
          sales_start_datetime: '2026-04-01T00:00:00Z',
          sales_end_datetime: '2026-05-19T23:59:59Z',
          is_active: true,
        },
        quantity: 2,
        unit_price: 500,
        subtotal: 1000,
        service_fee: 100,
        total_price: 1100,
        status: 'active',
        reserved_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      },
    ];
  }

  async updateSavedTicket(id: string, quantity: number) {
    await this.delay(300);
    return { success: true };
  }

  async deleteSavedTicket(id: string) {
    await this.delay(300);
    return { success: true };
  }

  // Checkout/Payment
  async getCheckoutSummary() {
    await this.delay(300);
    return {
      subtotal: 1000,
      service_fee: 100,
      total: 1100,
    };
  }

  async createCheckout(reservationIds: string[]) {
    await this.delay(500);
    return {
      checkout_id: 'checkout-' + Date.now(),
      payment_url: '#',
    };
  }

  async confirmPayment(checkoutId: string) {
    await this.delay(1000);
    return { success: true, order_id: 'order-' + Date.now() };
  }

  async getCheckoutTimer(reservationId: string) {
    await this.delay(200);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 12);
    return { expires_at: expiresAt.toISOString() };
  }

  async cancelCheckout(reservationId: string) {
    await this.delay(300);
    return { success: true };
  }

  // Digital Tickets
  async getTickets(): Promise<DigitalTicket[]> {
    await this.delay(300);
    return [
      {
        id: 'ticket-1',
        ticket_wallet_id: 'wallet-1',
        event_id: '1',
        event: mockEvents[0],
        ticket_type_id: 'ticket-1-1',
        ticket_type: {
          id: 'ticket-1-1',
          event_id: '1',
          tier_name: 'Normal',
          price: 500,
          currency: 'ETB',
          capacity: 500,
          remaining_quantity: 234,
          sales_start_datetime: '2026-04-01T00:00:00Z',
          sales_end_datetime: '2026-05-19T23:59:59Z',
          is_active: true,
        },
        ticket_code: 'DEMS-INV2026-001234',
        qr_payload: 'DEMS-INV2026-001234',
        qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=DEMS-INV2026-001234',
        purchase_date: '2026-04-02T15:30:00Z',
        status: 'active',
      },
      {
        id: 'ticket-2',
        ticket_wallet_id: 'wallet-1',
        event_id: '2',
        event: mockEvents[1],
        ticket_type_id: 'ticket-2-2',
        ticket_type: {
          id: 'ticket-2-2',
          event_id: '2',
          tier_name: 'VIP',
          price: 1200,
          currency: 'ETB',
          capacity: 200,
          remaining_quantity: 87,
          sales_start_datetime: '2026-04-01T00:00:00Z',
          sales_end_datetime: '2026-05-19T23:59:59Z',
          is_active: true,
        },
        ticket_code: 'DEMS-JAZZ2026-005678',
        qr_payload: 'DEMS-JAZZ2026-005678',
        qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=DEMS-JAZZ2026-005678',
        purchase_date: '2026-04-01T10:20:00Z',
        status: 'active',
      },
    ];
  }

  async getTicketById(ticketId: string) {
    await this.delay(300);
    const tickets = await this.getTickets();
    return tickets.find(t => t.id === ticketId);
  }

  async getTicketQR(ticketId: string) {
    await this.delay(200);
    return {
      qr_image_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=DEMS-TICKET-${ticketId}`,
    };
  }

  async downloadTicket(ticketId: string) {
    await this.delay(500);
    return { download_url: '#' };
  }

  // Reviews
  async getEventReviews(eventId: string): Promise<EventReview[]> {
    await this.delay(300);
    return [
      {
        id: 'review-1',
        event_id: eventId,
        user_id: 'user-1',
        user_name: 'Sara Tadesse',
        rating: 5,
        review_text: 'Amazing experience! The organization was flawless and the content was incredibly valuable.',
        status: 'visible',
        created_at: '2026-03-25T14:30:00Z',
      },
    ];
  }

  async createEventReview(eventId: string, rating: number, review_text: string) {
    await this.delay(500);
    return { success: true };
  }

  // Organizer Dashboard
  async getOrganizerDashboard(): Promise<OrganizerDashboard> {
    await this.delay(500);
    return {
      total_events: 8,
      live_events: mockEvents.slice(0, 3),
      past_events: mockEvents.slice(6, 8),
      total_tickets_sold: 1247,
      total_revenue: 856400,
      revenue_by_event: [
        { event_id: '1', event_title: 'Innovation Summit 2026', revenue: 325000 },
        { event_id: '2', event_title: 'Ethio Jazz Festival 2026', revenue: 412000 },
        { event_id: '5', event_title: 'Great Ethiopian Run 2026', revenue: 119400 },
      ],
    };
  }

  async getOrganizerEvents() {
    await this.delay(300);
    return mockEvents.slice(0, 5);
  }

  async createEvent(eventData: any) {
    await this.delay(700);
    return { success: true, event_id: 'event-' + Date.now() };
  }

  async updateEvent(eventId: string, eventData: any) {
    await this.delay(500);
    return { success: true };
  }

  async getEventStats(eventId: string): Promise<EventStats> {
    await this.delay(300);
    return {
      id: 'stats-' + eventId,
      event_id: eventId,
      tickets_sold_total: 456,
      checked_in_total: 342,
      normal_sold: 266,
      vip_sold: 113,
      vvip_sold: 38,
      updated_at: new Date().toISOString(),
    };
  }

  async getPastEventReviews(eventId: string) {
    await this.delay(300);
    return await this.getEventReviews(eventId);
  }

  async getRevenue() {
    await this.delay(300);
    return {
      total_revenue: 856400,
      by_month: [
        { month: 'January', revenue: 125000 },
        { month: 'February', revenue: 198000 },
        { month: 'March', revenue: 267000 },
        { month: 'April', revenue: 266400 },
      ],
    };
  }

  // Staff Management
  async getStaff(): Promise<StaffMember[]> {
    await this.delay(300);
    return [
      {
        id: 'staff-1',
        organizer_profile_id: 'org1',
        full_name: 'Marta Girma',
        email: 'marta.girma@example.com',
        phone_number: '+251911234567',
        assigned_role: 'staff',
        staff_badge_id: 'STAFF-001',
        status: 'active',
        created_at: '2026-03-01T10:00:00Z',
      },
      {
        id: 'staff-2',
        organizer_profile_id: 'org1',
        full_name: 'Dawit Tesfaye',
        email: 'dawit.t@example.com',
        phone_number: '+251922345678',
        assigned_role: 'security',
        staff_badge_id: 'SEC-001',
        status: 'active',
        created_at: '2026-03-05T10:00:00Z',
      },
    ];
  }

  async createStaff(staffData: any) {
    await this.delay(500);
    return { success: true, staff_id: 'staff-' + Date.now() };
  }

  async updateStaff(staffId: string, staffData: any) {
    await this.delay(400);
    return { success: true };
  }

  async deleteStaff(staffId: string) {
    await this.delay(300);
    return { success: true };
  }

  // Security Scanner
  async scanTicket(qr_code: string) {
    await this.delay(800);
    const isValid = Math.random() > 0.2;
    return {
      success: isValid,
      scan_result: isValid ? 'valid' : 'invalid',
      ticket_info: isValid ? {
        ticket_code: qr_code,
        event_name: 'Innovation Summit 2026',
        ticket_tier: 'Normal',
        attendee_name: 'Abebe Bekele',
      } : null,
    };
  }

  async getEventStatsForSecurity(eventId: string) {
    await this.delay(300);
    return await this.getEventStats(eventId);
  }

  async getCurrentEvent() {
    await this.delay(300);
    return mockEvents[0];
  }

  // Profile Settings
  async updateProfile(data: any) {
    await this.delay(400);
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...data };
    }
    return { success: true };
  }

  async updateTheme(theme: ThemePreference) {
    await this.delay(200);
    if (this.currentUser) {
      this.currentUser.theme_preference = theme;
    }
    return { success: true };
  }

  async updateLanguage(language: Language) {
    await this.delay(200);
    if (this.currentUser) {
      this.currentUser.default_language = language;
    }
    return { success: true };
  }

  async getSavedEvents(): Promise<SavedEvent[]> {
    await this.delay(300);
    return [
      {
        id: 'saved-1',
        user_id: this.currentUser?.id || 'user-123',
        event_id: '3',
        event: mockEvents[2],
        saved_at: '2026-04-01T12:00:00Z',
      },
      {
        id: 'saved-2',
        user_id: this.currentUser?.id || 'user-123',
        event_id: '6',
        event: mockEvents[5],
        saved_at: '2026-04-03T14:30:00Z',
      },
    ];
  }

  async getNotifications() {
    await this.delay(300);
    return [];
  }

  // Organizer registration
  async registerOrganizer(data: {
    full_name: string;
    work_email: string;
    password: string;
    organization_name: string;
    organization_type: string;
    website_url?: string;
    bio?: string;
    phone_number: string;
    tax_id_number?: string;
  }): Promise<{ user: User; organizer_profile: OrganizerProfile; token: string }> {
    await this.delay(700);
    
    const user: User = {
      id: 'user-org-' + Date.now(),
      first_name: data.full_name.split(' ')[0],
      last_name: data.full_name.split(' ').slice(1).join(' '),
      full_name: data.full_name,
      email: data.work_email,
      phone_number: data.phone_number,
      role: 'organizer',
      status: 'pending',
      email_verified: false,
      phone_verified: false,
      default_language: 'en',
      theme_preference: 'light',
      created_at: new Date().toISOString(),
    };

    const organizer_profile: OrganizerProfile = {
      id: 'org-' + Date.now(),
      user_id: user.id,
      organization_name: data.organization_name,
      organization_type: data.organization_type as any,
      website_url: data.website_url,
      bio: data.bio,
      work_email: data.work_email,
      phone_number: data.phone_number,
      tax_id_number: data.tax_id_number,
      verification_status: 'pending',
      created_at: new Date().toISOString(),
    };

    const token = 'mock-org-token-' + Date.now();
    
    this.currentUser = user;
    this.authToken = token;

    return { user, organizer_profile, token };
  }

  // Saved events
  async saveEvent(eventId: string): Promise<SavedEvent> {
    await this.delay(300);
    const event = mockEvents.find(e => e.id === eventId);
    return {
      id: 'saved-' + Date.now(),
      user_id: this.currentUser?.id || 'user-123',
      event_id: eventId,
      event: event,
      saved_at: new Date().toISOString(),
    };
  }

  async unsaveEvent(eventId: string) {
    await this.delay(300);
    return { success: true };
  }

  // Admin Dashboard endpoints
  async getAdminStats() {
    await this.delay(400);
    return {
      total_users: 1234,
      total_organizers: 87,
      total_attendees: 1089,
      total_security: 58,
      live_events: 45,
      pending_approvals: 5,
      total_revenue: 856400,
      total_tickets_sold: 2847,
    };
  }

  async getPendingOrganizers() {
    await this.delay(300);
    return [
      {
        id: 'pending-org-1',
        user_id: 'user-pending-1',
        organization_name: 'TechHub Ethiopia',
        organization_type: 'corporate',
        full_name: 'Abebe Kebede',
        work_email: 'abebe@techhub.et',
        phone_number: '+251911234567',
        website_url: 'https://techhub.et',
        verification_status: 'pending',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'pending-org-2',
        user_id: 'user-pending-2',
        organization_name: 'Addis Live Productions',
        organization_type: 'individual',
        full_name: 'Tigist Alemayehu',
        work_email: 'tigist@addislive.com',
        phone_number: '+251922345678',
        verification_status: 'pending',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'pending-org-3',
        user_id: 'user-pending-3',
        organization_name: 'Ethiopian Heritage Foundation',
        organization_type: 'non_profit',
        full_name: 'Yohannes Tadesse',
        work_email: 'yohannes@heritage.org.et',
        phone_number: '+251933456789',
        website_url: 'https://heritage.org.et',
        verification_status: 'pending',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  async approveOrganizer(organizerId: string) {
    await this.delay(500);
    return { success: true, message: 'Organizer approved successfully' };
  }

  async rejectOrganizer(organizerId: string, reason?: string) {
    await this.delay(500);
    return { success: true, message: 'Organizer rejected' };
  }

  async getRecentEvents(limit: number = 10) {
    await this.delay(300);
    return mockEvents.slice(0, limit);
  }

  async getAllUsers(page: number = 1, limit: number = 20) {
    await this.delay(400);
    return {
      data: [
        {
          id: 'user-1',
          full_name: 'Abebe Kebede',
          email: 'abebe@example.com',
          phone_number: '+251911234567',
          role: 'attendee',
          status: 'active',
          created_at: '2026-01-15T10:00:00Z',
        },
        {
          id: 'user-2',
          full_name: 'Tigist Alemayehu',
          email: 'tigist@example.com',
          phone_number: '+251922345678',
          role: 'organizer',
          status: 'active',
          created_at: '2026-02-10T10:00:00Z',
        },
      ],
      pagination: {
        page: page,
        per_page: limit,
        total: 1234,
        total_pages: Math.ceil(1234 / limit),
      },
    };
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockApi = new MockAPI();