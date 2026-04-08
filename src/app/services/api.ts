// Real API service — mirrors mockApi interface exactly
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
  OrganizerProfile,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken(): string | null {
  return localStorage.getItem('authToken');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

class API {
  // ── Auth ──────────────────────────────────────────────────────────────────

  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    otp_code?: string;
  }): Promise<{ user: User; token: string }> {
    // Step 1: register → backend sends OTP email
    const res = await request<{ message: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Step 2: if otp_code provided, verify it and get token
    if (data.otp_code) {
      return this.verifyOTPAndLogin(data.email, data.otp_code, 'signup');
    }

    // Return partial — caller handles OTP step
    return { user: res.user, token: '' };
  }

  async verifyOTPAndLogin(
    email: string,
    code: string,
    purpose = 'signup'
  ): Promise<{ user: User; token: string }> {
    return request<{ user: User; token: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code, purpose }),
    });
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    await request('/auth/logout', { method: 'POST' }).catch(() => {});
  }

  async verifyOTP(code: string): Promise<{ success: boolean }> {
    return { success: true }; // handled via verifyOTPAndLogin
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { success: true, message: 'Password reset OTP sent to email' };
  }

  async confirmPasswordReset(token: string, new_password: string): Promise<{ success: boolean }> {
    await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ code: token, new_password }),
    });
    return { success: true };
  }

  async getMe(): Promise<User | null> {
    return request<User>('/auth/me').catch(() => null);
  }

  // ── Events ────────────────────────────────────────────────────────────────

  async getFeaturedEvents(): Promise<Event[]> {
    return request<Event[]>('/events/featured');
  }

  async getTrendingEvents(): Promise<Event[]> {
    return request<Event[]>('/events/trending');
  }

  async getNearbyEvents(_city: string): Promise<Event[]> {
    const res = await request<{ events: Event[] }>('/events?limit=4');
    return res.events || [];
  }

  async searchEvents(query: string, category?: string): Promise<Event[]> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    const res = await request<{ events: Event[] }>(`/events?${params}`);
    return res.events;
  }

  async getEvents(): Promise<Event[]> {
    const res = await request<{ events: Event[] }>('/events');
    return res.events;
  }

  async getEventById(eventId: string): Promise<EventDetailResponse> {
    return request<EventDetailResponse>(`/events/${eventId}`);
  }

  async getCategories(): Promise<Category[]> {
    return request<Category[]>('/categories');
  }

  async getTags(): Promise<[]> {
    return [];
  }

  // ── Ticket Reservations (saved tickets / cart) ────────────────────────────

  async saveTicket(eventId: string, ticketTypeId: string, quantity: number): Promise<TicketReservation> {
    return request<TicketReservation>('/tickets/reservations', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, ticket_type_id: ticketTypeId, quantity }),
    });
  }

  async getSavedTickets(): Promise<TicketReservation[]> {
    return request<TicketReservation[]>('/tickets/reservations/list');
  }

  async updateSavedTicket(id: string, quantity: number): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/tickets/reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async deleteSavedTicket(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/tickets/reservations/${id}`, {
      method: 'DELETE',
    });
  }

  // ── Checkout / Payment ────────────────────────────────────────────────────

  async getCheckoutSummary(): Promise<{ subtotal: number; service_fee: number; total: number }> {
    const reservations = await this.getSavedTickets();
    const subtotal = reservations.reduce((s, r) => s + r.subtotal, 0);
    const service_fee = reservations.reduce((s, r) => s + r.service_fee, 0);
    return { subtotal, service_fee, total: subtotal + service_fee };
  }

  async createCheckout(reservationIds: string[]): Promise<{ checkout_id: string; payment_url: string }> {
    const res = await request<{ checkout_url: string; order_id: string; tx_ref: string }>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ reservation_ids: reservationIds }),
    });
    return { checkout_id: res.order_id, payment_url: res.checkout_url };
  }

  async confirmPayment(tx_ref: string): Promise<{ success: boolean; order_id: string }> {
    return request<{ success: boolean; order_id: string }>('/orders/verify', {
      method: 'POST',
      body: JSON.stringify({ tx_ref }),
    });
  }

  async getCheckoutTimer(_reservationId: string): Promise<{ expires_at: string }> {
    const reservations = await this.getSavedTickets();
    const r = reservations[0];
    return { expires_at: r?.expires_at || new Date(Date.now() + 15 * 60 * 1000).toISOString() };
  }

  async cancelCheckout(reservationId: string): Promise<{ success: boolean }> {
    return this.deleteSavedTicket(reservationId);
  }

  // ── Digital Tickets ───────────────────────────────────────────────────────

  async getTickets(): Promise<DigitalTicket[]> {
    return request<DigitalTicket[]>('/tickets');
  }

  async getTicketById(ticketId: string): Promise<DigitalTicket | undefined> {
    return request<DigitalTicket>(`/tickets/${ticketId}`).catch(() => undefined);
  }

  async getTicketQR(ticketId: string): Promise<{ qr_image_url: string }> {
    const ticket = await this.getTicketById(ticketId);
    return { qr_image_url: ticket?.qr_image_url || '' };
  }

  async downloadTicket(_ticketId: string): Promise<{ download_url: string }> {
    return { download_url: '#' };
  }

  // ── Reviews ───────────────────────────────────────────────────────────────

  async getEventReviews(eventId: string): Promise<EventReview[]> {
    return request<EventReview[]>(`/events/${eventId}/reviews`);
  }

  async createEventReview(eventId: string, rating: number, review_text: string): Promise<{ success: boolean }> {
    await request(`/events/${eventId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, review_text }),
    });
    return { success: true };
  }

  // ── Organizer Dashboard ───────────────────────────────────────────────────

  async getOrganizerDashboard(): Promise<OrganizerDashboard> {
    return request<OrganizerDashboard>('/organizer/dashboard');
  }

  async getOrganizerEvents(): Promise<Event[]> {
    return request<Event[]>('/organizer/events');
  }

  async createEvent(eventData: any): Promise<{ success: boolean; event_id: string }> {
    const res = await request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return { success: true, event_id: res.id };
  }

  async uploadImage(file: File): Promise<string> {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${BASE_URL}/upload/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }
    const data = await res.json();
    // Return full URL for display, relative path stored in DB
    return `http://localhost:3000${data.url}`;
  }

  async updateEvent(eventId: string, eventData: any): Promise<{ success: boolean }> {
    await request(`/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    });
    return { success: true };
  }

  async getEventStats(eventId: string): Promise<EventStats> {
    return request<EventStats>(`/events/${eventId}/stats`);
  }

  async getPastEventReviews(eventId: string): Promise<EventReview[]> {
    return this.getEventReviews(eventId);
  }

  async getRevenue(): Promise<{ total_revenue: number; by_month: { month: string; revenue: number }[] }> {
    const res = await request<{ total_revenue: number; orders_count: number }>('/organizer/revenue');
    return { total_revenue: res.total_revenue, by_month: [] };
  }

  // ── Staff Management ──────────────────────────────────────────────────────

  async getStaff(): Promise<StaffMember[]> {
    return request<StaffMember[]>('/staff');
  }

  async createStaff(staffData: any): Promise<{ success: boolean; staff_id: string }> {
    const res = await request<StaffMember>('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
    return { success: true, staff_id: res.id };
  }

  async updateStaff(staffId: string, staffData: any): Promise<{ success: boolean }> {
    await request(`/staff/${staffId}`, {
      method: 'PATCH',
      body: JSON.stringify(staffData),
    });
    return { success: true };
  }

  async deleteStaff(staffId: string): Promise<{ success: boolean }> {
    await request(`/staff/${staffId}`, { method: 'DELETE' });
    return { success: true };
  }

  // ── Security Scanner ──────────────────────────────────────────────────────

  async scanTicket(qr_code: string): Promise<{
    success: boolean;
    scan_result: string;
    ticket_info: { ticket_code: string; event_name: string; ticket_tier: string; attendee_name: string } | null;
  }> {
    // event_id is required — scanner page passes it; fallback to first event
    return request('/scanner/scan', {
      method: 'POST',
      body: JSON.stringify({ qr_code, event_id: localStorage.getItem('scanner_event_id') || '' }),
    });
  }

  async getEventStatsForSecurity(eventId: string): Promise<EventStats> {
    return request<EventStats>(`/scanner/event/${eventId}/stats`);
  }

  async getCurrentEvent(): Promise<Event> {
    const res = await request<{ events: Event[] }>('/events?limit=1&featured=true');
    return res.events?.[0];
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  async updateProfile(data: any): Promise<{ success: boolean }> {
    await request('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return { success: true };
  }

  async updateTheme(theme: string): Promise<{ success: boolean }> {
    return this.updateProfile({ theme_preference: theme });
  }

  async updateLanguage(language: string): Promise<{ success: boolean }> {
    return this.updateProfile({ default_language: language });
  }

  async getSavedEvents(): Promise<SavedEvent[]> {
    return request<SavedEvent[]>('/profile/saved-events');
  }

  async saveEvent(eventId: string): Promise<SavedEvent> {
    return request<SavedEvent>(`/profile/saved-events/${eventId}`, { method: 'POST' });
  }

  async unsaveEvent(eventId: string): Promise<{ success: boolean }> {
    await request(`/profile/saved-events/${eventId}`, { method: 'DELETE' });
    return { success: true };
  }

  async getNotifications(): Promise<any[]> {
    return request<any[]>('/profile/notifications').catch(() => []);
  }

  // ── Organizer Registration ────────────────────────────────────────────────

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
    return request<{ user: User; organizer_profile: OrganizerProfile; token: string }>(
      '/organizer/register',
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  async getAdminStats(): Promise<any> {
    return request('/admin/stats');
  }

  async getPendingOrganizers(): Promise<any[]> {
    return request<any[]>('/admin/organizers/pending');
  }

  async approveOrganizer(id: string, status: 'approved' | 'rejected'): Promise<any> {
    return request(`/admin/organizers/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAdminUsers(params?: any): Promise<any> {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/users?${q}`);
  }

  async updateAdminUser(id: string, data: any): Promise<any> {
    return request(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAdminEvents(params?: any): Promise<any> {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/events?${q}`);
  }

  async updateAdminEvent(id: string, data: any): Promise<any> {
    return request(`/admin/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAdminCategories(): Promise<Category[]> {
    return request<Category[]>('/admin/categories');
  }

  async createAdminCategory(data: any): Promise<Category> {
    return request<Category>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminCategory(id: string, data: any): Promise<Category> {
    return request<Category>(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const api = new API();
export default api;
