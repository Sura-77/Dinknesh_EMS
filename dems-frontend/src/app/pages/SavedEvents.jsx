import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Calendar, MapPin, Bookmark, Trash2 } from 'lucide-react';
import { api as mockApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function SavedEvents() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [savedEvents, setSavedEvents] = useState([]);
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

  const handleUnsave = async (eventId) => {
    try {
      await mockApi.unsaveEvent(eventId);
      setSavedEvents(prev => prev.filter(saved => saved.event_id !== eventId));
      toast.success('Event removed from saved list');
    } catch (error) {
      toast.error('Failed to remove event');
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
    <div className="min-h-screen py-12 px-6 transition-colors bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="size-8 text-gray-900 dark:text-white" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saved Events</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Events you've bookmarked for later • {savedEvents.length} {savedEvents.length === 1 ? 'event' : 'events'}
          </p>
        </div>

        {savedEvents.length === 0 ? (
          <div className="rounded-xl shadow-sm p-12 text-center bg-white dark:bg-gray-900">
            <Bookmark className="size-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Saved Events</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't saved any events yet.</p>
            <Link to="/discover" className="inline-block px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">Browse Events</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedEvents.map((saved) => {
              const event = saved.event;
              if (!event) return null;
              return (
                <div key={saved.id} className="rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div className="relative">
                    <Link to={`/events/${event.id}`}>
                      <div className="aspect-video overflow-hidden">
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    </Link>
                    <button onClick={() => handleUnsave(event.id)} className="absolute top-3 right-3 size-10 rounded-full flex items-center justify-center shadow-lg transition-colors bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900">
                      <Trash2 className="size-4 text-red-500" />
                    </button>
                  </div>
                  <div className="p-5">
                    <Link to={`/events/${event.id}`}>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:underline text-gray-900 dark:text-white">{event.title}</h3>
                    </Link>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-gray-400" />
                        <span>{formatDate(event.schedule?.start_datetime || event.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-gray-400" />
                        <span className="line-clamp-1">{event.venue?.venue_name || event.venue?.city || 'Location TBA'}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Saved {formatDate(saved.saved_at)}</div>
                      <Link to={`/events/${event.id}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:underline">View Details</Link>
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
