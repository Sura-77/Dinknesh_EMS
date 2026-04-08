import { Link } from 'react-router';
import { Calendar, MapPin, Star } from 'lucide-react';
import type { Event } from '../types';

interface EventCardProps { event: Event; }

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const categoryName = event.category_name || (event as any).category?.name;

  return (
    <Link to={`/events/${event.id}`}
      className="group block rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border
        bg-white dark:bg-gray-900
        border-gray-100 dark:border-gray-800">
      <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {event.thumbnail_url ? (
          <img src={event.thumbnail_url} alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
            <Calendar className="size-12 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-4">
        {categoryName && (
          <div className="inline-block px-2 py-1 text-xs font-medium rounded mb-2
            bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {categoryName}
          </div>
        )}
        <h3 className="font-semibold mb-2 line-clamp-2 transition-colors
          text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300">
          {event.title}
        </h3>
        <p className="text-sm line-clamp-2 mb-3 text-gray-600 dark:text-gray-400">
          {event.description}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="size-4" />
            <span>{formatDate(event.created_at)}</span>
          </div>
          {event.organizer_name && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="size-4" />
              <span>{event.organizer_name}</span>
            </div>
          )}
          {event.rating && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900 dark:text-white">{event.rating.toFixed(1)}</span>
              <span>({event.review_count} reviews)</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
