import { Link } from 'react-router';
import { Calendar, MapPin, Star } from 'lucide-react';
import type { Event } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link
      to={`/events/${event.id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        {event.thumbnail_url ? (
          <img
            src={event.thumbnail_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Calendar className="size-12 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-4">
        {event.category_name && (
          <div className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded mb-2">
            {event.category_name}
          </div>
        )}

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700">
          {event.title}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {event.description}
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="size-4" />
            <span>{formatDate(event.created_at)}</span>
          </div>

          {event.organizer_name && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="size-4" />
              <span>{event.organizer_name}</span>
            </div>
          )}

          {event.rating && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900">{event.rating.toFixed(1)}</span>
              <span>({event.review_count} reviews)</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
