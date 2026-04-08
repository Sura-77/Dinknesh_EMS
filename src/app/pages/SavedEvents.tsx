import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Calendar, MapPin, Bookmark, Trash2 } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface SavedEvent {
  id: string;
  user_id: string;
  event_id: string;
  event?: any;
  saved_at: string;
}

export function SavedEvents() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view saved events');
      navigate('/login');
      return;
    }
    loadSavedEvents();
  }, [isAuthenticated, navigate]);

  const loadSavedEvents = async () => {
    try {
      const data = await mockApi.getSavedEvents();
      setSavedEvents(data);
    } catch (error) {
      toast.error('Failed to load saved events');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (eventId: string) => {
    try {
      await mockApi.unsaveEvent(eventId);
      setSavedEvents(prev => prev.filter(saved => saved.event_id !== eventId));
      toast.success('Event removed from saved list');
    } catch (error) {
      toast.error('Failed to remove event');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-gray-300 border-t-gray-900 rounded-full mb-4" />
          <p className="text-gray-500">Loading saved events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="size-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Saved Events</h1>
          </div>
          <p className="text-gray-600">
            Events you've bookmarked for later • {savedEvents.length} {savedEvents.length === 1 ? 'event' : 'events'}
          </p>
        </div>

        {savedEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Bookmark className="size-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Saved Events</h2>
            <p className="text-gray-600 mb-6">
              You haven't saved any events yet. Browse events and save your favorites!
            </p>
            <Link
              to="/discover"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedEvents.map((saved) => {
              const event = saved.event;
              if (!event) return null;

              return (
                <div
                  key={saved.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="relative">
                    <Link to={`/events/${event.id}`}>
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <button
                      onClick={() => handleUnsave(event.id)}
                      className="absolute top-3 right-3 size-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                      title="Remove from saved"
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </button>
                  </div>

                  <div className="p-5">
                    <Link to={`/events/${event.id}`}>
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:underline">
                        {event.title}
                      </h3>
                    </Link>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-gray-400" />
                        <span>{formatDate(event.schedule?.start_datetime || event.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-gray-400" />
                        <span className="line-clamp-1">
                          {event.venue?.venue_name || event.venue?.city || 'Location TBA'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Saved {formatDate(saved.saved_at)}
                        </div>
                        <Link
                          to={`/events/${event.id}`}
                          className="text-sm font-semibold text-gray-900 hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
