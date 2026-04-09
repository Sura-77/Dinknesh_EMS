import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Calendar, MapPin, Star, Bookmark, Minus, Plus, Ticket } from 'lucide-react';

import { api as mockApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (eventId) { loadEvent(eventId); checkIfSaved(eventId); }
  }, [eventId]);

  const loadEvent = async (id) => {
    setLoading(true);
    try { setEvent(await mockApi.getEventById(id)); }
    finally { setLoading(false); }
  };

  const checkIfSaved = async (id) => {
    if (!isAuthenticated) return;
    try {
      const saved = await mockApi.getSavedEvents();
      setIsSaved(saved.some(s => s.event_id === id));
    } catch {}
  };

  const handleQuantityChange = (ticketId, delta) => {
    setQuantities(prev => ({ ...prev, [ticketId]: Math.max(0, Math.min(10, (prev[ticketId] || 0) + delta)) }));
  };

  const handleBuyTicket = async (ticketType) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase tickets');
      navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }
    setSaving(true);
    try {
      await mockApi.saveTicket(event.id, ticketType.id, quantities[ticketType.id] || 1);
      toast.success('Ticket reserved! Complete checkout within 15 minutes.');
      navigate('/saved-tickets');
    } catch { toast.error('Failed to reserve ticket'); }
    finally { setSaving(false); }
  };

  const handleSaveEvent = async () => {
    if (!isAuthenticated) { toast.error('Please login to save events'); navigate('/login'); return; }
    try {
      if (isSaved) { await mockApi.unsaveEvent(event.id); toast.success('Event removed'); setIsSaved(false); }
      else { await mockApi.saveEvent(event.id); toast.success('Event saved!'); setIsSaved(true); }
    } catch { toast.error('Failed to save event'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-gray-300 border-t-gray-900 rounded-full mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Event not found</p>
          <Link to="/discover" className="text-gray-900 dark:text-white underline">Back to events</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="relative">
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
              </div>
              {event.is_featured && (
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-yellow-400 text-gray-900 rounded-full text-sm font-semibold">Featured</div>
              )}
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                {event.category?.name || event.category_name}
              </div>
              <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{event.title}</h1>
              {event.rating && (
                <div className="flex items-center gap-2 mb-6">
                  <Star className="size-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{event.rating.toFixed(1)}</span>
                  <span className="text-gray-500 dark:text-gray-400">({event.review_count} reviews)</span>
                </div>
              )}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Calendar className="size-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{formatDate(event.schedule.start_datetime)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatTime(event.schedule.start_datetime)} â€“ {formatTime(event.schedule.end_datetime)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{event.venue.venue_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{event.venue.address_line1}, {event.venue.city}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Ticket className="size-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Organized by</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{event.organizer_name || event.organizer_profile?.organization_name}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => { const t = event.ticket_types[0]; if (t) handleBuyTicket(t); }} disabled={saving}
                  className="px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">
                  Buy Ticket
                </button>
                <button onClick={handleSaveEvent}
                  className={`px-6 py-3 border-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    isSaved
                      ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                      : 'bg-white dark:bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
                  }`}>
                  <Bookmark className={`size-4 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* About */}
        <section className="rounded-xl p-8 shadow-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About This Event</h2>
          <p className="leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">{event.description}</p>
        </section>

        {/* Location */}
        <section className="rounded-xl p-8 shadow-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Event Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div>
                <div className="font-semibold mb-1 text-gray-900 dark:text-white">Venue</div>
                <div className="text-gray-700 dark:text-gray-300">{event.venue.venue_name}</div>
              </div>
              <div>
                <div className="font-semibold mb-1 text-gray-900 dark:text-white">Address</div>
                <div className="text-gray-700 dark:text-gray-300">{event.venue.address_line1}<br />{event.venue.city}, {event.venue.region}</div>
              </div>
            </div>
            <div className="rounded-lg h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <MapPin className="size-12 text-gray-400" />
            </div>
          </div>
        </section>

        {/* Tickets */}
        <section className="rounded-xl p-8 shadow-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Select Ticket Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.ticket_types.map((ticket) => (
              <div key={ticket.id} className="border-2 rounded-xl p-6 transition-colors border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-white">{ticket.tier_name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.remaining_quantity} / {ticket.capacity} available</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{ticket.price}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{ticket.currency}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => handleQuantityChange(ticket.id, -1)}
                    className="size-8 flex items-center justify-center rounded border transition-colors border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Minus className="size-4" />
                  </button>
                  <span className="font-semibold w-8 text-center text-gray-900 dark:text-white">{quantities[ticket.id] || 1}</span>
                  <button onClick={() => handleQuantityChange(ticket.id, 1)}
                    className="size-8 flex items-center justify-center rounded border transition-colors border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Plus className="size-4" />
                  </button>
                </div>
                <button onClick={() => handleBuyTicket(ticket)} disabled={saving || ticket.remaining_quantity === 0}
                  className="w-full px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">
                  {ticket.remaining_quantity === 0 ? 'Sold Out' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        {event.reviews.length > 0 && (
          <section className="rounded-xl p-8 shadow-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Attendee Reviews</h2>
            <div className="space-y-6">
              {event.reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-0 border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {(review.user_name || review.user?.full_name || 'A')[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{review.user_name || review.user?.full_name}</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`size-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{review.review_text}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

