import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Calendar, MapPin, Clock, Star, Bookmark, Minus, Plus, Ticket } from 'lucide-react';
import type { EventDetailResponse, TicketType } from '../types';
import { mockApi } from '../services/mockApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<EventDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEvent(eventId);
      checkIfSaved(eventId);
    }
  }, [eventId]);

  const loadEvent = async (id: string) => {
    setLoading(true);
    try {
      const data = await mockApi.getEventById(id);
      setEvent(data);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async (eventId: string) => {
    if (!isAuthenticated) return;
    try {
      const savedEvents = await mockApi.getSavedEvents();
      const isEventSaved = savedEvents.some(saved => saved.event_id === eventId);
      setIsSaved(isEventSaved);
    } catch (error) {
      // Silently fail
    }
  };

  const handleQuantityChange = (ticketId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[ticketId] || 0;
      const newValue = Math.max(0, Math.min(10, current + delta));
      return { ...prev, [ticketId]: newValue };
    });
  };

  const handleBuyTicket = async (ticketType: TicketType) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase tickets');
      navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }

    const quantity = quantities[ticketType.id] || 1;
    setSaving(true);
    try {
      await mockApi.saveTicket(event!.id, ticketType.id, quantity);
      toast.success('Ticket reserved! Complete checkout within 15 minutes.');
      navigate('/saved-tickets');
    } catch (error) {
      toast.error('Failed to reserve ticket');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save events');
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await mockApi.unsaveEvent(event!.id);
        toast.success('Event removed from saved list');
        setIsSaved(false);
      } else {
        await mockApi.saveEvent(event!.id);
        toast.success('Event saved!');
        setIsSaved(true);
      }
    } catch (error) {
      toast.error('Failed to save event');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-gray-300 border-t-gray-900 rounded-full mb-4" />
          <p className="text-gray-500">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Event not found</p>
          <Link to="/discover" className="text-gray-900 underline">
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Event Image */}
            <div className="relative">
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {event.is_featured && (
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-yellow-400 text-gray-900 rounded-full text-sm font-semibold">
                  Featured
                </div>
              )}
            </div>

            {/* Event Info */}
            <div>
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-4">
                {event.category_name}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>

              {event.rating && (
                <div className="flex items-center gap-2 mb-6">
                  <Star className="size-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold text-gray-900">{event.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({event.review_count} reviews)</span>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Calendar className="size-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(event.schedule.start_datetime)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(event.schedule.start_datetime)} - {formatTime(event.schedule.end_datetime)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">{event.venue.venue_name}</div>
                    <div className="text-sm text-gray-500">
                      {event.venue.address_line1}, {event.venue.city}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Ticket className="size-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Organized by</div>
                    <div className="text-sm text-gray-500">{event.organizer_name}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const firstTicket = event.ticket_types[0];
                    if (firstTicket) handleBuyTicket(firstTicket);
                  }}
                  disabled={saving}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Buy Ticket
                </button>
                <button
                  onClick={handleSaveEvent}
                  className={`px-6 py-3 border-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    isSaved 
                      ? 'bg-gray-900 border-gray-900 text-white hover:bg-gray-800' 
                      : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                >
                  <Bookmark className={`size-4 ${isSaved ? 'fill-white' : ''}`} />
                  {isSaved ? 'Saved' : 'Save Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* About This Event */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </section>

        {/* Event Location */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-gray-900 mb-1">Venue</div>
                <div className="text-gray-700">{event.venue.venue_name}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Address</div>
                <div className="text-gray-700">
                  {event.venue.address_line1}
                  {event.venue.address_line2 && <>, {event.venue.address_line2}</>}
                  <br />
                  {event.venue.city}, {event.venue.region}
                </div>
              </div>
              {event.venue.online_meeting_url && (
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Online Link</div>
                  <a href={event.venue.online_meeting_url} className="text-blue-600 hover:underline">
                    Join Virtual Event
                  </a>
                </div>
              )}
            </div>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <MapPin className="size-12 text-gray-400" />
            </div>
          </div>
        </section>

        {/* Select Ticket Type */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Ticket Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.ticket_types.map((ticket) => (
              <div
                key={ticket.id}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-400 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{ticket.tier_name}</h3>
                    <p className="text-sm text-gray-500">
                      {ticket.remaining_quantity} / {ticket.capacity} available
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{ticket.price}</div>
                    <div className="text-sm text-gray-500">{ticket.currency}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => handleQuantityChange(ticket.id, -1)}
                    className="size-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="font-semibold text-gray-900 w-8 text-center">
                    {quantities[ticket.id] || 1}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(ticket.id, 1)}
                    className="size-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleBuyTicket(ticket)}
                  disabled={saving || ticket.remaining_quantity === 0}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ticket.remaining_quantity === 0 ? 'Sold Out' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Attendee Reviews */}
        {event.reviews.length > 0 && (
          <section className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendee Reviews</h2>
            <div className="space-y-6">
              {event.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-gray-700">
                        {review.user_name?.[0] || 'A'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{review.user_name}</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 ml-13">{review.review_text}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}