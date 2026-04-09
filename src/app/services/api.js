// Real API service — mirrors mockApi interface exactly

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('authToken');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }

  if (res.status === 204) return undefined;
  return res.json();
}

class API {
  // ── Auth ──────────────────────────────────────────────────────────────────

  async register(data) {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (data.otp_code) {
      return this.verifyOTPAndLogin(data.email, data.otp_code, 'signup');
    }
    return { user: res.user, token: '' };
  }

  async verifyOTPAndLogin(email, code, purpose = 'signup') {
    return request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code, purpose }),
    });
  }

  async login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    await request('/auth/logout', { method: 'POST' }).catch(() => {});
  }

  async verifyOTP(_code) {
    return { success: true };
  }

  async requestPasswordReset(email) {
    await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { success: true, message: 'Password reset OTP sent to email' };
  }

  async confirmPasswordReset(token, new_password) {
    await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ code: token, new_password }),
    });
    return { success: true };
  }

  async getMe() {
    return request('/auth/me').catch(() => null);
  }

  // ── Events ────────────────────────────────────────────────────────────────

  async getFeaturedEvents() {
    return request('/events/featured');
  }

  async getTrendingEvents() {
    return request('/events/trending');
  }

  async getNearbyEvents(_city) {
    const res = await request('/events?limit=4');
    return res.events || [];
  }

  async searchEvents(query, category) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    const res = await request(`/events?${params}`);
    return res.events;
  }

  async getEvents(filters) {
    const params = new URLSearchParams();
    if (filters?.q) params.set('q', filters.q);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.city) params.set('city', filters.city);
    if (filters?.location_type) params.set('location_type', filters.location_type);
    if (filters?.min_price !== undefined) params.set('min_price', String(filters.min_price));
    if (filters?.max_price !== undefined) params.set('max_price', String(filters.max_price));
    if (filters?.min_rating !== undefined) params.set('min_rating', String(filters.min_rating));
    if (filters?.tag) params.set('tag', filters.tag);
    const res = await request(`/events?${params}`);
    return res.events || [];
  }

  async getTags() {
    return request('/events/tags/all').catch(() => []);
  }

  async getEventById(eventId) {
    return request(`/events/${eventId}`);
  }

  async getCategories() {
    return request('/categories');
  }

  // ── Ticket Reservations ───────────────────────────────────────────────────

  async saveTicket(eventId, ticketTypeId, quantity) {
    return request('/tickets/reservations', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, ticket_type_id: ticketTypeId, quantity }),
    });
  }

  async getSavedTickets() {
    return request('/tickets/reservations/list');
  }

  async updateSavedTicket(id, quantity) {
    return request(`/tickets/reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async deleteSavedTicket(id) {
    return request(`/tickets/reservations/${id}`, { method: 'DELETE' });
  }

  // ── Checkout / Payment ────────────────────────────────────────────────────

  async getCheckoutSummary() {
    const reservations = await this.getSavedTickets();
    const subtotal = reservations.reduce((s, r) => s + r.subtotal, 0);
    const service_fee = reservations.reduce((s, r) => s + r.service_fee, 0);
    return { subtotal, service_fee, total: subtotal + service_fee };
  }

  async createCheckout(reservationIds) {
    const res = await request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ reservation_ids: reservationIds }),
    });
    return { checkout_id: res.order_id, payment_url: res.checkout_url };
  }

  async confirmPayment(tx_ref) {
    return request('/orders/verify', {
      method: 'POST',
      body: JSON.stringify({ tx_ref }),
    });
  }

  async getCheckoutTimer(_reservationId) {
    const reservations = await this.getSavedTickets();
    const r = reservations[0];
    return { expires_at: r?.expires_at || new Date(Date.now() + 15 * 60 * 1000).toISOString() };
  }

  async cancelCheckout(reservationId) {
    return this.deleteSavedTicket(reservationId);
  }

  // ── Digital Tickets ───────────────────────────────────────────────────────

  async getTickets() {
    return request('/tickets');
  }

  async getTicketById(ticketId) {
    return request(`/tickets/${ticketId}`).catch(() => undefined);
  }

  async getTicketQR(ticketId) {
    const ticket = await this.getTicketById(ticketId);
    return { qr_image_url: ticket?.qr_image_url || '' };
  }

  async downloadTicket(_ticketId) {
    return { download_url: '#' };
  }

  // ── Reviews ───────────────────────────────────────────────────────────────

  async getEventReviews(eventId) {
    return request(`/events/${eventId}/reviews`);
  }

  async createEventReview(eventId, rating, review_text) {
    await request(`/events/${eventId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, review_text }),
    });
    return { success: true };
  }

  // ── Organizer Dashboard ───────────────────────────────────────────────────

  async getOrganizerDashboard() {
    return request('/organizer/dashboard');
  }

  async getOrganizerEvents() {
    return request('/organizer/events');
  }

  async createEvent(eventData) {
    const res = await request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return { success: true, event_id: res.id };
  }

  async uploadImage(file) {
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
    return `http://localhost:3000${data.url}`;
  }

  async updateEvent(eventId, eventData) {
    await request(`/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    });
    return { success: true };
  }

  async getEventStats(eventId) {
    return request(`/events/${eventId}/stats`);
  }

  async getPastEventReviews(eventId) {
    return this.getEventReviews(eventId);
  }

  async getRevenue() {
    const res = await request('/organizer/revenue');
    return { total_revenue: res.total_revenue, by_month: [] };
  }

  // ── Staff Management ──────────────────────────────────────────────────────

  async getStaff() {
    return request('/staff');
  }

  async createStaff(staffData) {
    const res = await request('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
    return { success: true, staff_id: res.id };
  }

  async updateStaff(staffId, staffData) {
    await request(`/staff/${staffId}`, {
      method: 'PATCH',
      body: JSON.stringify(staffData),
    });
    return { success: true };
  }

  async deleteStaff(staffId) {
    await request(`/staff/${staffId}`, { method: 'DELETE' });
    return { success: true };
  }

  // ── Security Scanner ──────────────────────────────────────────────────────

  async scanTicket(qr_code) {
    return request('/scanner/scan', {
      method: 'POST',
      body: JSON.stringify({ qr_code, event_id: localStorage.getItem('scanner_event_id') || '' }),
    });
  }

  async getEventStatsForSecurity(eventId) {
    return request(`/scanner/event/${eventId}/stats`);
  }

  async getCurrentEvent() {
    const res = await request('/events?limit=1&featured=true');
    return res.events?.[0];
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  async updateProfile(data) {
    await request('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return { success: true };
  }

  async updateTheme(theme) {
    return this.updateProfile({ theme_preference: theme });
  }

  async updateLanguage(language) {
    return this.updateProfile({ default_language: language });
  }

  async getSavedEvents() {
    return request('/profile/saved-events');
  }

  async saveEvent(eventId) {
    return request(`/profile/saved-events/${eventId}`, { method: 'POST' });
  }

  async unsaveEvent(eventId) {
    await request(`/profile/saved-events/${eventId}`, { method: 'DELETE' });
    return { success: true };
  }

  async getNotifications() {
    return request('/profile/notifications').catch(() => []);
  }

  // ── Organizer Registration ────────────────────────────────────────────────

  async registerOrganizer(data) {
    return request('/organizer/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  async getAdminStats() {
    return request('/admin/stats');
  }

  async getPendingOrganizers() {
    return request('/admin/organizers/pending');
  }

  async approveOrganizer(id, status) {
    return request(`/admin/organizers/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAdminUsers(params) {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/users?${q}`);
  }

  async updateAdminUser(id, data) {
    return request(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAdminEvents(params) {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/events?${q}`);
  }

  async updateAdminEvent(id, data) {
    return request(`/admin/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAdminCategories() {
    return request('/admin/categories');
  }

  async createAdminCategory(data) {
    return request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminCategory(id, data) {
    return request(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const api = new API();
export default api;
